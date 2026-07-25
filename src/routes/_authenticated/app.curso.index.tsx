import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { PageHeader } from "@/components/membros/MemberShell";
import { useLessons, useModules, useProgress, usePlan } from "@/hooks/use-member";
import { PLAN_LABEL, hasAccess, formatDuration } from "@/lib/member";

export const Route = createFileRoute("/_authenticated/app/curso/")({
  head: () => ({
    meta: [
      { title: "Curso · Área de Membros — Projeto Radiante" },
      { name: "description", content: "Trilha completa de módulos e aulas do Projeto Radiante, do fundamento ao nível Radiante." },
      { property: "og:title", content: "Curso — Projeto Radiante" },
      { property: "og:description", content: "Todos os módulos e aulas da mentoria de Valorant do QCK." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CoursePage,
});

function CoursePage() {
  const { data: modules = [] } = useModules();
  const { data: lessons = [] } = useLessons();
  const { data: progress = [] } = useProgress();
  const plan = usePlan();

  const completed = new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id));

  return (
    <>
      <PageHeader
        eyebrow="Trilha completa"
        title="Curso Projeto Radiante"
        subtitle="Módulos organizados na ordem exata em que o QCK constrói um jogador de elite."
      />

      <div className="space-y-6">
        {modules.map((mod, i) => {
          const unlocked = hasAccess(plan, mod.tier);
          const modLessons = lessons.filter((l) => l.module_id === mod.id);
          const doneCount = modLessons.filter((l) => completed.has(l.id)).length;

          return (
            <motion.section
              key={mod.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: i * 0.04 }}
              className="relative overflow-hidden rounded-3xl glass-card p-6 sm:p-7"
            >
              <div className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full blur-3xl opacity-40" style={{ background: mod.cover_color ?? "#7B2EFF" }} />
              <div className="relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                      Módulo {String(i + 1).padStart(2, "0")} · {PLAN_LABEL[mod.tier]}
                    </div>
                    <h2 className="mt-2 font-display text-xl font-bold sm:text-2xl">{mod.title}</h2>
                    {mod.description && <p className="mt-1 max-w-2xl text-sm text-white/50">{mod.description}</p>}
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-bold">{doneCount}/{modLessons.length}</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">concluídas</div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  {!unlocked && modLessons.length === 0 && (
                    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4 text-sm text-white/45">
                      <Lock className="h-4 w-4" /> Disponível no plano {PLAN_LABEL[mod.tier]}
                    </div>
                  )}
                  {modLessons.map((lesson) => {
                    const isDone = completed.has(lesson.id);
                    return (
                      <Link
                        key={lesson.id}
                        to="/app/curso/$slug"
                        params={{ slug: lesson.slug }}
                        className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3.5 transition hover:border-white/20 hover:bg-white/[0.06]"
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5 text-[#00F5FF]" />
                        ) : (
                          <PlayCircle className="h-5 w-5 text-white/45 transition group-hover:text-white" />
                        )}
                        <span className="flex-1 text-sm">{lesson.title}</span>
                        <span className="text-xs text-white/35">{formatDuration(lesson.duration_seconds ?? 0)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.section>
          );
        })}
      </div>
    </>
  );
}
