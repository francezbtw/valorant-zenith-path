ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'mentor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'support';

ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS seats_limit integer,
  ADD COLUMN IF NOT EXISTS seats_taken integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS enrollment_opens_at timestamptz,
  ADD COLUMN IF NOT EXISTS enrollment_closes_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_promo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS promo_price_cents integer,
  ADD COLUMN IF NOT EXISTS compare_at_price_cents integer;

ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS plan_slugs text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS release_at timestamptz,
  ADD COLUMN IF NOT EXISTS min_tier public.plan_tier;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS refunded_cents integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  entity text,
  entity_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.admin_logs TO authenticated;
GRANT ALL ON public.admin_logs TO service_role;

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read admin logs" ON public.admin_logs;
CREATE POLICY "Admins read admin logs" ON public.admin_logs
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Staff insert admin logs" ON public.admin_logs;
CREATE POLICY "Staff insert admin logs" ON public.admin_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_id);

CREATE INDEX IF NOT EXISTS admin_logs_created_at_idx ON public.admin_logs (created_at DESC);

CREATE OR REPLACE FUNCTION public.is_support()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::text IN ('support','admin')
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_support() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_support() TO authenticated;