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
  | "site_settings"
  | "community_posts"
  | "post_comments"
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

/** True when the signed-in user is a mentor (moderator) or admin. */
export function useIsMentor() {
  return useQuery({
    queryKey: ["is-mentor"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", auth.user.id)
        .in("role", ["admin", "moderator"]);
      if (error) return false;
      return (data ?? []).length > 0;
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

      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
      const activeEnrollments = (enrollments.data ?? []).filter((e) => e.status === "active");

      return {
        totalStudents: allProfiles.length,
        newStudents: allProfiles.filter((p) => now - new Date(p.created_at).getTime() < 30 * day).length,
        revenueCents: paid.reduce((s, p) => s + (p.amount_cents ?? 0), 0),
        monthlyRevenueCents: paid
          .filter((p) => new Date(p.paid_at ?? p.created_at).getTime() >= monthStart)
          .reduce((s, p) => s + (p.amount_cents ?? 0), 0),
        coursesSold: paid.length,
        enrollments: (enrollments.data ?? []).length,
        activeSubscriptions: activeEnrollments.length,
        activeStudents: new Set(activeEnrollments.map((e) => e.user_id)).size,
        courses: (courses.data ?? []).length,
        lessons: (lessons.data ?? []).length,
        growth,
        latestPayments: allPayments.slice(0, 6),
        latestStudents: allProfiles.slice(0, 6),
      };
    },
  });
}

export type StudentOverview = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  last_seen_at: string | null;
  blocked: boolean;
  plan: string | null;
  status: string | null;
  enrollmentId: string | null;
  progress: number;
};

/** Students with plan, status, last access and course progress. */
export function useStudents() {
  return useQuery({
    queryKey: ["admin", "students"],
    queryFn: async (): Promise<StudentOverview[]> => {
      const [profiles, enrollments, lessons, progress] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, created_at, last_seen_at, blocked").order("created_at", { ascending: false }),
        supabase.from("enrollments").select("id, user_id, plan, status, created_at"),
        supabase.from("lessons").select("id").eq("published", true),
        supabase.from("lesson_progress").select("user_id, completed"),
      ]);

      const totalLessons = (lessons.data ?? []).length || 1;
      const byUser = new Map<string, number>();
      for (const p of progress.data ?? []) {
        if (p.completed) byUser.set(p.user_id, (byUser.get(p.user_id) ?? 0) + 1);
      }
      const enrollByUser = new Map<string, { id: string; plan: string; status: string }>();
      for (const e of enrollments.data ?? []) {
        if (!enrollByUser.has(e.user_id) || e.status === "active") {
          enrollByUser.set(e.user_id, { id: e.id, plan: e.plan, status: e.status });
        }
      }

      return (profiles.data ?? []).map((p) => {
        const e = enrollByUser.get(p.id);
        return {
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          created_at: p.created_at,
          last_seen_at: p.last_seen_at,
          blocked: !!p.blocked,
          plan: e?.plan ?? null,
          status: e?.status ?? null,
          enrollmentId: e?.id ?? null,
          progress: Math.round((100 * (byUser.get(p.id) ?? 0)) / totalLessons),
        };
      });
    },
  });
}

/** Manually change a student's plan, status, or block/unblock the account. */
export function useStudentActions() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "students"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const setPlan = useMutation({
    mutationFn: async ({ userId, enrollmentId, plan }: { userId: string; enrollmentId: string | null; plan: "basico" | "intermediario" | "mentoria" }) => {
      if (enrollmentId) {
        const { error } = await supabase.from("enrollments").update({ plan, status: "active" }).eq("id", enrollmentId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("enrollments").insert({ user_id: userId, plan, status: "active" });
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });

  const setBlocked = useMutation({
    mutationFn: async ({ userId, blocked }: { userId: string; blocked: boolean }) => {
      const { error } = await supabase.from("profiles").update({ blocked }).eq("id", userId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const setStatus = useMutation({
    mutationFn: async ({ enrollmentId, status }: { enrollmentId: string; status: string }) => {
      const { error } = await supabase.from("enrollments").update({ status }).eq("id", enrollmentId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { setPlan, setBlocked, setStatus };
}

export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
