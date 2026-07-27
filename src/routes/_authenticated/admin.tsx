import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { ShieldAlert, Loader2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useIsAdmin } from "@/hooks/use-admin";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { data: isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white/50">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-6">
        <div className="max-w-md rounded-3xl glass-card p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7B2EFF] to-[#00AEEF]">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold">Acesso restrito</h1>
          <p className="mt-3 text-sm text-white/55">
            Esta área é exclusiva para administradores do Projeto Radiante.
          </p>
          <Link to="/app" className="mt-7 inline-flex rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm transition hover:bg-white/10">
            Voltar à área de membros
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
