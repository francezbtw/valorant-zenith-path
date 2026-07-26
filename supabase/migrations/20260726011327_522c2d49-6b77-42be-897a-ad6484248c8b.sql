CREATE TABLE public.valorant_accounts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  riot_name text NOT NULL,
  riot_tag text NOT NULL,
  region text NOT NULL DEFAULT 'br',
  puuid text,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.valorant_accounts TO authenticated;
GRANT ALL ON public.valorant_accounts TO service_role;
ALTER TABLE public.valorant_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own valorant account" ON public.valorant_accounts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER touch_valorant_accounts BEFORE UPDATE ON public.valorant_accounts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.rank_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank_tier text NOT NULL,
  rr integer NOT NULL DEFAULT 0,
  recorded_at date NOT NULL DEFAULT current_date,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX rank_history_user_date_idx ON public.rank_history (user_id, recorded_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rank_history TO authenticated;
GRANT ALL ON public.rank_history TO service_role;
ALTER TABLE public.rank_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rank history" ON public.rank_history FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER touch_rank_history BEFORE UPDATE ON public.rank_history
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();