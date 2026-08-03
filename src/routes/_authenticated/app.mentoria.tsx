import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CalendarDays, Video, MessageSquare, Loader2, Plus, Bell } from "lucide-react";
import { PageHeader } from "@/components/membros/MemberShell";
import { LockedContent } from "@/components/membros/LockedContent";
import { usePlan } from "@/hooks/use-member";
import { hasAccess } from "@/lib/member";
import { useMyMentorships, useRequestMentorship } from "@/hooks/use-mentorship";
import { MENTORSHIP_STATUS, formatDateTime } from "@/lib/mentorship";
import { AttachmentGrid } from "@/components/mentoria/Attachments";
import { requestPushPermission } from "@/hooks/use-notifications";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal, Tilt } from "@/components/ui/premium";

export const Route = createFileRoute("/_authenticated/app/mentoria")({
  head: () => ({
    meta: [
      { title: "Mentoria · Área de Membros — Projeto Radiante" },
      { name: "description", content: "Sessões ao vivo, revisão de VOD e acompanhamento individual com o QCK." },
      { property: "og:title", content: "Mentoria — Projeto Radiante" },
      { property: "og:description", content: "Acompanhamento direto com o QCK para acelerar sua evolução." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MentoriaPage,
});

function MentoriaPage() {
  const plan = usePlan();
  const unlocked = hasAccess(plan, "mentoria");
  const { data: list = [], isLoading } = useMyMentorships();
  const request = useRequestMentorship();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const submit = async () => {
    if (!title.trim()) return toast.error("Dê um título para a sua mentoria.");
    try {
      await request.mutateAsync({ title: title.trim(), notes: notes.trim() });
      setTitle("");
      setNotes("");
      setOpen(false);
      toast.success("Solicitação enviada! O mentor responde em breve.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível enviar.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Acompanhamento 1:1"
        title="Mentoria com o QCK"
        subtitle="Sessões ao vivo, análise de VOD e um plano de evolução feito para o seu jogo."
      />

      {!unlocked ? (
        <LockedContent required="mentoria" context="A mentoria ao vivo" />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: CalendarDays, title: "Próxima sessão", body: "Toda quinta-feira, 20h (BRT). O link é liberado aqui 15 minutos antes." },
              { icon: Video, title: "Revisão de VOD", body: "Envie sua partida e receba a análise comentada em até 72h." },
              { icon: MessageSquare, title: "Canal direto", body: "Fale com o QCK no canal privado da mentoria durante a semana." },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="rounded-3xl glass-card p-7"
              >
                <c.icon className="h-5 w-5 text-[#00F5FF]" />
                <h3 className="mt-5 font-display text-lg font-bold">{c.title}</h3>
                <p className="mt-2 text-sm text-white/55">{c.body}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-bold">Minhas mentorias</h2>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const r = await requestPushPermission();
                  toast[r === "granted" ? "success" : "message"](
                    r === "granted" ? "Push ativado neste navegador." : "Notificações push não ativadas.",
                  );
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <Bell className="h-4 w-4" /> Ativar push
              </button>
              <button onClick={() => setOpen((v) => !v)} className="btn-hero inline-flex">
                <Plus className="h-4 w-4" /> Nova mentoria
              </button>
            </div>
          </div>

          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-3xl glass-card p-7"
            >
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sobre o que é a mentoria? Ex: revisão de VOD em Ascent"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[#7B2EFF]/60"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                placeholder="Conte seus objetivos, dificuldades e links das partidas."
                className="mt-3 w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[#7B2EFF]/60"
              />
              <button onClick={submit} disabled={request.isPending} className="btn-hero mt-5 inline-flex disabled:opacity-60">
                {request.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Enviar solicitação
              </button>
            </motion.div>
          )}

          <div className="mt-6 space-y-4">
            {isLoading ? (
              [0, 1].map((i) => <Skeleton key={i} className="h-32 w-full rounded-3xl bg-white/5" />)
            ) : list.length === 0 ? (
              <div className="rounded-3xl glass-card p-10 text-center text-sm text-white/55">
                Você ainda não solicitou nenhuma mentoria.
              </div>
            ) : (
              <ol className="relative space-y-4 border-l border-white/10 pl-6">
                {list.map((m, i) => {
                  const st = MENTORSHIP_STATUS[m.status] ?? MENTORSHIP_STATUS.requested;
                  return (
                    <Reveal key={m.id} delay={Math.min(i * 0.05, 0.25)}>
                      <li className="relative">
                        <span
                          className="absolute -left-[31px] top-6 h-2.5 w-2.5 rounded-full"
                          style={{ background: st.accent, boxShadow: `0 0 12px ${st.accent}` }}
                        />
                        <Tilt intensity={3} glow="rgba(0,245,255,0.14)">
                          <div className="rounded-3xl glass-card p-6">
                            <div className="flex flex-wrap items-center gap-3">
                              <span
                                className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]"
                                style={{ background: `${st.accent}1f`, color: st.accent }}
                              >
                                {st.label}
                              </span>
                              <span className="text-[11px] text-white/35">{formatDateTime(m.created_at)}</span>
                            </div>
                            <h3 className="mt-3 font-display text-lg font-bold">{m.title}</h3>
                            {m.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-white/50">{m.notes}</p>}

                            {m.scheduled_at && (
                              <p className="mt-3 text-sm text-white/60">
                                Sessão: {formatDateTime(m.scheduled_at)}
                                {m.meeting_url && (
                                  <>
                                    {" · "}
                                    <a href={m.meeting_url} target="_blank" rel="noreferrer" className="text-[#00F5FF] underline">
                                      entrar na sala
                                    </a>
                                  </>
                                )}
                              </p>
                            )}

                            {m.feedback && (
                              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                                  Feedback de {m.mentor_name} · {formatDateTime(m.feedback_at)}
                                </div>
                                <p className="mt-3 whitespace-pre-wrap text-sm text-white/75">{m.feedback}</p>
                              </div>
                            )}

                            {m.attachments.length > 0 && (
                              <div className="mt-5">
                                <AttachmentGrid attachments={m.attachments} />
                              </div>
                            )}
                          </div>
                        </Tilt>
                      </li>
                    </Reveal>
                  );
                })}
              </ol>
            )}
          </div>
        </>
      )}
    </>
  );
}
