import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PlayCircle, Trophy, Flame, BookOpen, Megaphone, ArrowRight, History, Gamepad2 } from "lucide-react";
import { PageHeader } from "@/components/membros/MemberShell";
import { useProfile, usePlan, useLessons, useModules, useProgress, useAnnouncements } from "@/hooks/use-member";
import { useRankHistory } from "@/hooks/use-valorant";
import { PLAN_LABEL, PLAN_ACCENT } from "@/lib/member";
import { tierColor } from "@/lib/valorant";
import { StatCard, Reveal } from "@/components/ui/premium";



export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({
    meta: [
      { title: "Início · Área de Membros — Projeto Radiante" },
      { name: "description", content: "Seu painel do Projeto Radiante: progresso, última aula assistida e avisos do QCK." },
      { property: "og:title", content: "Painel do Aluno — Projeto Radiante" },
      { property: "og:description", content: "Acompanhe sua evolução dentro do Projeto Radiante." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardHome,
});

function DashboardHome() {
  const { data: profile } = useProfile();
  const plan = usePlan();
  const { data: lessons = [] } = useLessons();
  const { data: modules = [] } = useModules();
  const { data: progress = [] } = useProgress();
  const { data: announcements = [] } = useAnnouncements();
  const { data: rankHistory = [] } = useRankHistory();

  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id));
  const total = lessons.length;
  const done = lessons.filter((l) => completedIds.has(l.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const next = lessons.find((l) => !completedIds.has(l.id)) ?? lessons[0];
  const nextModule = modules.find((m) => m.id === next?.module_id);

  const lastTouched = [...progress]
    .filter((p) => p.updated_at)
    .sort((a, b) => new Date(b.updated_at!).getTime() - new Date(a.updated_at!).getTime())[0];
  const lastLesson = lessons.find((l) => l.id === lastTouched?.lesson_id);
  const lastRank = rankHistory[rankHistory.length - 1];


  const firstName = (profile?.full_name ?? "Radiante").split(" ")[0];

  return (
    <>
      <PageHeader
        eyebrow={plan ? `Plano ${PLAN_LABEL[plan]}` : "Sem plano ativo"}
        title={`Bem-vindo, ${firstName}.`}
        subtitle="Seu progresso, sua próxima aula e tudo que o QCK preparou para você hoje."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl glass-card p-7 lg:col-span-2"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#7B2EFF]/30 blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/45">
              <PlayCircle className="h-3.5 w-3.5" /> Continuar de onde parou
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">{next?.title ?? "Curso em preparação"}</h2>
            <p className="mt-2 text-sm text-white/55">
              {nextModule ? `${nextModule.title} · ` : ""}
              {next?.description ?? "Novas aulas serão liberadas em breve."}
            </p>
            {next && (
              <Link to="/app/curso/$slug" params={{ slug: next.slug }} className="btn-hero mt-7 inline-flex">
                <PlayCircle className="h-5 w-5" /> Assistir aula
              </Link>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
          className="rounded-3xl glass-card p-7"
        >
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/45">
            <Trophy className="h-3.5 w-3.5" /> Progresso geral
          </div>
          <div className="mt-5 font-display text-5xl font-bold text-gradient-brand">{pct}%</div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/8">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-[#7B2EFF] via-[#6F4BFF] to-[#00F5FF] shadow-[0_0_18px_rgba(0,245,255,0.6)]"
            />
          </div>
          <p className="mt-3 text-xs text-white/45">{done} de {total} aulas concluídas</p>
        </motion.div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Módulos liberados" value={String(modules.length)} accent="#6F4BFF" />
        <StatCard icon={Flame} label="Aulas concluídas" value={String(done)} accent="#00AEEF" delay={0.05} />
        <StatCard
          icon={Trophy}
          label="Seu plano"
          value={plan ? PLAN_LABEL[plan] : "—"}
          accent={plan ? PLAN_ACCENT[plan] : "#7B2EFF"}
          delay={0.1}
        />
        <StatCard
          icon={Gamepad2}
          label="Último elo registrado"
          value={lastRank ? `${lastRank.rank_tier}` : "—"}
          accent={lastRank ? tierColor(lastRank.rank_tier) : "#00F5FF"}
          delay={0.15}
        />
      </div>


      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-3xl glass-card p-7 hover-lift sheen">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/45">
              <History className="h-3.5 w-3.5" /> Última aula assistida
            </div>
            <div className="mt-4 font-display text-lg font-semibold">{lastLesson?.title ?? "Nenhuma ainda"}</div>
            <p className="mt-1 text-sm text-white/50">
              {lastTouched?.updated_at
                ? `Atualizada em ${new Date(lastTouched.updated_at).toLocaleDateString("pt-BR")}`
                : "Comece pela primeira aula da trilha."}
            </p>
            {lastLesson && (
              <Link
                to="/app/curso/$slug"
                params={{ slug: lastLesson.slug }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white/80 transition hover:-translate-y-0.5 hover:border-[#00F5FF]/50 hover:text-white"
              >
                <PlayCircle className="h-4 w-4" /> Continuar estudando
              </Link>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="h-full rounded-3xl glass-card p-7 hover-lift sheen">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/45">
              <ArrowRight className="h-3.5 w-3.5" /> Próxima aula
            </div>
            <div className="mt-4 font-display text-lg font-semibold">{next?.title ?? "Em preparação"}</div>
            <p className="mt-1 text-sm text-white/50">{nextModule?.title ?? "Novas aulas em breve."}</p>
            {next && (
              <Link
                to="/app/curso/$slug"
                params={{ slug: next.slug }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white/80 transition hover:-translate-y-0.5 hover:border-[#7B2EFF]/60 hover:text-white"
              >
                <PlayCircle className="h-4 w-4" /> Começar agora
              </Link>
            )}
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-5">
        <div className="rounded-3xl glass-card p-7">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/45">
            <Megaphone className="h-3.5 w-3.5" /> Avisos
          </div>
          <div className="mt-5 space-y-4">
            {announcements.length === 0 && (
              <p className="text-sm text-white/45">Nenhum aviso por enquanto. Bons treinos.</p>
            )}
            {announcements.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition hover:border-[#7B2EFF]/40 hover:bg-white/[0.05]"
              >
                <div className="text-sm font-semibold">{a.title}</div>
                <p className="mt-1 text-sm text-white/55">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Link
        to="/app/curso"
        className="group mt-5 flex items-center justify-between rounded-3xl glass-card p-6 transition hover:-translate-y-0.5 hover:border-white/20"
      >
        <span className="text-sm text-white/70">Ver toda a trilha de aulas</span>
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </Link>
    </>
  );
}

