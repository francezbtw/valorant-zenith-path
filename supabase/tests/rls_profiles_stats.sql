-- Automated RLS tests for public.profiles and public.student_stats.
--
-- Runs read-only: everything happens inside a transaction that is rolled back,
-- and no fixture rows are written (policy expressions are evaluated directly
-- against synthetic values).
--
-- Run with:  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls_profiles_stats.sql

\set ON_ERROR_STOP on

begin;

/* ------------------------------------------------------------------ */
/* Helper: does any policy on <table> allow <cmd> for this actor?       */
/* ------------------------------------------------------------------ */
create function pg_temp.policy_allows(
  _table    text,
  _cmd      text,
  _actor    uuid,
  _target   uuid,
  _admin    boolean,
  _mentor   boolean,
  _support  boolean
) returns boolean language plpgsql as $fn$
declare
  pol      record;
  expr     text;
  allowed  boolean := false;
  result   boolean;
begin
  for pol in
    select policyname, cmd, coalesce(qual, with_check) as predicate, roles
    from pg_policies
    where schemaname = 'public'
      and tablename = _table
      and cmd in (_cmd, 'ALL')
  loop
    -- policies restricted to roles the actor is not in never apply
    if not (pol.roles && array['authenticated', 'public']::name[]) then
      continue;
    end if;

    expr := coalesce(pol.predicate, 'true');
    -- role helpers query user_roles (FK-bound to auth.users), so simulate them
    expr := replace(expr, 'is_admin()',   case when _admin   then 'true' else 'false' end);
    expr := replace(expr, 'is_mentor()',  case when _mentor  then 'true' else 'false' end);
    expr := replace(expr, 'is_support()', case when _support then 'true' else 'false' end);
    expr := replace(expr, 'auth.uid()',   quote_literal(_actor::text) || '::uuid');

    execute format(
      'select coalesce((select (%s) from (select %L::uuid as id, %L::uuid as user_id) as %I), false)',
      expr, _target, _target, _table
    ) into result;

    allowed := allowed or coalesce(result, false);
  end loop;

  return allowed;
end;
$fn$;

/* ------------------------------------------------------------------ */
/* 1. Static hardening checks                                          */
/* ------------------------------------------------------------------ */
do $$
declare
  bad text;
begin
  -- RLS must be enabled on both tables
  select string_agg(relname, ', ') into bad
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname in ('profiles', 'student_stats') and not c.relrowsecurity;
  if bad is not null then
    raise exception 'FAIL: row level security disabled on %', bad;
  end if;

  -- no permissive "always true" read policy
  select string_agg(tablename || '.' || policyname, ', ') into bad
  from pg_policies
  where schemaname = 'public'
    and tablename in ('profiles', 'student_stats')
    and cmd in ('SELECT', 'ALL')
    and (qual is null or btrim(qual) = 'true');
  if bad is not null then
    raise exception 'FAIL: unrestricted read policy: %', bad;
  end if;

  -- policies must never target anon / public
  select string_agg(tablename || '.' || policyname, ', ') into bad
  from pg_policies
  where schemaname = 'public'
    and tablename in ('profiles', 'student_stats')
    and roles && array['anon', 'public']::name[];
  if bad is not null then
    raise exception 'FAIL: policy exposed to anonymous role: %', bad;
  end if;

  -- anon must hold no privileges on the sensitive tables
  select string_agg(c.relname, ', ') into bad
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname in ('profiles', 'student_stats')
    and (has_table_privilege('anon', c.oid, 'SELECT')
      or has_table_privilege('anon', c.oid, 'INSERT')
      or has_table_privilege('anon', c.oid, 'UPDATE')
      or has_table_privilege('anon', c.oid, 'DELETE'));
  if bad is not null then
    raise exception 'FAIL: anon has privileges on %', bad;
  end if;

  -- the community view must not leak e-mail addresses
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'public_profiles' and column_name = 'email'
  ) then
    raise exception 'FAIL: public_profiles exposes email';
  end if;

  raise notice 'OK: static hardening checks';
end;
$$;

