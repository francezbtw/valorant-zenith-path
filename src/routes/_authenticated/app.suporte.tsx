import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, MessageCircle, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/membros/MemberShell";

export const Route = createFileRoute("/_authenticated/app/suporte")({
  head: () => ({
    meta: [
      { title: "Suporte · Área de Membros — Projeto Radiante" },
      { name: "description", content: "Fale com o time do Projeto Radiante: dúvidas de acesso, pagamento e conteúdo." },
      { property: "og:title", content: "Suporte — Projeto Radiante" },
      { property: "og:description", content: "Atendimento rápido para alunos do Projeto Radiante." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuportePage,
});

const faqs = [
  { q: "Não consigo acessar meu plano", a: "Se você acabou de comprar, a liberação é automática em poucos minutos. Caso não apareça, fale com o suporte informando o e-mail usado na compra." },
  { q: "Posso fazer upgrade de plano?", a: "Sim. O upgrade é imediato e você paga apenas a diferença entre os planos." },
  { q: "As aulas ficam disponíveis por quanto tempo?", a: "Enquanto seu plano estiver ativo você acessa todas as aulas do seu nível, incluindo atualizações." },
];

function SuportePage() {
  return (
    <>
      <PageHeader eyebrow="Estamos com você" title="Suporte" subtitle="Resolvemos qualquer problema de acesso em até 24h úteis." />

      <div className="grid gap-5 sm:grid-cols-2">
        <a href="mailto:suporte@projetoradiante.com" className="group rounded-3xl glass-card p-7 transition hover:border-white/20">
          <Mail className="h-5 w-5 text-[#00F5FF]" />
          <h3 className="mt-5 font-display text-lg font-bold">E-mail</h3>
          <p className="mt-2 text-sm text-white/55">suporte@projetoradiante.com</p>
        </a>
        <div className="rounded-3xl glass-card p-7">
          <MessageCircle className="h-5 w-5 text-[#00F5FF]" />
          <h3 className="mt-5 font-display text-lg font-bold">Chat da comunidade</h3>
          <p className="mt-2 text-sm text-white/55">Canal #suporte no servidor privado dos alunos.</p>
        </div>
      </div>

      <div className="mt-5 rounded-3xl glass-card p-7">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/45">
          <HelpCircle className="h-3.5 w-3.5" /> Dúvidas frequentes
        </div>
        <div className="mt-5 space-y-3">
          {faqs.map((f, i) => (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-5"
            >
              <div className="text-sm font-semibold">{f.q}</div>
              <p className="mt-1.5 text-sm text-white/55">{f.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
