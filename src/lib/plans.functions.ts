import { createServerFn } from "@tanstack/react-start";
import type { PlanTier } from "@/lib/member";

export type PublicPlan = {
  slug: string;
  name: string;
  tier: PlanTier;
  tagline: string | null;
  description: string | null;
  price_cents: number;
  currency: string;
  features: string[];
  highlight: boolean;
  position: number;
};

function publicClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(process.env.SUPABASE_URL!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    }),
  );
}

const COLUMNS = "slug, name, tier, tagline, description, price_cents, currency, features, highlight, position";

function normalize(row: Record<string, unknown>): PublicPlan {
  const raw = row.features;
  const features = Array.isArray(raw) ? raw.map(String) : [];
  return { ...(row as unknown as PublicPlan), features };
}

/** Lista pública dos planos ativos (usada na landing e no checkout). */
export const listPlans = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await publicClient();
  const { data, error } = await supabase
    .from("plans")
    .select(COLUMNS)
    .eq("active", true)
    .order("position");
  if (error) throw error;
  return (data ?? []).map(normalize);
});

/** Plano único por slug — base da página de checkout. */
export const getPlan = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => {
    if (!input?.slug) throw new Error("Plano inválido");
    return input;
  })
  .handler(async ({ data }) => {
    const supabase = await publicClient();
    const { data: plan, error } = await supabase
      .from("plans")
      .select(COLUMNS)
      .eq("slug", data.slug)
      .eq("active", true)
      .maybeSingle();
    if (error) throw error;
    return plan ? normalize(plan) : null;
  });
