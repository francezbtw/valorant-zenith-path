import { useEffect, useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Paperclip, Send, Trash2, User2 } from "lucide-react";
import { useMentorship, useMentorRespond } from "@/hooks/use-mentorship";
import {
  MENTORSHIP_STATUS,
  MENTORSHIP_STATUS_ORDER,
  formatDateTime,
  type Attachment,
  type MentorshipStatus,
} from "@/lib/mentorship";
import { AttachmentGrid } from "@/components/mentoria/Attachments";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/mentor/$id")({
  head: () => ({
    meta: [
      { title: "Mentoria · Painel do Mentor — Projeto Radiante" },
      { name: "description", content: "Responda a mentoria do aluno com feedback em texto, anexos e atualização de status." },
      { property: "og:title", content: "Responder mentoria — Projeto Radiante" },
      { property: "og:description", content: "Feedback, anexos e status da mentoria." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MentorDetail,
});

function MentorDetail() {
  const { id } = useParams({ from: "/_authenticated/mentor/$id" });
  const { data: m, isLoading } = useMentorship(id);
  const respond = useMentorRespond();

  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<MentorshipStatus>("approved");
  const [scheduledAt, setScheduledAt] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [keep, setKeep] = useState<Attachment[]>([]);

  useEffect(() => {
    if (!m) return;
    setFeedback(m.feedback ?? "");
    setStatus(m.status);
    setScheduledAt(m.scheduled_at ? m.scheduled_at.slice(0, 16) : "");
    setMeetingUrl(m.meeting_url ?? "");
    setKeep(m.attachments);
  }, [m?.id]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-3xl bg-white/5" />
        <Skeleton className="h-64 w-full rounded-3xl bg-white/5" />
      </div>
    );
  }

  if (!m) {
    return <div className="rounded-3xl glass-card p-12 text-center text-sm text-white/55">Mentoria não encontrada.</div>;
  }

  const save = async (overrideStatus?: MentorshipStatus) => {
    try {
      await respond.mutateAsync({
        mentorship: { id: m.id, user_id: m.user_id, title: m.title },
        feedback,
        status: overrideStatus ?? status,
        scheduledAt: scheduledAt || null,
        meetingUrl: meetingUrl || null,
        files,
        keepAttachments: keep,
      });
      setFiles([]);
      toast.success("Mentoria atualizada e aluno notificado.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível salvar.");
    }
  };

  const st = MENTORSHIP_STATUS[m.status] ?? MENTORSHIP_STATUS.requested;

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl glass-card p-7"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-[300px] w-[300px] rounded-full bg-[#7B2EFF]/25 blur-[110px]" />
        <div className="relative z-10">
          <span
            className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]"
            style={{ background: `${st.accent}1f`, color: st.accent }}
          >
            {st.label}
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">{m.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/55">
            <span className="inline-flex items-center gap-2">
              <User2 className="h-4 w-4" /> {m.student?.full_name ?? m.student?.email ?? "Aluno"}
            </span>
            {m.student?.current_rank && <span>· {m.student.current_rank}</span>}
            <span>· Solicitada em {formatDateTime(m.created_at)}</span>
          </div>
          {m.notes && <p className="mt-5 whitespace-pre-wrap text-sm text-white/65">{m.notes}</p>}
        </div>
      </motion.div>

      {keep.length > 0 && (
        <div className="rounded-3xl glass-card p-7">
          <h2 className="mb-4 font-display text-lg font-semibold">Anexos atuais</h2>
          <AttachmentGrid attachments={keep} />
          <div className="mt-4 flex flex-wrap gap-2">
            {keep.map((a) => (
              <button
                key={a.path}
                onClick={() => setKeep((prev) => prev.filter((x) => x.path !== a.path))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-white/55 transition hover:border-[#FF4655]/50 hover:text-white"
              >
                <Trash2 className="h-3 w-3" /> Remover {a.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="rounded-3xl glass-card p-7"
      >
        <h2 className="font-display text-lg font-semibold">Feedback do mentor</h2>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={8}
          placeholder="Escreva a análise da partida, pontos fortes, correções e o plano de treino da semana…"
          className="mt-4 w-full resize-y rounded-2xl border border-white/10 bg-white/5 p-4 text-sm outline-none transition placeholder:text-white/30 focus:border-[#7B2EFF]/60"
        />

        <div className="mt-5">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-sm text-white/55 transition hover:border-[#00F5FF]/50 hover:text-white">
            <Paperclip className="h-4 w-4" />
            Anexar imagens, PDFs ou vídeos
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,video/*"
              className="hidden"
              onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
            />
          </label>
          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
                  <span className="truncate">{f.name}</span>
                  <button
                    onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-white/40 transition hover:text-[#FF4655]"
                    aria-label={`Remover ${f.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MentorshipStatus)}
              className="w-full rounded-xl border border-white/10 bg-[#111111] px-3 py-2.5 text-sm outline-none focus:border-[#7B2EFF]/60"
            >
              {MENTORSHIP_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {MENTORSHIP_STATUS[s].label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Agendada para">
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[#7B2EFF]/60"
            />
          </Field>
          <Field label="Link da reunião">
            <input
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet…"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-white/25 focus:border-[#7B2EFF]/60"
            />
          </Field>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button onClick={() => save()} disabled={respond.isPending} className="btn-hero inline-flex disabled:opacity-60">
            {respond.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Enviar feedback
          </button>
          <button
            onClick={() => save("done")}
            disabled={respond.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-[#3BD16F]/40 bg-[#3BD16F]/10 px-5 py-3 text-sm text-[#3BD16F] transition hover:bg-[#3BD16F]/20 disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" /> Marcar como concluída
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/45">{label}</span>
      {children}
    </label>
  );
}
