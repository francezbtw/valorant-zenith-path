import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { PLAN_LABEL, type PlanTier } from "@/lib/member";

export function LockedContent({ required, context }: { required: PlanTier; context?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl glass-card p-10 text-center"
    >
      <div className="pointer-events-none absolute -inset-20 bg-[radial-gradient(ellipse_at_center,rgba(123,46,255,0.35),transparent_65%)] blur-3xl" />
      <div className="relative z-10 mx-auto max-w-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#7B2EFF]/40 to-[#00F5FF]/20 shadow-[0_0_50px_-10px_rgba(123,46,255,0.9)]">
          <Lock className="h-7 w-7 text-white" />
        </div>
        <h2 className="mt-6 font-display text-2xl font-bold sm:text-3xl">Conteúdo bloqueado</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          {context ?? "Este conteúdo"} faz parte do plano{" "}
          <span className="font-semibold text-white">{PLAN_LABEL[required]}</span>. Faça o upgrade
          para desbloquear todas as aulas, materiais e sessões desse nível.
        </p>
        <Link to="/" hash="planos" className="btn-hero mt-8 inline-flex">
          <Sparkles className="h-5 w-5" />
          Fazer upgrade do plano
        </Link>
        <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/35">
          Upgrade imediato · Garantia de 7 dias
        </p>
      </div>
    </motion.div>
  );
}