/* ------------------------------------------------------------------ */
/* 2. Role matrix                                                      */
/* ------------------------------------------------------------------ */
do $$
declare
  aluno   uuid := '11111111-1111-1111-1111-111111111111';
  outro   uuid := '22222222-2222-2222-2222-222222222222';
  admin   uuid := '33333333-3333-3333-3333-333333333333';
  mentor  uuid := '44444444-4444-4444-4444-444444444444';
  suporte uuid := '55555555-5555-5555-5555-555555555555';
  t       record;
  got     boolean;
  fails   text := '';
begin
  for t in
    select * from (values
      -- table, cmd, label, actor, target, admin, mentor, support, expected
      ('profiles','SELECT','aluno reads own profile',        aluno,  aluno, false,false,false, true),
      ('profiles','SELECT','aluno reads another profile',    aluno,  outro, false,false,false, false),
      ('profiles','SELECT','mentor reads student profile',   mentor, outro, false,true, false, false),
      ('profiles','SELECT','suporte reads student profile',  suporte,outro, false,false,true,  false),
      ('profiles','SELECT','admin reads any profile',        admin,  outro, true, false,false, true),
      ('profiles','UPDATE','aluno updates own profile',      aluno,  aluno, false,false,false, true),
      ('profiles','UPDATE','aluno updates another profile',  aluno,  outro, false,false,false, false),
      ('profiles','UPDATE','mentor updates student profile', mentor, outro, false,true, false, false),
      ('profiles','UPDATE','suporte updates profile',        suporte,outro, false,false,true,  false),
      ('profiles','UPDATE','admin updates any profile',      admin,  outro, true, false,false, true),
      ('profiles','DELETE','aluno deletes another profile',  aluno,  outro, false,false,false, false),
      ('profiles','DELETE','mentor deletes profile',         mentor, outro, false,true, false, false),
      ('profiles','DELETE','suporte deletes profile',        suporte,outro, false,false,true,  false),
      ('profiles','DELETE','admin deletes profile',          admin,  outro, true, false,false, true),

      ('student_stats','SELECT','aluno reads own stats',        aluno,  aluno, false,false,false, true),
      ('student_stats','SELECT','aluno reads other stats',      aluno,  outro, false,false,false, false),
      ('student_stats','SELECT','mentor reads student stats',   mentor, outro, false,true, false, true),
      ('student_stats','SELECT','suporte reads student stats',  suporte,outro, false,false,true,  false),
      ('student_stats','SELECT','admin reads any stats',        admin,  outro, true, false,false, true),
      ('student_stats','UPDATE','aluno updates own stats',      aluno,  aluno, false,false,false, true),
      ('student_stats','UPDATE','aluno updates other stats',    aluno,  outro, false,false,false, false),
      ('student_stats','UPDATE','mentor updates student stats', mentor, outro, false,true, false, false),
      ('student_stats','UPDATE','suporte updates stats',        suporte,outro, false,false,true,  false),
      ('student_stats','UPDATE','admin updates any stats',      admin,  outro, true, false,false, true),
      ('student_stats','DELETE','aluno deletes other stats',    aluno,  outro, false,false,false, false),
      ('student_stats','DELETE','mentor deletes stats',         mentor, outro, false,true, false, false),
      ('student_stats','DELETE','suporte deletes stats',        suporte,outro, false,false,true,  false),
      ('student_stats','DELETE','admin deletes stats',          admin,  outro, true, false,false, true)
    ) as v(tbl, cmd, label, actor, target, is_admin, is_mentor, is_support, expected)
  loop
    got := pg_temp.policy_allows(t.tbl, t.cmd, t.actor, t.target, t.is_admin, t.is_mentor, t.is_support);
    if got is distinct from t.expected then
      fails := fails || format(E'\n  FAIL [%s %s] %s: expected %s, got %s', t.tbl, t.cmd, t.label, t.expected, got);
    else
      raise notice 'ok  [% %] %', t.tbl, t.cmd, t.label;
    end if;
  end loop;

  if fails <> '' then
    raise exception 'RLS role matrix failures:%', fails;
  end if;
end;
$$;

select 'RLS_TESTS_PASSED' as result;

rollback;
