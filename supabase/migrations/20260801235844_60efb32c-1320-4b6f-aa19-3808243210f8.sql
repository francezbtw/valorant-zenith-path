-- 1. Site settings (singleton)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name text NOT NULL DEFAULT 'Projeto Radiante',
  logo_url text,
  banner_url text,
  support_email text,
  instagram_url text,
  youtube_url text,
  twitter_url text,
  tiktok_url text,
  discord_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings_public_read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings_admin_write" ON public.site_settings FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER site_settings_touch BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.site_settings (project_name, support_email) VALUES ('Projeto Radiante', 'suporte@projetoradiante.com');

-- 2. Lessons: thumbnail + exercises
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS thumbnail_url text;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS exercises jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 3. Profiles: blocked + last access
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blocked boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;