import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  claimFirstAdmin,
  deleteStudentAccount,
  grantRoleByEmail,
  resetStudentProgress,
  revokeRole,
  sendStudentEmail,
} from "@/lib/admin.functions";

export type AppRole = "admin" | "moderator" | "user" | "mentor" | "support";

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Administrador",
  mentor: "Mentor",
  support: "Suporte",
  moderator: "Moderador",
  user: "Aluno",
};

/** All roles held by the signed-in user. */
export function useMyRoles() {
  return useQuery({
    queryKey: ["my-roles"],
    staleTime: 60_000,
    queryFn: async (): Promise<AppRole[]> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return [];
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", auth.user.id);
      return ((data ?? []).map((r) => r.role) as AppRole[]) ?? [];
    },
  });
}

/** Write an entry to the administrative audit log. */
export async function logAdmin(action: string, entity: string, entityId: string | null, details: Record<string, unknown> = {}) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  await supabase.from("admin_logs").insert({
    actor_id: auth.user.id,
    actor_email: auth.user.email ?? null,
    action,
    entity,
    entity_id: entityId,
    details,
  });
}

export function useAdminLogs(limit = 200) {
  return useQuery({
    queryKey: ["admin", "logs", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Roles table joined with profile identity, for the permissions screen. */
export function useRoleAssignments() {
  return useQuery({
    queryKey: ["admin", "role-assignments"],
    queryFn: async () => {
      const [roles, profiles] = await Promise.all([
        supabase.from("user_roles").select("id, user_id, role, created_at").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name, email"),
      ]);
      const byId = new Map((profiles.data ?? []).map((p) => [p.id, p]));
      return (roles.data ?? []).map((r) => ({
        ...r,
        role: r.role as AppRole,
        name: byId.get(r.user_id)?.full_name ?? "—",
        email: byId.get(r.user_id)?.email ?? "—",
      }));
    },
  });
}

/** Privileged, server-verified administrative operations. */
export function useAdminOps() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
    qc.invalidateQueries({ queryKey: ["my-roles"] });
    qc.invalidateQueries({ queryKey: ["is-admin"] });
  };

  const claim = useServerFn(claimFirstAdmin);
  const grant = useServerFn(grantRoleByEmail);
  const revoke = useServerFn(revokeRole);
  const del = useServerFn(deleteStudentAccount);
  const reset = useServerFn(resetStudentProgress);
  const mail = useServerFn(sendStudentEmail);

  return {
    claimFirstAdmin: useMutation({ mutationFn: () => claim({ data: undefined as never }), onSuccess: invalidate }),
    grantRole: useMutation({
      mutationFn: (data: { email: string; role: AppRole }) => grant({ data }),
      onSuccess: invalidate,
    }),
    revokeRole: useMutation({
      mutationFn: (data: { userId: string; role: AppRole }) => revoke({ data }),
      onSuccess: invalidate,
    }),
    deleteStudent: useMutation({
      mutationFn: (data: { userId: string }) => del({ data }),
      onSuccess: invalidate,
    }),
    resetProgress: useMutation({
      mutationFn: (data: { userId: string }) => reset({ data }),
      onSuccess: invalidate,
    }),
    emailStudent: useMutation({
      mutationFn: (data: { userId: string; email: string; subject: string; message: string }) => mail({ data }),
      onSuccess: invalidate,
    }),
  };
}

export type FinanceRow = {
  id: string;
  user_id: string;
  email: string;
  plan: string | null;
  amount_cents: number;
  refunded_cents: number;
  status: string;
  provider: string | null;
  created_at: string;
  paid_at: string | null;
};

/** Full financial picture: sales, revenue windows, per-plan split, refunds. */
export function useFinance() {
  return useQuery({
    queryKey: ["admin", "finance"],
    queryFn: async () => {
      const [payments, profiles, enrollments] = await Promise.all([
        supabase.from("payments").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, email"),
        supabase.from("enrollments").select("id, status, canceled_at, plan"),
      ]);
      const emailById = new Map((profiles.data ?? []).map((p) => [p.id, p.email ?? "—"]));
      const rows: FinanceRow[] = (payments.data ?? []).map((p) => ({
        id: p.id,
        user_id: p.user_id,
        email: emailById.get(p.user_id) ?? "—",
        plan: p.plan,
        amount_cents: p.amount_cents ?? 0,
        refunded_cents: p.refunded_cents ?? 0,
        status: p.status,
        provider: p.provider,
        created_at: p.created_at,
        paid_at: p.paid_at,
      }));

      const paid = rows.filter((r) => r.status === "paid");
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const yearStart = new Date(now.getFullYear(), 0, 1).getTime();
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const at = (r: FinanceRow) => new Date(r.paid_at ?? r.created_at).getTime();
      const sum = (list: FinanceRow[]) => list.reduce((s, r) => s + r.amount_cents, 0);

      const byPlan = new Map<string, { plan: string; cents: number; count: number }>();
      for (const r of paid) {
        const key = r.plan ?? "—";
        const cur = byPlan.get(key) ?? { plan: key, cents: 0, count: 0 };
        cur.cents += r.amount_cents;
        cur.count += 1;
        byPlan.set(key, cur);
      }

      const monthly = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        const start = d.getTime();
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
        return {
          label: d.toLocaleDateString("pt-BR", { month: "short" }),
          receita: sum(paid.filter((r) => at(r) >= start && at(r) < end)) / 100,
          vendas: paid.filter((r) => at(r) >= start && at(r) < end).length,
        };
      });

      const daily = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (29 - i));
        const start = d.getTime();
        const end = start + 86400000;
        return {
          label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          receita: sum(paid.filter((r) => at(r) >= start && at(r) < end)) / 100,
        };
      });

      const total = sum(paid);
      return {
        rows,
        total,
        month: sum(paid.filter((r) => at(r) >= monthStart)),
        year: sum(paid.filter((r) => at(r) >= yearStart)),
        today: sum(paid.filter((r) => at(r) >= dayStart)),
        sales: paid.length,
        ticket: paid.length ? Math.round(total / paid.length) : 0,
        refundedCount: rows.filter((r) => r.status === "refunded").length,
        refundedCents: rows.reduce((s, r) => s + r.refunded_cents, 0),
        canceled: (enrollments.data ?? []).filter((e) => e.status === "canceled").length,
        byPlan: Array.from(byPlan.values()).sort((a, b) => b.cents - a.cents),
        monthly,
        daily,
      };
    },
  });
}

export function toCSV(rows: FinanceRow[]) {
  const header = ["id", "email", "plano", "valor", "reembolsado", "status", "gateway", "criado_em", "pago_em"];
  const body = rows.map((r) =>
    [
      r.id,
      r.email,
      r.plan ?? "",
      (r.amount_cents / 100).toFixed(2),
      (r.refunded_cents / 100).toFixed(2),
      r.status,
      r.provider ?? "",
      r.created_at,
      r.paid_at ?? "",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header.join(","), ...body].join("\n");
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Live counters used by the dashboard beyond the base admin stats. */
export function useRealtimePulse() {
  return useQuery({
    queryKey: ["admin", "pulse"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const [pendingMentorships, payments] = await Promise.all([
        supabase.from("mentorships").select("id, status").in("status", ["requested", "approved", "scheduled"]),
        supabase.from("payments").select("id, amount_cents, status, created_at").order("created_at", { ascending: false }).limit(8),
      ]);
      return {
        pendingMentorships: (pendingMentorships.data ?? []).length,
        latest: payments.data ?? [],
      };
    },
  });
}
