import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, GraduationCap, Layers, PlayCircle, Sparkles,
  CreditCard, Ticket, FileText, Settings, BarChart3, LifeBuoy, Menu, X,
  ArrowLeft, ShieldCheck, Package,
} from "lucide-react";

const nav = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Alunos", to: "/admin/alunos", icon: Users },
  { label: "Cursos", to: "/admin/cursos", icon: GraduationCap },
  { label: "Módulos", to: "/admin/modulos", icon: Layers },
  { label: "Aulas", to: "/admin/aulas", icon: PlayCircle },
  { label: "Mentorias", to: "/admin/mentorias", icon: Sparkles },
  { label: "Planos", to: "/admin/planos", icon: Package },
  { label: "Pagamentos", to: "/admin/pagamentos", icon: CreditCard },
  { label: "Cupons", to: "/admin/cupons", icon: Ticket },
  { label: "Conteúdo", to: "/admin/conteudo", icon: FileText },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  { label: "Configurações", to: "/admin/configuracoes", icon: Settings },
  { label: "Suporte", to: "/admin/suporte", icon: LifeBuoy },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useNavigate();

  const Inner = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6">
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-[#7B2EFF] via-[#6F4BFF] to-[#00F5FF] p-[1.5px] shadow-[0_0_20px_rgba(123,46,255,0.6)]">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0a0a0a]">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-semibold">Console <span className="text-gradient-brand">Admin</span></div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Projeto Radiante</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {nav.map((item) => {
          const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                active ? "text-white" : "text-white/55 hover:bg-white/5 hover:text-white"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="admin-nav-active"
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
        <Link
          to="/app"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar à área de membros
        </Link>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#050505]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-[#7B2EFF]/20 blur-[140px]" />
        <div className="absolute -right-40 bottom-0 h-[520px] w-[520px] rounded-full bg-[#00AEEF]/15 blur-[150px]" />
      </div>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] border-r border-white/8 bg-black/40 backdrop-blur-2xl lg:block">
        {Inner}
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/8 bg-black/60 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button onClick={() => setOpen(true)} className="rounded-lg border border-white/10 bg-white/5 p-2" aria-label="Abrir menu">
          <Menu className="h-4 w-4" />
        </button>
        <span className="font-display text-sm font-semibold">Console Admin</span>
        <span className="w-8" />
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
              {Inner}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="relative z-10 lg:pl-[272px]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">{children}</div>
      </main>
    </div>
  );
}

export function AdminHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
      className="mb-8 flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-white/55">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  );
}
