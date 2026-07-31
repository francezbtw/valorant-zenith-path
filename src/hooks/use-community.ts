import { useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_TASKS } from "@/lib/community";

export type PublicProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  riot_id: string | null;
  current_rank: string | null;
  created_at: string;
};

export type StudentStats = {
  user_id: string;
  xp: number;
  streak_days: number;
  active_days: number;
  hours_studied: number;
  headshot_pct: number;
  win_rate: number;
  mentorships_done: number;
  entry_tier: string | null;
  current_tier: string | null;
  goal_tier: string;
  joined_at: string;
  last_active_date: string | null;
};

export type CommunityMember = PublicProfile & {
  stats: StudentStats | null;
  badges: string[];
};

export type CommunityPost = {
  id: string;
  user_id: string;
  kind: "post" | "achievement" | "evolution" | "certificate";
  body: string;
  image_url: string | null;
  meta: Record<string, unknown>;
  created_at: string;
};

/* ------------------------------------------------------------------ */
/* Members + ranking                                                   */
/* ------------------------------------------------------------------ */

export function useCommunityMembers() {
  return useQuery({
    queryKey: ["community-members"],
    queryFn: async (): Promise<CommunityMember[]> => {
      const [profilesRes, statsRes, badgesRes] = await Promise.all([
        supabase.from("public_profiles").select("*"),
        supabase.from("student_stats").select("*"),
        supabase.from("user_badges").select("user_id, badge_key"),
      ]);
      if (profilesRes.error) throw profilesRes.error;
      const stats = (statsRes.data ?? []) as StudentStats[];
      const badges = badgesRes.data ?? [];
      return ((profilesRes.data ?? []) as PublicProfile[]).map((p) => ({
        ...p,
        stats: stats.find((s) => s.user_id === p.id) ?? null,
        badges: badges.filter((b) => b.user_id === p.id).map((b) => b.badge_key),
      }));
    },
  });
}

export function useCommunityMember(userId: string | undefined) {
  const { data = [], ...rest } = useCommunityMembers();
  return { ...rest, data: data.find((m) => m.id === userId) ?? null };
}

/* ------------------------------------------------------------------ */
/* My stats                                                            */
/* ------------------------------------------------------------------ */

export function useMyStats() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["my-stats"],
    queryFn: async (): Promise<StudentStats | null> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from("student_stats")
        .select("*")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (error) throw error;
      if (data) return data as StudentStats;
      const { data: created, error: insErr } = await supabase
        .from("student_stats")
        .insert({ user_id: auth.user.id })
        .select("*")
        .maybeSingle();
      if (insErr) throw insErr;
      return (created ?? null) as StudentStats | null;
    },
  });
  const update = useMutation({
    mutationFn: async (patch: Partial<StudentStats>) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada");
      const { error } = await supabase
        .from("student_stats")
        .update(patch)
        .eq("user_id", auth.user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-stats"] });
      qc.invalidateQueries({ queryKey: ["community-members"] });
    },
  });
  return { ...query, update };
}

/* ------------------------------------------------------------------ */
/* Evolution tasks                                                     */
/* ------------------------------------------------------------------ */

export type StudentTask = {
  id: string;
  task_key: string;
  title: string;
  done: boolean;
  position: number;
};

export function useTasks() {
  return useQuery({
    queryKey: ["student-tasks"],
    queryFn: async (): Promise<StudentTask[]> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return [];
      const { data, error } = await supabase
        .from("student_tasks")
        .select("id, task_key, title, done, position")
        .order("position");
      if (error) throw error;
      if (data && data.length) return data as StudentTask[];
      const { data: seeded, error: seedErr } = await supabase
        .from("student_tasks")
        .insert(DEFAULT_TASKS.map((t) => ({ ...t, user_id: auth.user!.id })))
        .select("id, task_key, title, done, position");
      if (seedErr) throw seedErr;
      return (seeded ?? []) as StudentTask[];
    },
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { error } = await supabase
        .from("student_tasks")
        .update({ done, completed_at: done ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["student-tasks"] }),
  });
}

/* ------------------------------------------------------------------ */
/* Feed                                                                */
/* ------------------------------------------------------------------ */

export function usePosts() {
  return useQuery({
    queryKey: ["community-posts"],
    queryFn: async () => {
      const [postsRes, likesRes, commentsRes] = await Promise.all([
        supabase.from("community_posts").select("*").order("created_at", { ascending: false }).limit(60),
        supabase.from("post_likes").select("post_id, user_id"),
        supabase.from("post_comments").select("*").order("created_at"),
      ]);
      if (postsRes.error) throw postsRes.error;
      const { data: auth } = await supabase.auth.getUser();
      const me = auth.user?.id;
      const likes = likesRes.data ?? [];
      const comments = commentsRes.data ?? [];
      return ((postsRes.data ?? []) as CommunityPost[]).map((p) => ({
        ...p,
        likeCount: likes.filter((l) => l.post_id === p.id).length,
        likedByMe: likes.some((l) => l.post_id === p.id && l.user_id === me),
        comments: comments.filter((c) => c.post_id === p.id),
      }));
    },
  });
}

export type FeedPost = NonNullable<ReturnType<typeof usePosts>["data"]>[number];

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { kind: CommunityPost["kind"]; body: string; image_url?: string | null; meta?: Record<string, unknown> }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada");
      const { error } = await supabase.from("community_posts").insert({
        user_id: auth.user.id,
        kind: input.kind,
        body: input.body,
        image_url: input.image_url ?? null,
        meta: (input.meta ?? {}) as never,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-posts"] }),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("community_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-posts"] }),
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, liked }: { postId: string; liked: boolean }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada");
      if (liked) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", auth.user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: auth.user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-posts"] }),
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, body }: { postId: string; body: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada");
      const { error } = await supabase
        .from("post_comments")
        .insert({ post_id: postId, user_id: auth.user.id, body });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-posts"] }),
  });
}

/** Realtime: keeps the feed and timeline in sync for every member. */
export function useCommunityRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("community-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, () =>
        qc.invalidateQueries({ queryKey: ["community-posts"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "post_likes" }, () =>
        qc.invalidateQueries({ queryKey: ["community-posts"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "post_comments" }, () =>
        qc.invalidateQueries({ queryKey: ["community-posts"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
