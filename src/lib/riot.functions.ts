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

const syncSchema = z.object({ region: z.string().trim().min(2).max(8).optional() });

export type RiotSyncResult =
  | { status: "not_configured"; message: string }
  | { status: "no_account" }
  | { status: "synced"; tier: string; rr: number }
  | { status: "error"; message: string };

/**
 * Sincronização automática do elo atual pela API da Riot.
 * Estrutura pronta: assim que a secret RIOT_API_KEY existir, este handler
 * consulta o ranked do jogador e grava uma nova linha em rank_history.
 */
export const syncValorantRank = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => syncSchema.parse(input ?? {}))
  .handler(async ({ context }): Promise<RiotSyncResult> => {
    const { supabase, userId } = context;

    const { data: account } = await supabase
      .from("valorant_accounts")
      .select("riot_name, riot_tag, region, puuid")
      .eq("user_id", userId)
      .maybeSingle();

    if (!account) return { status: "no_account" };

    const apiKey = process.env.RIOT_API_KEY;
    if (!apiKey) {
      return {
        status: "not_configured",
        message:
          "Chave da API da Riot ainda não configurada. Assim que ela existir, o elo é atualizado automaticamente.",
      };
    }

    try {
      const cluster = ROUTING[account.region] ?? "americas";
      let puuid = account.puuid;
      if (!puuid) {
        const res = await fetch(
          `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
            account.riot_name,
          )}/${encodeURIComponent(account.riot_tag)}`,
          { headers: { "X-Riot-Token": apiKey } },
        );
        if (!res.ok) return { status: "error", message: `Riot API respondeu ${res.status}` };
        const json = (await res.json()) as { puuid: string };
        puuid = json.puuid;
        await supabase
          .from("valorant_accounts")
          .update({ puuid, verified_at: new Date().toISOString() })
          .eq("user_id", userId);
      }

      // Endpoint de ranked (val-ranked / MMR). Ajustar quando a chave de produção liberar o acesso.
      const mmrRes = await fetch(
        `https://${cluster}.api.riotgames.com/val/ranked/v1/by-puuid/${puuid}`,
        { headers: { "X-Riot-Token": apiKey } },
      );
      if (!mmrRes.ok) {
        return { status: "error", message: `Ranked indisponível (${mmrRes.status}).` };
      }
      const mmr = (await mmrRes.json()) as { tier?: string; rr?: number };
      const tier = mmr.tier ?? "";
      const rr = Number(mmr.rr ?? 0);
      if (!tier) return { status: "error", message: "A Riot não retornou o elo atual." };

      await supabase.from("rank_history").insert({
        user_id: userId,
        rank_tier: tier,
        rr,
        recorded_at: new Date().toISOString().slice(0, 10),
        note: "Sincronizado com a API da Riot",
      });

      return { status: "synced", tier, rr };
    } catch {
      return { status: "error", message: "Não foi possível falar com a Riot agora." };
    }
  });
