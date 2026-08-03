import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PlayCircle, Target, Clock, TrendingUp, Check, Flame } from "lucide-react";
import { PageHeader } from "@/components/membros/MemberShell";
import { useProfile, useLessons, useModules, useProgress } from "@/hooks/use-member";
import { useMyStats, useTasks, useToggleTask } from "@/hooks/use-community";
import { tierColor, tierIndex } from "@/lib/community";
import { Reveal, Tilt } from "@/components/ui/premium";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({
    meta: [
      { title: "Início · Área de Membros — Projeto Radiante" },
      { name: "description", content: "Seu painel minimalista do Projeto Radiante: próxima aula, objetivo e plano de evolução." },
      { property: "og:title", content: "Painel do Aluno — Projeto Radiante" },
      { property: "og:description", content: "Continue sua jornada rumo ao Radiante." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardHome,
});

function DashboardHome() {
  const { data: profile } = useProfile();
  const { data: lessons = [] } = useLessons();
  const { data: modules = [] } = useModules();
  const { data: progress = [] } = useProgress();
  const { data: stats } = useMyStats();
  const { data: tasks = [] } = useTasks();
  const toggleTask = useToggleTask();

  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id));
  const total = lessons.length;
  const done = lessons.filter((l) => completedIds.has(l.id)).length;
  const coursePct = total ? Math.round((done / total) * 100) : 0;
  const next = lessons.find((l) => !completedIds.has(l.id)) ?? lessons[0];
  const nextModule = modules.find((m) => m.id === next?.module_id);

  const firstName = (profile?.full_name ?? "Radiante").split(" ")[0];

  const goal = stats?.goal_tier ?? "Radiante";
  const currentTier = stats?.current_tier ?? profile?.current_rank ?? null;
  const entryIdx = Math.max(0, tierIndex(stats?.entry_tier));
  const curIdx = tierIndex(currentTier);
  const goalIdx = tierIndex(goal);
  const tierPct =
    curIdx >= 0 && goalIdx > entryIdx
      ? Math.round((Math.max(0, curIdx - entryIdx) / (goalIdx - entryIdx)) * 100)
      : 0;

  const tasksDone = tasks.filter((t) => t.done).length;
  const tasksPct = tasks.length ? Math.round((tasksDone / tasks.length) * 100) : 0;
  const goalPct = Math.min(100, Math.round(tierPct * 0.5 + coursePct * 0.3 + tasksPct * 0.2));

  const hours = Number(stats?.hours_studied ?? 0);

  return (
    <>
      <PageHeader
        eyebrow="Sua jornada"
        title={`Bem-vindo, ${firstName}.`}
        subtitle="Um passo por dia. É assim que se chega ao Radiante."
      />

      {/* Continue sua Jornada */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[28px] glass-card p-8 sm:p-10"
      >
        <div className="pointer-events-none absolute -right-32 -top-32 h-[380px] w-[380px] rounded-full bg-[#7B2EFF]/25 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-[320px] w-[320px] rounded-full bg-[#00F5FF]/12 blur-[120px]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00F5FF] shadow-[0_0_10px_#00F5FF]" />
            Continue sua jornada
          </div>
          <h2 className="mt-5 max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl">
            {next?.title ?? "Sua trilha está sendo preparada"}
          </h2>
          <p className="mt-3 max-w-xl text-sm text-white/55">
            {nextModule ? `${nextModule.title} · ` : ""}
            {next?.description ?? "Em breve novas aulas serão liberadas para o seu plano."}
          </p>
          {next && (
            <Link to="/app/curso/$slug" params={{ slug: next.slug }} className="btn-hero mt-8 inline-flex">
              <PlayCircle className="h-5 w-5" /> Continuar assistindo
            </Link>
          )}
        </div>
      </motion.div>

      {/* Três cards */}
      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <MetricCard
          delay={0}
          icon={TrendingUp}
          label="Progresso do curso"
          value={`${coursePct}%`}
          accent="#7B2EFF"
          bar={coursePct}
          hint={`${done} de ${total} aulas`}
        />
        <MetricCard
          delay={0.06}
          icon={Target}
          label="Objetivo atual"
          value={goal}
          accent={tierColor(goal)}
          bar={goalPct}
          hint={currentTier ? `Agora: ${currentTier}` : "Defina seu elo em Perfil Valorant"}
        />
        <MetricCard
          delay={0.12}
          icon={Clock}
          label="Horas de estudo"
          value={`${hours.toFixed(1)}h`}
          accent="#00F5FF"
          bar={Math.min(100, (hours / 50) * 100)}
          hint={stats?.streak_days ? `${stats.streak_days} dias de sequência` : "Comece sua sequência hoje"}
        />
      </div>

      {/* Minhas Mentorias */}
      <MentorshipCard />



      {/* Plano de Evolução */}
      <Reveal className="mt-5">
        <div className="relative overflow-hidden rounded-[28px] glass-card p-7 sm:p-9">
          <div className="pointer-events-none absolute -right-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#6F4BFF]/18 blur-[110px]" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
                  <Flame className="h-3.5 w-3.5" /> Plano de evolução
                </div>
                <h3 className="mt-3 font-display text-2xl font-bold">Suas próximas tarefas</h3>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">Objetivo: {goal}</div>
                <div
                  className="font-display text-4xl font-bold"
                  style={{ color: tierColor(goal) }}
                >
                  {goalPct}%
                </div>
              </div>
            </div>

            <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-white/8">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goalPct}%` }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-[#7B2EFF] via-[#6F4BFF] to-[#00F5FF] shadow-[0_0_20px_rgba(0,245,255,0.55)]"
              />
            </div>

            <ul className="mt-7 space-y-3">
              {tasks.map((t, i) => (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <button
                    onClick={() => toggleTask.mutate({ id: t.id, done: !t.done })}
                    className={`group flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all ${
                      t.done
                        ? "border-[#00F5FF]/35 bg-[#00F5FF]/[0.06]"
                        : "border-white/8 bg-white/[0.03] hover:-translate-y-0.5 hover:border-[#7B2EFF]/45 hover:bg-white/[0.05]"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
                        t.done
                          ? "border-transparent bg-gradient-to-br from-[#7B2EFF] to-[#00F5FF] shadow-[0_0_16px_rgba(0,245,255,0.5)]"
                          : "border-white/20 group-hover:border-white/40"
                      }`}
                    >
                      {t.done && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span className={`text-sm ${t.done ? "text-white/50 line-through" : "text-white/85"}`}>
                      {t.title}
                    </span>
                  </button>
                </motion.li>
              ))}
              {tasks.length === 0 && (
                <li className="text-sm text-white/45">Carregando seu plano de evolução…</li>
              )}
            </ul>

            <p className="mt-5 text-xs text-white/40">
              {tasksDone} de {tasks.length} tarefas concluídas nesta etapa.
            </p>
          </div>
        </div>
      </Reveal>
    </>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
  bar,
  hint,
  delay,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
  accent: string;
  bar: number;
  hint?: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <Tilt className="group h-full rounded-3xl" intensity={5} glow={`${accent}33`}>
        <div className="relative h-full overflow-hidden rounded-3xl glass-card p-6 hover-lift">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">{label}</span>
            <Icon className="h-4 w-4 shrink-0" style={{ color: accent }} />
          </div>
          <div className="mt-4 font-display text-3xl font-bold tracking-tight" style={{ color: accent }}>
            {value}
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.max(2, Math.min(100, bar))}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full"
              style={{ background: accent, boxShadow: `0 0 14px ${accent}` }}
            />
          </div>
          {hint && <div className="mt-3 text-xs text-white/40">{hint}</div>}
          <div
            className="pointer-events-none absolute -bottom-14 -right-14 h-36 w-36 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
            style={{ background: accent }}
          />
        </div>
      </Tilt>
    </Reveal>
  );
}
