import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminShell";

const channels = [
  { icon: Mail, title: "E-mail", desc: "suporte@projetoradiante.com" },
  { icon: MessageCircle, title: "Discord", desc: "Canal #suporte da comunidade" },
];

export const Route = createFileRoute("/_authenticated/admin/suporte")({
  head: () => ({
    meta: [
      { title: "Suporte · Console Admin — Projeto Radiante" },
      { name: "description", content: "Canais de atendimento aos alunos do Projeto Radiante." },
      { property: "og:title", content: "Suporte — Console Admin" },
      { property: "og:description", content: "Canais de atendimento aos alunos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <AdminHeader title="Suporte" subtitle="Canais de atendimento aos alunos." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {channels.map((c) => (
          <div key={c.title} className="rounded-2xl glass-card p-6">
            <c.icon className="h-5 w-5 text-[#00F5FF]" />
            <h2 className="mt-4 font-display text-lg font-semibold">{c.title}</h2>
            <p className="mt-1 text-sm text-white/55">{c.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
}
