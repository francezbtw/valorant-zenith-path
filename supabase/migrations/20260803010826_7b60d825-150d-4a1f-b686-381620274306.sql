
alter table public.mentorships
  add column if not exists feedback text,
  add column if not exists feedback_at timestamptz,
  add column if not exists attachments jsonb not null default '[]'::jsonb,
  add column if not exists completed_at timestamptz;

create or replace function public.is_mentor()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'moderator')
$$;

drop policy if exists "own mentorships select" on public.mentorships;
create policy "own mentorships select" on public.mentorships
  for select to authenticated using (auth.uid() = user_id or public.is_mentor());

create policy "students request mentorships" on public.mentorships
  for insert to authenticated with check (auth.uid() = user_id);

create policy "mentors manage mentorships" on public.mentorships
  for update to authenticated using (public.is_mentor()) with check (public.is_mentor());

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  kind text not null default 'mentorship',
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;

alter table public.notifications enable row level security;

create policy "own notifications select" on public.notifications
  for select to authenticated using (auth.uid() = user_id or public.is_mentor());
create policy "mentors create notifications" on public.notifications
  for insert to authenticated with check (public.is_mentor());
create policy "own notifications update" on public.notifications
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own notifications delete" on public.notifications
  for delete to authenticated using (auth.uid() = user_id);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
