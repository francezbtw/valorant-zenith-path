-- =========================================================
-- 1. ROLES
-- =========================================================
do $$ begin
  create type public.app_role as enum ('admin', 'moderator', 'user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin')
$$;

drop policy if exists "own roles select" on public.user_roles;
create policy "own roles select" on public.user_roles
  for select to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "admins manage roles" on public.user_roles;
create policy "admins manage roles" on public.user_roles
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- 2. COURSES
-- =========================================================
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  cover_url text,
  min_tier public.plan_tier not null default 'basico',
  published boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.courses to authenticated;
grant all on public.courses to service_role;
alter table public.courses enable row level security;

create policy "courses readable" on public.courses
  for select to authenticated using (published or public.is_admin());
create policy "admins manage courses" on public.courses
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create trigger courses_touch before update on public.courses
  for each row execute function public.touch_updated_at();

alter table public.modules add column if not exists course_id uuid references public.courses(id) on delete set null;
alter table public.modules add column if not exists published boolean not null default true;
alter table public.modules add column if not exists updated_at timestamptz not null default now();
alter table public.lessons add column if not exists published boolean not null default true;
alter table public.lessons add column if not exists updated_at timestamptz not null default now();

drop trigger if exists modules_touch on public.modules;
create trigger modules_touch before update on public.modules
  for each row execute function public.touch_updated_at();
drop trigger if exists lessons_touch on public.lessons;
create trigger lessons_touch before update on public.lessons
  for each row execute function public.touch_updated_at();

-- =========================================================
-- 3. PLANS
-- =========================================================
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tier public.plan_tier not null,
  tagline text,
  price_cents integer not null default 0,
  currency text not null default 'BRL',
  features jsonb not null default '[]'::jsonb,
  highlight boolean not null default false,
  active boolean not null default true,
  checkout_url text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.plans to authenticated;
grant select on public.plans to anon;
grant all on public.plans to service_role;
alter table public.plans enable row level security;

create policy "plans public read" on public.plans
  for select to anon using (active);
create policy "plans readable" on public.plans
  for select to authenticated using (active or public.is_admin());
create policy "admins manage plans" on public.plans
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create trigger plans_touch before update on public.plans
  for each row execute function public.touch_updated_at();

-- =========================================================
-- 4. PAYMENTS
-- =========================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan public.plan_tier,
  amount_cents integer not null default 0,
  currency text not null default 'BRL',
  status text not null default 'pending',
  provider text,
  provider_ref text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;

create policy "own payments select" on public.payments
  for select to authenticated using (auth.uid() = user_id or public.is_admin());
create policy "admins manage payments" on public.payments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create trigger payments_touch before update on public.payments
  for each row execute function public.touch_updated_at();

-- =========================================================
-- 5. COUPONS
-- =========================================================
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null default 'percent',
  discount_value integer not null default 0,
  max_uses integer,
  uses integer not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.coupons to authenticated;
grant all on public.coupons to service_role;
alter table public.coupons enable row level security;

create policy "coupons readable" on public.coupons
  for select to authenticated using (active or public.is_admin());
create policy "admins manage coupons" on public.coupons
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create trigger coupons_touch before update on public.coupons
  for each row execute function public.touch_updated_at();

-- =========================================================
-- 6. MENTORSHIPS
-- =========================================================
create table if not exists public.mentorships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mentor_name text not null default 'QCK',
  title text not null,
  notes text,
  scheduled_at timestamptz,
  duration_minutes integer not null default 60,
  status text not null default 'scheduled',
  meeting_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.mentorships to authenticated;
grant all on public.mentorships to service_role;
alter table public.mentorships enable row level security;

create policy "own mentorships select" on public.mentorships
  for select to authenticated using (auth.uid() = user_id or public.is_admin());
create policy "admins manage mentorships" on public.mentorships
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create trigger mentorships_touch before update on public.mentorships
  for each row execute function public.touch_updated_at();

-- =========================================================
-- 7. ADMIN POLICIES ON EXISTING TABLES
-- =========================================================
create policy "admins manage profiles" on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admins manage enrollments" on public.enrollments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admins manage modules" on public.modules
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admins manage lessons" on public.lessons
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admins manage announcements" on public.announcements
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admins read progress" on public.lesson_progress
  for select to authenticated using (public.is_admin());

create policy "admins read valorant accounts" on public.valorant_accounts
  for select to authenticated using (public.is_admin());

create policy "admins read rank history" on public.rank_history
  for select to authenticated using (public.is_admin());

-- =========================================================
-- 8. SEED PLANS
-- =========================================================
insert into public.plans (slug, name, tier, tagline, price_cents, features, highlight, position)
values
  ('basico','BÁSICO','basico','Ideal para quem quer começar.',9700,
   '["Curso base completo","Rotina de treinos","Atualizações inclusas","Acesso ao conteúdo"]'::jsonb,false,1),
  ('intermediario','INTERMEDIÁRIO','intermediario','O mais escolhido.',19700,
   '["Tudo do Básico","Conteúdo avançado por mapa","Aulas extras semanais","Análises guiadas","Comunidade exclusiva","Atualizações prioritárias"]'::jsonb,true,2),
  ('mentoria','MENTORIA','mentoria','Acompanhamento 1:1 com o QCK.',49700,
   '["Tudo do Intermediário","Mentoria individual com QCK","Análise de VOD personalizada","Plano de evolução sob medida","Suporte direto no Discord"]'::jsonb,false,3)
on conflict (slug) do nothing;