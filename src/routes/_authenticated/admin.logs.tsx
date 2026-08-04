import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ScrollText, Search } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminShell";
import { useAdminLogs } from "@/hooks/use-admin-ops";

export const Route = createFileRoute("/_authenticated/admin/logs")({
  head: () => ({
    meta: [
      { title: "Logs administrativos · Console Admin — Projeto Radiante" },
      { name: "description", content: "Auditoria completa das ações realizadas no painel administrativo." },
      { property: "og:title", content: "Logs — Console Admin" },
      { property: "og:description", content: "Registro de quem alterou o quê e quando na plataforma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: logs = [] } = useAdminLogs();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return logs;
    return logs.filter((l) =>
      `${l.action} ${l.entity ?? ""} ${l.entity_id ?? ""} ${l.actor_email ?? ""}`.toLowerCase().includes(s),
    );
  }, [logs, q]);

  return (
    <>
      <AdminHeader title="Logs administrativos" subtitle="Auditoria de todas as ações críticas realizadas no painel." />

      <div className="rounded-2xl glass-card p-4 sm:p-6">
        <div className="relative mb-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por ação, entidade ou responsável"
            aria-label="Buscar nos logs"
            className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#00F5FF]/40"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="py-14 text-center text-sm text-white/45">Nenhum registro ainda.</p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((l) => (
              <li key={l.id} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm">
                <ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-[#00F5FF]" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-white/90">{l.action}</span>
                    {l.entity && <span className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] text-white/55">{l.entity}</span>}
                  </div>
                  <div className="mt-1 truncate text-xs text-white/45">
                    {l.actor_email ?? l.actor_id ?? "—"} · {l.entity_id ?? "—"}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-white/40">{new Date(l.created_at).toLocaleString("pt-BR")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
