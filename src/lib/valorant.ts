export const VALORANT_REGIONS = [
  { value: "br", label: "Brasil (BR)" },
  { value: "na", label: "América do Norte (NA)" },
  { value: "latam", label: "LATAM" },
  { value: "eu", label: "Europa (EU)" },
  { value: "ap", label: "Ásia-Pacífico (AP)" },
  { value: "kr", label: "Coreia (KR)" },
] as const;

export const VALORANT_TIERS = [
  "Ferro 1", "Ferro 2", "Ferro 3",
  "Bronze 1", "Bronze 2", "Bronze 3",
  "Prata 1", "Prata 2", "Prata 3",
  "Ouro 1", "Ouro 2", "Ouro 3",
  "Platina 1", "Platina 2", "Platina 3",
  "Diamante 1", "Diamante 2", "Diamante 3",
  "Ascendente 1", "Ascendente 2", "Ascendente 3",
  "Imortal 1", "Imortal 2", "Imortal 3",
  "Radiante",
] as const;

export type ValorantTier = (typeof VALORANT_TIERS)[number];

/** Pontuação linear (tier * 100 + RR) usada para o gráfico de evolução. */
export function rankScore(tier: string, rr: number) {
  const idx = VALORANT_TIERS.indexOf(tier as ValorantTier);
  const base = idx < 0 ? 0 : idx;
  return base * 100 + Math.max(0, Math.min(100, rr));
}

export function scoreToTier(score: number) {
  const idx = Math.min(VALORANT_TIERS.length - 1, Math.max(0, Math.floor(score / 100)));
  return VALORANT_TIERS[idx];
}

export const TIER_COLOR: Record<string, string> = {
  Ferro: "#8A8A8A",
  Bronze: "#B07A46",
  Prata: "#C9D1D9",
  Ouro: "#E8C05A",
  Platina: "#3FC1C9",
  Diamante: "#B486FF",
  Ascendente: "#3BD16F",
  Imortal: "#FF4655",
  Radiante: "#FFF6A9",
};

export function tierColor(tier?: string | null) {
  if (!tier) return "#7B2EFF";
  const family = tier.split(" ")[0];
  return TIER_COLOR[family] ?? "#7B2EFF";
}

export function trackerUrl(riotName: string, riotTag: string) {
  return `https://tracker.gg/valorant/profile/riot/${encodeURIComponent(
    `${riotName}#${riotTag}`,
  )}/overview`;
}

export function formatRiotId(riotName?: string | null, riotTag?: string | null) {
  if (!riotName || !riotTag) return null;
  return `${riotName}#${riotTag}`;
}
