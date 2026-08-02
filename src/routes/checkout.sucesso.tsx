import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, Rocket } from "lucide-react";

export const Route = createFileRoute("/checkout/sucesso")({
  head: () => ({
    meta: [
      { title: "Pagamento aprovado — Projeto Radiante" },
      { name: "description", content: "Sua matrícula no Projeto Radiante foi confirmada. Acesse a plataforma." },
      { property: "og:title", content: "Pagamento aprovado — Projeto Radiante" },
      { property: "og:description", content: "Sua matrícula foi confirmada. Acesse a plataforma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(0,245,255,0.25),transparent_70%)] blur-2xl" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-xl rounded-3xl glass-card p-10 text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7B2EFF] to-[#00F5FF] shadow-[0_0_50px_-10px_rgba(0,245,255,0.9)]">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold">Pagamento aprovado</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          Sua matrícula foi confirmada e o plano já está liberado. Enviamos um e-mail de boas-vindas — se este é seu
          primeiro acesso, ele traz o link para você criar sua senha.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link to="/app" className="btn-hero inline-flex">
            <Rocket className="h-5 w-5" />
            Acessar a plataforma
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-4 text-sm font-semibold transition-colors hover:bg-white/[0.08]"
          >
            <Mail className="h-4 w-4" />
            Já tenho senha, entrar
          </Link>
        </div>

        <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-white/35">
          A liberação pode levar alguns segundos após a confirmação
        </p>
      </motion.div>
    </main>
  );
}
