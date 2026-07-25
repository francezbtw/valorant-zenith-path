import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, Trophy, Swords } from "lucide-react";
import { PageHeader } from "@/components/membros/MemberShell";
import { LockedContent } from "@/components/membros/LockedContent";
import { usePlan } from "@/hooks/use-member";
import { hasAccess } from "@/lib/member";

export const Route = createFileRoute("/_authenticated/app/comunidade")({
  head: () => ({
    meta: [
      { title: "Comunidade · Área de Membros — Projeto Radiante" },
      { name: "description", content: "Encontre duo, participe de scrims internas e evolua junto com a comunidade do Projeto Radiante." },
      { property: "og:title", content: "Comunidade — Projeto Radiante" },
      { property: "og:description", content: "A comunidade de jogadores que treina com método." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ComunidadePage,
});

function ComunidadePage() {
  const plan = usePlan();
  const unlocked = hasAccess(plan, "intermediario");

  return (
    <>
      <PageHeader
        eyebrow="Você não evolui sozinho"
        title="Comunidade Radiante"
        subtitle="Duos, scrims internas e ranking mensal dos alunos."
      />

      {!unlocked ? (
        <LockedContent required="intermediario" context="A comunidade privada" />
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Users, title: "Servidor privado", body: "Canal exclusivo de alunos para achar duo no seu elo." },
            { icon: Swords, title: "Scrims internas", body: "Partidas organizadas toda semana com review coletivo." },
            { icon: Trophy, title: "Ranking mensal", body: "Suba no quadro de evolução e concorra a sessões extras." },
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
