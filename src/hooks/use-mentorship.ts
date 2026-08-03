import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  MENTORSHIP_BUCKET,
  attachmentKind,
  type Attachment,
  type MentorshipStatus,
} from "@/lib/mentorship";

export type Mentorship = {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  mentor_name: string;
  status: MentorshipStatus;
  scheduled_at: string | null;
  duration_minutes: number;
  meeting_url: string | null;
  feedback: string | null;
  feedback_at: string | null;
  completed_at: string | null;
  attachments: Attachment[];
  created_at: string;
  updated_at: string;
};

function normalize(row: Record<string, unknown>): Mentorship {
  return {
    ...(row as unknown as Mentorship),
    attachments: Array.isArray(row.attachments) ? (row.attachments as Attachment[]) : [],
  };
}

/** Mentorias do aluno logado. */
export function useMyMentorships() {
  return useQuery({
    queryKey: ["my-mentorships"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return [] as Mentorship[];
      const { data, error } = await supabase
        .from("mentorships")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(normalize);
    },
  });
}

export function useRequestMentorship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, notes }: { title: string; notes: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada");
      const { error } = await supabase.from("mentorships").insert({
        user_id: auth.user.id,
        title,
        notes,
        status: "requested",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-mentorships"] }),
  });
}

/** Todas as mentorias (mentor/admin). */
export function useAllMentorships() {
  return useQuery({
    queryKey: ["mentor-mentorships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentorships")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []).map(normalize);
      const ids = [...new Set(rows.map((r) => r.user_id))];
      if (!ids.length) return rows.map((r) => ({ ...r, student: null }));
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, current_rank")
        .in("id", ids);
      const map = new Map((profiles ?? []).map((p) => [p.id, p]));
      return rows.map((r) => ({ ...r, student: map.get(r.user_id) ?? null }));
    },
  });
}

export type MentorshipWithStudent = Awaited<ReturnType<typeof fetchOne>>;

async function fetchOne(id: string) {
  const { data, error } = await supabase.from("mentorships").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = normalize(data);
  const { data: student } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, current_rank")
    .eq("id", row.user_id)
    .maybeSingle();
  return { ...row, student: student ?? null };
}

export function useMentorship(id: string | undefined) {
  return useQuery({
    queryKey: ["mentorship", id],
    enabled: Boolean(id),
    queryFn: async () => fetchOne(id!),
  });
}

/** Cria URLs assinadas temporárias para os anexos. */
export function useAttachmentUrls(attachments: Attachment[] | undefined) {
  const key = (attachments ?? []).map((a) => a.path).join("|");
  return useQuery({
    queryKey: ["mentorship-attachments", key],
    enabled: Boolean(attachments?.length),
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const list = attachments ?? [];
      const { data, error } = await supabase.storage
        .from(MENTORSHIP_BUCKET)
        .createSignedUrls(list.map((a) => a.path), 60 * 60 * 4);
      if (error) throw error;
      return list.map((a, i) => ({ ...a, url: data?.[i]?.signedUrl ?? null }));
    },
  });
}

export async function uploadMentorshipFiles(
  mentorship: { id: string; user_id: string },
  files: File[],
): Promise<Attachment[]> {
  const out: Attachment[] = [];
  for (const file of files) {
    const safe = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${mentorship.user_id}/${mentorship.id}/${Date.now()}-${safe}`;
    const { error } = await supabase.storage.from(MENTORSHIP_BUCKET).upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (error) throw error;
    out.push({ name: file.name, path, type: attachmentKind(file.type, file.name), size: file.size });
  }
  return out;
}

/** Mentor responde: feedback, anexos, status — e notifica o aluno. */
export function useMentorRespond() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      mentorship,
      feedback,
      status,
      scheduledAt,
      meetingUrl,
      files,
      keepAttachments,
    }: {
      mentorship: { id: string; user_id: string; title: string };
      feedback: string;
      status: MentorshipStatus;
      scheduledAt?: string | null;
      meetingUrl?: string | null;
      files: File[];
      keepAttachments: Attachment[];
    }) => {
      const uploaded = files.length ? await uploadMentorshipFiles(mentorship, files) : [];
      const attachments = [...keepAttachments, ...uploaded];
      const hasFeedback = feedback.trim().length > 0 || uploaded.length > 0;

      const { error } = await supabase
        .from("mentorships")
        .update({
          feedback: feedback.trim() ? feedback.trim() : null,
          feedback_at: hasFeedback ? new Date().toISOString() : null,
          attachments: attachments as unknown as never,
          status,
          scheduled_at: scheduledAt || null,
          meeting_url: meetingUrl || null,
          completed_at: status === "done" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", mentorship.id);
      if (error) throw error;

      if (hasFeedback || status === "done") {
        await supabase.from("notifications").insert({
          user_id: mentorship.user_id,
          title: status === "done" ? "Mentoria concluída" : "Novo feedback do mentor",
          body: `${mentorship.title} — o mentor respondeu sua mentoria.`,
          kind: "mentorship",
          link: "/app/mentoria",
        });
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["mentor-mentorships"] });
      qc.invalidateQueries({ queryKey: ["mentorship", vars.mentorship.id] });
    },
  });
}

export function useUpdateMentorshipStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: MentorshipStatus }) => {
      const { error } = await supabase
        .from("mentorships")
        .update({
          status,
          completed_at: status === "done" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mentor-mentorships"] });
    },
  });
}
