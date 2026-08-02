ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS description text;

UPDATE public.enrollments SET status = 'active' WHERE status NOT IN ('active','canceled','pending','expired');
ALTER TABLE public.enrollments ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS enrollments_status_check;
ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_status_check CHECK (status IN ('active','canceled','pending','expired'));
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS canceled_at timestamptz;

UPDATE public.payments SET status = 'pending' WHERE status NOT IN ('pending','paid','refunded','failed');
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check CHECK (status IN ('pending','paid','refunded','failed'));

CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_ref_key ON public.payments (provider, provider_ref) WHERE provider IS NOT NULL AND provider_ref IS NOT NULL;
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments (user_id);