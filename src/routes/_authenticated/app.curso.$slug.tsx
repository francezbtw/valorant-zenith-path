import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/membros/MemberShell";
import { LockedContent } from "@/components/membros/LockedContent";
import { useLessons, useModules, useProgress, useToggleLesson, useLessonMedia, useSaveLessonPosition } from "@/hooks/use-member";
import { VideoPlayer } from "@/components/membros/VideoPlayer";
import { formatDuration } from "@/lib/member";

export const Route = createFileRoute("/_authenticated/app/curso/$slug")({
  head: () => ({
    meta: [
      { title: "Aula · Curso — Projeto Radiante" },
      { name: "description", content: "Assista à aula, baixe os materiais e marque seu progresso no Projeto Radiante." },
      { property: "og:title", content: "Aula — Projeto Radiante" },
      { property: "og:description", content: "Player premium, materiais de apoio e controle de progresso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LessonPage,
});

function LessonPage() {
  const { slug } = useParams({ from: "/_authenticated/app/curso/$slug" });
  const { data: lessons = [], isLoading } = useLessons();
  const { data: modules = [] } = useModules();
  const { data: progress = [] } = useProgress();
  const toggle = useToggleLesson();
  const savePosition = useSaveLessonPosition();
  const lessonId = lessons.find((l) => l.slug === slug)?.id;
  const { data: media } = useLessonMedia(lessonId);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
      </div>
    );
  }

  const lesson = lessons.find((l) => l.slug === slug);
  if (!lesson) {
    return (
      <>
        <PageHeader title="Aula indisponível" subtitle="Esta aula não existe ou não está liberada no seu plano." />
        <LockedContent required="intermediario" context="Esta aula" />
      </>
    );
  }

  const mod = modules.find((m) => m.id === lesson.module_id);
  const ordered = lessons.filter((l) => l.module_id === lesson.module_id);
  const idx = ordered.findIndex((l) => l.id === lesson.id);
  const prev = ordered[idx - 1];
  const next = ordered[idx + 1];
  const isDone = progress.some((p) => p.lesson_id === lesson.id && p.completed);
  const materials = media?.materials ?? (Array.isArray(lesson.materials) ? (lesson.materials as { name: string; url: string }[]).filter((m) => m.url) : []);

  return (
    <>
      <Link to="/app/curso" className="mb-6 inline-flex items-center gap-2 text-xs text-white/45 transition hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o curso
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="pointer-events-none absolute -inset-10 rounded-[3rem] bg-[radial-gradient(ellipse_at_center,rgba(123,46,255,0.35),transparent_65%)] blur-3xl" />
        <div className="relative monitor-frame holo-border rounded-[1.5rem]">
          <div className="relative overflow-hidden rounded-[1.1rem] border border-white/10 bg-black">
            <VideoPlayer
              key={lesson.id}
              src={media?.videoUrl ?? lesson.video_url ?? null}
              startAt={progress.find((p) => p.lesson_id === lesson.id)?.last_position_seconds ?? 0}
              onProgress={(seconds) => savePosition.mutate({ lessonId: lesson.id, seconds })}
              onCompleted={() => {
                if (!progress.some((p) => p.lesson_id === lesson.id && p.completed)) {
                  toggle.mutate({ lessonId: lesson.id, completed: true });
                }
              }}
            />
          </div>
        </div>
      </motion.div>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
            {mod?.title} · {formatDuration(lesson.duration_seconds ?? 0)}
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{lesson.title}</h1>
          {lesson.description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">{lesson.description}</p>}
        </div>

        <button
          onClick={() =>
            toggle.mutate(
              { lessonId: lesson.id, completed: !isDone },
              { onSuccess: () => toast.success(isDone ? "Aula reaberta." : "Aula concluída!") },
            )
          }
          disabled={toggle.isPending}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition ${
            isDone
              ? "border border-[#00F5FF]/40 bg-[#00F5FF]/10 text-[#00F5FF]"
              : "border border-white/12 bg-white/5 text-white hover:bg-white/10"
          }`}
        >
          {toggle.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {isDone ? "Concluída" : "Marcar como concluída"}
        </button>
      </div>

      {materials.length > 0 && (
        <div className="mt-8 rounded-3xl glass-card p-6">
          <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Materiais da aula</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {materials.map((m) => (
              <a
                key={m.url}
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3.5 text-sm transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                <Download className="h-4 w-4 text-white/45 transition group-hover:text-[#00F5FF]" />
                <span className="flex-1">{m.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        {prev ? (
          <Link to="/app/curso/$slug" params={{ slug: prev.slug }} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm transition hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" /> Anterior
          </Link>
        ) : <span />}
        {next && (
          <Link to="/app/curso/$slug" params={{ slug: next.slug }} className="btn-hero">
            Próxima aula <ArrowRight className="h-5 w-5" />
          </Link>
        )}
      </div>
    </>
  );
}
