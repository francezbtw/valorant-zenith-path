-- view now runs with the querying user's permissions
alter view public.public_profiles set (security_invoker = true);

-- allow members to read each other's profiles, but only public columns
create policy "public profile fields readable by members"
  on public.profiles for select to authenticated using (true);

revoke select on public.profiles from authenticated;
grant select (id, full_name, avatar_url, riot_id, current_rank, created_at, updated_at)
  on public.profiles to authenticated;