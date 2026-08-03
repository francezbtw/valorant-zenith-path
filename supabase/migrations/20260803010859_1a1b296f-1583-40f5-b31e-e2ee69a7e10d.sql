
revoke execute on function public.is_mentor() from anon, public;
revoke execute on function public.is_admin() from anon, public;
revoke execute on function public.has_role(uuid, app_role) from anon, public;
grant execute on function public.is_mentor() to authenticated, service_role;
grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.has_role(uuid, app_role) to authenticated, service_role;
