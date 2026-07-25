import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarDays, Video, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/membros/MemberShell";
import { LockedContent } from "@/components/membros/LockedContent";
import { usePlan } from "@/hooks/use-member";
import { hasAccess } from "@/lib/member";

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
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: CalendarDays, title: "Próxima sessão", body: "Toda quinta-feira, 20h (BRT). O link é liberado aqui 15 minutos antes." },
            { icon: Video, title: "Revisão de VOD", body: "Envie sua partida e receba a análise comentada em até 72h." },
            { icon: MessageSquare, title: "Canal direto", body: "Fale com o QCK no canal privado da mentoria durante a semana." },
          ].map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.07 }}
              className="rounded-3xl glass-card p-7"
            >
              <c.icon className="h-5 w-5 text-[#00F5FF]" />
              <h3 className="mt-5 font-display text-lg font-bold">{c.title}</h3>
              <p className="mt-2 text-sm text-white/55">{c.body}</p>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
