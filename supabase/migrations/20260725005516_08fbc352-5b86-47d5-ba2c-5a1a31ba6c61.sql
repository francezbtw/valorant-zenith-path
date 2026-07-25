
create or replace function public.current_plan(_user_id uuid)
returns public.plan_tier language sql stable security invoker set search_path = public as $$
  select e.plan from public.enrollments e
  where e.user_id = _user_id
    and e.status = 'active'
    and (e.expires_at is null or e.expires_at > now())
  limit 1
$$;

create or replace function public.has_plan_access(_user_id uuid, _required public.plan_tier)
returns boolean language sql stable security invoker set search_path = public as $$
  select coalesce(public.plan_rank(public.current_plan(_user_id)) >= public.plan_rank(_required), false)
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.touch_updated_at() from public, anon, authenticated;
revoke all on function public.plan_rank(public.plan_tier) from public, anon;
revoke all on function public.current_plan(uuid) from public, anon;
revoke all on function public.has_plan_access(uuid, public.plan_tier) from public, anon;
grant execute on function public.plan_rank(public.plan_tier) to authenticated;
grant execute on function public.current_plan(uuid) to authenticated;
grant execute on function public.has_plan_access(uuid, public.plan_tier) to authenticated;
