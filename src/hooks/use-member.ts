import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PlanTier } from "@/lib/member";

export type Module = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  tier: PlanTier;
  position: number;
  cover_color: string | null;
};

export type Lesson = {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_seconds: number;
  materials: { name: string; url: string }[];
  position: number;
};

export function useSessionUser() {
  return useQuery({
    queryKey: ["session-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useEnrollment() {
  return useQuery({
    queryKey: ["enrollment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function usePlan(): PlanTier | null {
  const { data } = useEnrollment();
  if (!data) return null;
  if (data.status !== "active") return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  return data.plan as PlanTier;
}

export function useModules() {
  return useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("position");
      if (error) throw error;
      return (data ?? []) as Module[];
    },
  });
}

export function useLessons() {
  return useQuery({
    queryKey: ["lessons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("position");
      if (error) throw error;
      return (data ?? []) as unknown as Lesson[];
    },
  });
}

export function useProgress() {
  return useQuery({
    queryKey: ["progress"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lesson_progress").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useToggleLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ lessonId, completed }: { lessonId: string; completed: boolean }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada");
      const { error } = await supabase.from("lesson_progress").upsert(
        {
          user_id: auth.user.id,
          lesson_id: lessonId,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        },
        { onConflict: "user_id,lesson_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["progress"] }),
  });
}
