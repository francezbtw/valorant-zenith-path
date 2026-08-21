-- profiles: remove blanket read access
DROP POLICY IF EXISTS "public profile fields readable by members" ON public.profiles;

-- public_profiles view exposes only non-sensitive fields, bypassing base-table RLS
ALTER VIEW public.public_profiles SET (security_invoker = false);
REVOKE ALL ON public.public_profiles FROM anon;
GRANT SELECT ON public.public_profiles TO authenticated;

-- student_stats: only owner and admins can read the full row
DROP POLICY IF EXISTS "stats readable by members" ON public.student_stats;
CREATE POLICY "own stats select" ON public.student_stats
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin() OR public.is_mentor());

-- leaderboard view with only ranking-relevant columns
CREATE OR REPLACE VIEW public.student_stats_public AS
  SELECT user_id, xp, streak_days, active_days, hours_studied,
         headshot_pct, win_rate, mentorships_done,
         entry_tier, current_tier, goal_tier, joined_at
  FROM public.student_stats;
ALTER VIEW public.student_stats_public SET (security_invoker = false);
REVOKE ALL ON public.student_stats_public FROM anon;
GRANT SELECT ON public.student_stats_public TO authenticated;
