import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, GraduationCap, Users, Sparkles, BarChart3, User, Settings,
  LifeBuoy, LogOut, Menu, X, Gamepad2, TrendingUp,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, usePlan } from "@/hooks/use-member";
import { PLAN_LABEL } from "@/lib/member";

const nav = [
  { label: "Início", to: "/app", icon: Home },
  { label: "Curso", to: "/app/curso", icon: GraduationCap },
  { label: "Mentoria", to: "/app/mentoria", icon: Sparkles },
  { label: "Comunidade", to: "/app/comunidade", icon: Users },
  { label: "Meu Progresso", to: "/app/progresso", icon: BarChart3 },
  { label: "Perfil Valorant", to: "/app/valorant", icon: Gamepad2 },
  { label: "Minha Evolução", to: "/app/evolucao", icon: TrendingUp },
  { label: "Perfil", to: "/app/perfil", icon: User },
  { label: "Configurações", to: "/app/configuracoes", icon: Settings },
  { label: "Suporte", to: "/app/suporte", icon: LifeBuoy },
] as const;


export function MemberShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  const plan = usePlan();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const initials = (profile?.full_name || profile?.email || "R").slice(0, 2).toUpperCase();

  const SidebarInner = (
    <div className="flex h-full flex-col">
      <Link to="/app" className="flex items-center gap-2.5 px-5 py-6">
        <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-[#7B2EFF] via-[#6F4BFF] to-[#00F5FF] p-[1.5px] shadow-[0_0_20px_rgba(123,46,255,0.6)]">
          <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0a0a0a] font-display text-sm font-bold">R</div>
        </div>
        <div className="leading-tight">
          <div className="font-display text-sm font-semibold">Projeto <span className="text-gradient-brand">Radiante</span></div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Área de Membros</div>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const active = item.to === "/app" ? pathname === "/app" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                active ? "text-white" : "text-white/55 hover:text-white hover:bg-white/5"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl border border-white/10 bg-gradient-to-r from-[#7B2EFF]/25 to-[#00F5FF]/10 shadow-[0_0_30px_-10px_rgba(123,46,255,0.9)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <item.icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <div className="rounded-2xl glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7B2EFF] to-[#00F5FF] text-xs font-bold">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{profile?.full_name ?? "Aluno"}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">
                {plan ? PLAN_LABEL[plan] : "Sem plano"}
              </div>
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#050505]">
      {/* ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-[#7B2EFF]/20 blur-[140px]" />
        <div className="absolute -right-40 bottom-0 h-[520px] w-[520px] rounded-full bg-[#00AEEF]/15 blur-[150px]" />
      </div>

      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] border-r border-white/8 bg-black/40 backdrop-blur-2xl lg:block">
        {SidebarInner}
      </aside>

      {/* mobile */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/8 bg-black/60 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button onClick={() => setOpen(true)} className="rounded-lg border border-white/10 bg-white/5 p-2" aria-label="Abrir menu">
          <Menu className="h-4 w-4" />
        </button>
        <span className="font-display text-sm font-semibold">Área de Membros</span>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#7B2EFF] to-[#00F5FF] text-center text-[11px] leading-8 font-bold">{initials}</div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-white/10 bg-[#08060f]/95 backdrop-blur-2xl lg:hidden"
            >
              <button onClick={() => setOpen(false)} className="absolute right-3 top-4 rounded-lg border border-white/10 bg-white/5 p-1.5" aria-label="Fechar menu">
                <X className="h-4 w-4" />
              </button>
              {SidebarInner}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="relative z-10 lg:pl-[272px]">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="mb-8"
    >
      {eyebrow && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00F5FF] shadow-[0_0_10px_#00F5FF]" />
          {eyebrow}
        </div>
      )}
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-sm text-white/55">{subtitle}</p>}
    </motion.div>
  );
}
