import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, Inbox, CheckCircle2, Clock, CalendarClock } from "lucide-react";
import { useAllMentorships } from "@/hooks/use-mentorship";
import { MENTORSHIP_STATUS, MENTORSHIP_STATUS_ORDER, formatDateTime, type MentorshipStatus } from "@/lib/mentorship";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal, Tilt } from "@/components/ui/premium";

export const Route = createFileRoute("/_authenticated/mentor/")({
  head: () => ({
    meta: [
      { title: "Solicitações · Painel do Mentor — Projeto Radiante" },
      { name: "description", content: "Gerencie solicitações de mentoria, responda feedbacks e acompanhe o status de cada aluno." },
      { property: "og:title", content: "Painel do Mentor — Projeto Radiante" },
      { property: "og:description", content: "Todas as solicitações de mentoria em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MentorInbox,
});

function MentorInbox() {
  const { data: list = [], isLoading } = useAllMentorships();
  const [status, setStatus] = useState<MentorshipStatus | "all">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return list.filter((m) => {
      if (status !== "all" && m.status !== status) return false;
      if (!term) return true;
      return (
        m.title.toLowerCase().includes(term) ||
        (m.student?.full_name ?? "").toLowerCase().includes(term) ||
        (m.student?.email ?? "").toLowerCase().includes(term)
      );
    });
  }, [list, status, q]);

  const counts = {
    pending: list.filter((m) => m.status === "requested").length,
    scheduled: list.filter((m) => m.status === "scheduled" || m.status === "approved").length,
    done: list.filter((m) => m.status === "done").length,
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00F5FF] shadow-[0_0_10px_#00F5FF]" /> Central de mentorias
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Solicitações</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          Abra uma mentoria para escrever o feedback, anexar imagens, PDFs e vídeos e atualizar o status.
        </p>
      </motion.div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Clock} label="Pendentes" value={counts.pending} accent="#E8C05A" delay={0} />
        <StatCard icon={CalendarClock} label="Em andamento" value={counts.scheduled} accent="#00AEEF" delay={0.06} />
        <StatCard icon={CheckCircle2} label="Concluídas" value={counts.done} accent="#3BD16F" delay={0.12} />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por aluno ou título…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-white/30 focus:border-[#7B2EFF]/60"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={status === "all"} onClick={() => setStatus("all")} label="Todas" accent="#6F4BFF" />
          {MENTORSHIP_STATUS_ORDER.map((s) => (
            <FilterChip
              key={s}
              active={status === s}
              onClick={() => setStatus(s)}
              label={MENTORSHIP_STATUS[s].label}
              accent={MENTORSHIP_STATUS[s].accent}
            />
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl glass-card p-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-white/30" />
          <p className="mt-4 text-sm text-white/55">Nenhuma mentoria encontrada com esses filtros.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m, i) => {
            const st = MENTORSHIP_STATUS[m.status] ?? MENTORSHIP_STATUS.requested;
            return (
              <Reveal key={m.id} delay={Math.min(i * 0.04, 0.24)}>
                <Tilt intensity={3} glow="rgba(123,46,255,0.16)">
                  <Link
                    to="/mentor/$id"
                    params={{ id: m.id }}
                    className="block rounded-2xl glass-card p-5 transition hover:border-white/20"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]"
                            style={{ background: `${st.accent}1f`, color: st.accent }}
                          >
                            {st.label}
                          </span>
                          <span className="text-[11px] text-white/35">{formatDateTime(m.created_at)}</span>
                        </div>
                        <h3 className="mt-2 truncate font-display text-lg font-semibold">{m.title}</h3>
                        <p className="mt-1 truncate text-sm text-white/50">
                          {m.student?.full_name ?? m.student?.email ?? "Aluno"}
                          {m.student?.current_rank ? ` · ${m.student.current_rank}` : ""}
                        </p>
                      </div>
                      <div className="text-right text-xs text-white/45">
                        {m.attachments.length > 0 && <div>{m.attachments.length} anexo(s)</div>}
                        {m.feedback_at ? <div className="text-[#3BD16F]">Feedback enviado</div> : <div>Sem feedback</div>}
                      </div>
                    </div>
                  </Link>
                </Tilt>
              </Reveal>
            );
          })}
        </div>
      )}
    </>
  );
}

function FilterChip({ active, onClick, label, accent }: { active: boolean; onClick: () => void; label: string; accent: string }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-3.5 py-2 text-xs transition"
      style={{
        borderColor: active ? `${accent}66` : "rgba(255,255,255,0.10)",
        background: active ? `${accent}1f` : "rgba(255,255,255,0.03)",
        color: active ? accent : "rgba(255,255,255,0.6)",
      }}
    >
      {label}
    </button>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-2xl glass-card p-5"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-white/45">{label}</span>
        <Icon className="h-4 w-4" style={{ color: accent }} />
      </div>
      <div className="mt-3 font-display text-3xl font-bold" style={{ color: accent }}>
        {value}
      </div>
    </motion.div>
  );
}
