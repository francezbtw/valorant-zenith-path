export type PlanTier = "basico" | "intermediario" | "mentoria";

export const PLAN_RANK: Record<PlanTier, number> = {
  basico: 1,
  intermediario: 2,
  mentoria: 3,
};

export const PLAN_LABEL: Record<PlanTier, string> = {
  basico: "Básico",
  intermediario: "Intermediário",
  mentoria: "Mentoria",
};

export const PLAN_ACCENT: Record<PlanTier, string> = {
  basico: "#6F4BFF",
  intermediario: "#00AEEF",
  mentoria: "#00F5FF",
};

export function hasAccess(plan: PlanTier | null | undefined, required: PlanTier) {
  if (!plan) return false;
  return PLAN_RANK[plan] >= PLAN_RANK[required];
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
