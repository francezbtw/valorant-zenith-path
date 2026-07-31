-- ============ student_stats ============
create table public.student_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0,
  streak_days integer not null default 0,
  active_days integer not null default 0,
  hours_studied numeric not null default 0,
  headshot_pct numeric not null default 0,
  win_rate numeric not null default 0,
  mentorships_done integer not null default 0,
  entry_tier text,
  current_tier text,
  goal_tier text not null default 'Radiante',
  joined_at timestamptz not null default now(),
  last_active_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.student_stats to authenticated;
grant all on public.student_stats to service_role;
alter table public.student_stats enable row level security;
create policy "stats readable by members" on public.student_stats for select to authenticated using (true);
create policy "own stats insert" on public.student_stats for insert to authenticated with check (auth.uid() = user_id);
create policy "own stats update" on public.student_stats for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "admins manage stats" on public.student_stats for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger student_stats_touch before update on public.student_stats for each row execute function public.touch_updated_at();

-- ============ community_posts ============
create type public.post_kind as enum ('post', 'achievement', 'evolution', 'certificate');

create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind public.post_kind not null default 'post',
  body text not null default '',
  image_url text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index community_posts_created_idx on public.community_posts (created_at desc);
grant select, insert, update, delete on public.community_posts to authenticated;
grant all on public.community_posts to service_role;
alter table public.community_posts enable row level security;
create policy "posts readable by members" on public.community_posts for select to authenticated using (true);
create policy "own posts insert" on public.community_posts for insert to authenticated with check (auth.uid() = user_id);
create policy "own posts update" on public.community_posts for update to authenticated using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());
create policy "own posts delete" on public.community_posts for delete to authenticated using (auth.uid() = user_id or public.is_admin());
create trigger community_posts_touch before update on public.community_posts for each row execute function public.touch_updated_at();

-- ============ post_likes ============
create table public.post_likes (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
grant select, insert, delete on public.post_likes to authenticated;
grant all on public.post_likes to service_role;
alter table public.post_likes enable row level security;
create policy "likes readable by members" on public.post_likes for select to authenticated using (true);
create policy "own like insert" on public.post_likes for insert to authenticated with check (auth.uid() = user_id);
create policy "own like delete" on public.post_likes for delete to authenticated using (auth.uid() = user_id);

-- ============ post_comments ============
create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index post_comments_post_idx on public.post_comments (post_id, created_at);
grant select, insert, update, delete on public.post_comments to authenticated;
grant all on public.post_comments to service_role;
alter table public.post_comments enable row level security;
create policy "comments readable by members" on public.post_comments for select to authenticated using (true);
create policy "own comment insert" on public.post_comments for insert to authenticated with check (auth.uid() = user_id);
create policy "own comment update" on public.post_comments for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own comment delete" on public.post_comments for delete to authenticated using (auth.uid() = user_id or public.is_admin());
create trigger post_comments_touch before update on public.post_comments for each row execute function public.touch_updated_at();

-- ============ user_badges ============
create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_key text not null,
  awarded_at timestamptz not null default now(),
  unique (user_id, badge_key)
);
grant select on public.user_badges to authenticated;
grant all on public.user_badges to service_role;
alter table public.user_badges enable row level security;
create policy "badges readable by members" on public.user_badges for select to authenticated using (true);
create policy "admins manage badges" on public.user_badges for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============ student_tasks ============
create table public.student_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_key text not null,
  title text not null,
  done boolean not null default false,
  completed_at timestamptz,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, task_key)
);
grant select, insert, update, delete on public.student_tasks to authenticated;
grant all on public.student_tasks to service_role;
alter table public.student_tasks enable row level security;
create policy "own tasks" on public.student_tasks for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger student_tasks_touch before update on public.student_tasks for each row execute function public.touch_updated_at();

-- ============ public profile view (no email) ============
create or replace view public.public_profiles as
  select p.id, p.full_name, p.avatar_url, p.riot_id, p.current_rank, p.created_at
  from public.profiles p;
grant select on public.public_profiles to authenticated;

-- ============ realtime ============
alter table public.community_posts replica identity full;
alter table public.post_likes replica identity full;
alter table public.post_comments replica identity full;
alter publication supabase_realtime add table public.community_posts;
alter publication supabase_realtime add table public.post_likes;
alter publication supabase_realtime add table public.post_comments;