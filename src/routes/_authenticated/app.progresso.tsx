import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/membros/MemberShell";
import { useLessons, useModules, useProgress } from "@/hooks/use-member";
import { PLAN_LABEL } from "@/lib/member";

export const Route = createFileRoute("/_authenticated/app/progresso")({
  head: () => ({
    meta: [
      { title: "Meu Progresso · Área de Membros — Projeto Radiante" },
      { name: "description", content: "Acompanhe módulo a módulo o quanto você já evoluiu dentro do Projeto Radiante." },
      { property: "og:title", content: "Meu Progresso — Projeto Radiante" },
      { property: "og:description", content: "Seu histórico de aulas concluídas e evolução por módulo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProgressoPage,
});

function ProgressoPage() {
  const { data: modules = [] } = useModules();
  const { data: lessons = [] } = useLessons();
  const { data: progress = [] } = useProgress();

  const completed = new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id));
  const total = lessons.length;
  const done = lessons.filter((l) => completed.has(l.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <>
      <PageHeader eyebrow="Histórico real" title="Meu progresso" subtitle="Cada aula concluída é uma decisão a menos tomada no escuro." />

      <div className="rounded-3xl glass-card p-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Conclusão total</div>
            <div className="mt-2 font-display text-5xl font-bold text-gradient-brand">{pct}%</div>
          </div>
          <div className="text-right text-sm text-white/50">{done}/{total} aulas</div>
        </div>
        <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-white/8">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-[#7B2EFF] via-[#00AEEF] to-[#00F5FF] shadow-[0_0_20px_rgba(0,245,255,0.6)]"
          />
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {modules.map((mod, i) => {
          const modLessons = lessons.filter((l) => l.module_id === mod.id);
          const d = modLessons.filter((l) => completed.has(l.id)).length;
          const p = modLessons.length ? Math.round((d / modLessons.length) * 100) : 0;
          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: i * 0.05 }}
              className="rounded-2xl glass-card p-5"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{mod.title}</span>
                <span className="text-white/45">{PLAN_LABEL[mod.tier]} · {p}%</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-gradient-to-r from-[#7B2EFF] to-[#00F5FF]" style={{ width: `${p}%` }} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
