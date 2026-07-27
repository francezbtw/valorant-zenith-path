import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AdminTable =
  | "courses"
  | "modules"
  | "lessons"
  | "plans"
  | "payments"
  | "coupons"
  | "mentorships"
  | "announcements"
  | "enrollments"
  | "profiles"
  | "user_roles";

/** True when the signed-in user has the admin role. */
export function useIsAdmin() {
  return useQuery({
    queryKey: ["is-admin"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", auth.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) return false;
      return !!data;
    },
  });
}

type Row = Record<string, unknown>;

export function useAdminRows<T = Row>(table: AdminTable, orderBy = "created_at", ascending = false) {
  return useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(orderBy, { ascending });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function useAdminMutations(table: AdminTable) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", table] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
    qc.invalidateQueries({ queryKey: [table] });
  };

  const create = useMutation({
    mutationFn: async (values: Row) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from(table).insert(values as any);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Row }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from(table).update(values as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

/** Aggregated numbers for the admin dashboard. */
export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [profiles, enrollments, payments, courses, lessons] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, created_at").order("created_at", { ascending: false }),
        supabase.from("enrollments").select("id, plan, status, user_id, created_at"),
        supabase.from("payments").select("id, amount_cents, status, user_id, plan, paid_at, created_at").order("created_at", { ascending: false }),
        supabase.from("courses").select("id"),
        supabase.from("lessons").select("id"),
      ]);

      const now = Date.now();
      const day = 86_400_000;
      const allProfiles = profiles.data ?? [];
      const allPayments = payments.data ?? [];
      const paid = allPayments.filter((p) => p.status === "paid");

      const growth = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now - (11 - i) * 30 * day);
        const label = d.toLocaleDateString("pt-BR", { month: "short" });
        const start = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
        return {
          label,
          alunos: allProfiles.filter((p) => {
            const t = new Date(p.created_at).getTime();
            return t >= start && t < end;
          }).length,
          receita: paid
            .filter((p) => {
              const t = new Date(p.paid_at ?? p.created_at).getTime();
              return t >= start && t < end;
            })
            .reduce((s, p) => s + (p.amount_cents ?? 0), 0) / 100,
        };
      });

      return {
        totalStudents: allProfiles.length,
        newStudents: allProfiles.filter((p) => now - new Date(p.created_at).getTime() < 30 * day).length,
        revenueCents: paid.reduce((s, p) => s + (p.amount_cents ?? 0), 0),
        enrollments: (enrollments.data ?? []).length,
        activeStudents: (enrollments.data ?? []).filter((e) => e.status === "active").length,
        courses: (courses.data ?? []).length,
        lessons: (lessons.data ?? []).length,
        growth,
        latestPayments: allPayments.slice(0, 6),
        latestStudents: allProfiles.slice(0, 6),
      };
    },
  });
}

export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
