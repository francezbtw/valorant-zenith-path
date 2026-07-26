import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const ROUTING: Record<string, string> = {
  br: "americas",
  na: "americas",
  latam: "americas",
  eu: "europe",
  ap: "asia",
  kr: "asia",
};

const schema = z.object({
  riotName: z.string().trim().min(1).max(32),
  riotTag: z.string().trim().min(1).max(8),
  region: z.string().trim().min(2).max(8),
});

export type RiotVerifyResult =
  | { status: "not_configured" }
  | { status: "found"; puuid: string; gameName: string; tagLine: string }
  | { status: "not_found" }
  | { status: "error"; message: string };

/**
 * Verificação do Riot ID pela API oficial.
 * Só funciona quando a secret RIOT_API_KEY estiver configurada — sem ela,
 * a estrutura fica pronta e o app segue funcionando manualmente.
 */
export const verifyRiotId = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }): Promise<RiotVerifyResult> => {
    const apiKey = process.env.RIOT_API_KEY;
    if (!apiKey) return { status: "not_configured" };

    const cluster = ROUTING[data.region] ?? "americas";
    const url = `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
      data.riotName,
    )}/${encodeURIComponent(data.riotTag)}`;

    try {
      const res = await fetch(url, { headers: { "X-Riot-Token": apiKey } });
      if (res.status === 404) return { status: "not_found" };
      if (!res.ok) return { status: "error", message: `Riot API respondeu ${res.status}` };
      const json = (await res.json()) as { puuid: string; gameName: string; tagLine: string };
      return { status: "found", puuid: json.puuid, gameName: json.gameName, tagLine: json.tagLine };
    } catch {
      return { status: "error", message: "Não foi possível falar com a Riot agora." };
    }
  });
