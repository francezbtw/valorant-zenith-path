import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { ShieldAlert, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { useIsMentor } from "@/hooks/use-admin";

export const Route = createFileRoute("/_authenticated/mentor")({
  component: MentorLayout,
});

function MentorLayout() {
  const { data: isMentor, isLoading } = useIsMentor();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white/50">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!isMentor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-6">
        <div className="max-w-md rounded-3xl glass-card p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7B2EFF] to-[#00AEEF]">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold">Área exclusiva de mentores</h1>
          <p className="mt-3 text-sm text-white/55">
            Peça a um administrador para liberar seu acesso de mentor.
          </p>
          <Link to="/app" className="mt-7 inline-flex rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm transition hover:bg-white/10">
            Voltar à área de membros
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050505]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-[#7B2EFF]/20 blur-[140px]" />
        <div className="absolute -right-40 bottom-0 h-[520px] w-[520px] rounded-full bg-[#00F5FF]/12 blur-[150px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/8 bg-black/50 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link to="/mentor" className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-[#7B2EFF] via-[#6F4BFF] to-[#00F5FF] p-[1.5px] shadow-[0_0_20px_rgba(123,46,255,0.6)]">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0a0a0a]">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm font-semibold">
                Painel do <span className="text-gradient-brand">Mentor</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Projeto Radiante</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {pathname !== "/mentor" && (
              <Link
                to="/mentor"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Solicitações
              </Link>
            )}
            <Link
              to="/app"
              className="hidden rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              Área de membros
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}
