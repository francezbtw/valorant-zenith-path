import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Notification = {
  id: string;
  title: string;
  body: string | null;
  kind: string;
  link: string | null;
  read: boolean;
  created_at: string;
};

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return [] as Notification[];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as Notification[];
    },
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids?: string[]) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      let q = supabase.from("notifications").update({ read: true }).eq("user_id", auth.user.id);
      if (ids?.length) q = q.in("id", ids);
      else q = q.eq("read", false);
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

/** Pede permissão de push do navegador (opcional para o aluno). */
export async function requestPushPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (window.Notification.permission === "granted") return "granted";
  return window.Notification.requestPermission();
}

/** Realtime: novas notificações chegam sem refresh e viram push do navegador. */
export function useNotificationsRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user || cancelled) return;
      channel = supabase
        .channel(`notifications-${auth.user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${auth.user.id}`,
          },
          (payload) => {
            qc.invalidateQueries({ queryKey: ["notifications"] });
            qc.invalidateQueries({ queryKey: ["my-mentorships"] });
            const n = payload.new as Notification;
            if (
              typeof window !== "undefined" &&
              "Notification" in window &&
              window.Notification.permission === "granted"
            ) {
              try {
                new window.Notification(n.title, { body: n.body ?? undefined });
              } catch {
                /* ignora navegadores que exigem service worker */
              }
            }
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [qc]);
}
