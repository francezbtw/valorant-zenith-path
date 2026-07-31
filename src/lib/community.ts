import { VALORANT_TIERS, tierColor } from "@/lib/valorant";

export const TIER_FAMILIES = [
  "Ferro",
  "Bronze",
  "Prata",
  "Ouro",
  "Platina",
  "Diamante",
  "Ascendente",
  "Imortal",
  "Radiante",
] as const;

export type TierFamily = (typeof TIER_FAMILIES)[number];

export function tierFamily(tier?: string | null): TierFamily | null {
  if (!tier) return null;
  const fam = tier.split(" ")[0] as TierFamily;
  return TIER_FAMILIES.includes(fam) ? fam : null;
}

/** Index of the tier inside VALORANT_TIERS (0..24). -1 when unknown. */
export function tierIndex(tier?: string | null) {
  if (!tier) return -1;
  return VALORANT_TIERS.indexOf(tier as (typeof VALORANT_TIERS)[number]);
}

/** How many divisions the student climbed between entry and current tier. */
export function tierGain(entry?: string | null, current?: string | null) {
  const a = tierIndex(entry);
  const b = tierIndex(current);
  if (a < 0 || b < 0) return 0;
  return Math.max(0, b - a);
}

/** How many full elo families (Bronze -> Ouro = 2) the student climbed. */
export function familyGain(entry?: string | null, current?: string | null) {
  const a = tierFamily(entry);
  const b = tierFamily(current);
  if (!a || !b) return 0;
  return Math.max(0, TIER_FAMILIES.indexOf(b) - TIER_FAMILIES.indexOf(a));
}

export { tierColor };

export type BadgeKey =
  | "primeiro_radiante"
  | "streak_30"
  | "mestre_estrategia"
  | "aim_master"
  | "lenda_projeto"
  | "vod_review"
  | "mentorado";

export const BADGES: Record<BadgeKey, { emoji: string; label: string; desc: string; accent: string }> = {
  primeiro_radiante: {
    emoji: "🥇",
    label: "Primeiro Radiante",
    desc: "Alcançou Radiante pelo Projeto",
    accent: "#FFF6A9",
  },
  streak_30: {
    emoji: "🔥",
    label: "Sequência de 30 dias",
    desc: "30 dias consecutivos de estudo",
    accent: "#FF7A3D",
  },
  mestre_estrategia: {
    emoji: "🧠",
    label: "Mestre da Estratégia",
    desc: "Concluiu toda a trilha tática",
    accent: "#6F4BFF",
  },
  aim_master: {
    emoji: "🎯",
    label: "Aim Master",
    desc: "HS% acima de 30%",
    accent: "#00F5FF",
  },
  lenda_projeto: {
    emoji: "👑",
    label: "Lenda do Projeto",
    desc: "Top 3 do ranking geral",
    accent: "#E8C05A",
  },
  vod_review: {
    emoji: "🎬",
    label: "VOD Review",
    desc: "Enviou a primeira VOD",
    accent: "#00AEEF",
  },
  mentorado: {
    emoji: "⚔️",
    label: "Mentorado",
    desc: "Concluiu a primeira mentoria",
    accent: "#FF4655",
  },
};

export const POST_KIND_LABEL: Record<string, string> = {
  post: "Publicação",
  achievement: "Conquista",
  evolution: "Evolução",
  certificate: "Certificado",
};

export const POST_KIND_ACCENT: Record<string, string> = {
  post: "#6F4BFF",
  achievement: "#E8C05A",
  evolution: "#00F5FF",
  certificate: "#3BD16F",
};

export const DEFAULT_TASKS = [
  { task_key: "aula", title: "Assistir a aula recomendada", position: 0 },
  { task_key: "partidas", title: "Jogar 5 partidas competitivas", position: 1 },
  { task_key: "vod", title: "Enviar uma VOD para análise", position: 2 },
  { task_key: "mentoria", title: "Solicitar uma mentoria", position: 3 },
] as const;

export function initials(name?: string | null) {
  if (!name) return "R";
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}
