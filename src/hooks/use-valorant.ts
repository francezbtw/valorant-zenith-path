import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ValorantAccount = {
  user_id: string;
  riot_name: string;
  riot_tag: string;
  region: string;
  puuid: string | null;
  verified_at: string | null;
};

export type RankEntry = {
  id: string;
  user_id: string;
  rank_tier: string;
  rr: number;
  recorded_at: string;
  note: string | null;
};

export function useValorantAccount() {
  return useQuery({
    queryKey: ["valorant-account"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("valorant_accounts")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as ValorantAccount | null;
    },
  });
}

export function useSaveValorantAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      riot_name: string;
      riot_tag: string;
      region: string;
      puuid?: string | null;
      verified_at?: string | null;
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada");
      const { error } = await supabase.from("valorant_accounts").upsert(
        { user_id: auth.user.id, ...input },
        { onConflict: "user_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["valorant-account"] }),
  });
}

export function useRankHistory() {
  return useQuery({
    queryKey: ["rank-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rank_history")
        .select("*")
        .order("recorded_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as RankEntry[];
    },
  });
}

export function useAddRankEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { rank_tier: string; rr: number; recorded_at: string; note?: string | null }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada");
      const { error } = await supabase
        .from("rank_history")
        .insert({ user_id: auth.user.id, ...input });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rank-history"] }),
  });
}

export function useDeleteRankEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rank_history").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rank-history"] }),
  });
}
