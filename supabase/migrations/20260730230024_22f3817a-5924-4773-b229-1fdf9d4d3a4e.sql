-- Modules: respect published + plan tier
DROP POLICY IF EXISTS "modules readable by members" ON public.modules;
CREATE POLICY "modules readable by members"
ON public.modules FOR SELECT TO authenticated
USING (public.is_admin() OR (published AND public.has_plan_access(auth.uid(), tier)));

-- Lessons: also require published
DROP POLICY IF EXISTS "lessons readable with plan" ON public.lessons;
CREATE POLICY "lessons readable with plan"
ON public.lessons FOR SELECT TO authenticated
USING (
  public.is_admin() OR (
    published AND public.has_plan_access(
      auth.uid(),
      (SELECT m.tier FROM public.modules m WHERE m.id = lessons.module_id)
    )
  )
);

-- Courses: respect min_tier
DROP POLICY IF EXISTS "courses readable" ON public.courses;
CREATE POLICY "courses readable"
ON public.courses FOR SELECT TO authenticated
USING (public.is_admin() OR (published AND public.has_plan_access(auth.uid(), min_tier)));

-- Lock down internal helper functions from anonymous callers
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_plan_access(uuid, plan_tier) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_plan(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.plan_rank(plan_tier) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_plan_access(uuid, plan_tier) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_plan(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.plan_rank(plan_tier) TO authenticated;