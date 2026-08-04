import { createFileRoute } from "@tanstack/react-router";
import { Download, Wallet, CalendarDays, TrendingUp, Ticket, RotateCcw, XCircle, ShoppingBag } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/AdminShell";
import { StatCard, Reveal } from "@/components/ui/premium";
import { formatBRL } from "@/hooks/use-admin";
import { useFinance, toCSV, downloadCSV } from "@/hooks/use-admin-ops";
import { PLAN_LABEL, type PlanTier } from "@/lib/member";

export const Route = createFileRoute("/_authenticated/admin/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro · Console Admin — Projeto Radiante" },
      { name: "description", content: "Receita, vendas, ticket médio, reembolsos e exportação em CSV." },
      { property: "og:title", content: "Financeiro — Console Admin" },
      { property: "og:description", content: "Receita total, mensal e anual, receita por plano e exportação CSV." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

const COLORS = ["#7B2EFF", "#00AEEF", "#00F5FF", "#6F4BFF"];

function Page() {
  const { data: f } = useFinance();

  const cards = [
    { label: "Receita total", value: formatBRL(f?.total ?? 0), icon: Wallet, accent: "#7B2EFF" },
    { label: "Receita mensal", value: formatBRL(f?.month ?? 0), icon: CalendarDays, accent: "#6F4BFF" },
    { label: "Receita anual", value: formatBRL(f?.year ?? 0), icon: TrendingUp, accent: "#00AEEF" },
    { label: "Receita hoje", value: formatBRL(f?.today ?? 0), icon: CalendarDays, accent: "#00F5FF" },
    { label: "Vendas realizadas", value: String(f?.sales ?? 0), icon: ShoppingBag, accent: "#7B2EFF" },
    { label: "Ticket médio", value: formatBRL(f?.ticket ?? 0), icon: Ticket, accent: "#00F5FF" },
    { label: "Reembolsos", value: `${f?.refundedCount ?? 0} · ${formatBRL(f?.refundedCents ?? 0)}`, icon: RotateCcw, accent: "#c46bff" },
    { label: "Cancelamentos", value: String(f?.canceled ?? 0), icon: XCircle, accent: "#00AEEF" },
  ];

  const exportCsv = () => {
    if (!f?.rows.length) return toast.error("Nenhuma venda para exportar.");
    downloadCSV(`vendas-projeto-radiante-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(f.rows));
    toast.success("CSV exportado.");
  };

  return (
    <>
      <AdminHeader
        title="Financeiro"
        subtitle="Vendas, receita por período e por plano, reembolsos e cancelamentos."
        action={
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7B2EFF] to-[#00AEEF] px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5"
          >
            <Download className="h-4 w-4" /> Exportar CSV
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <StatCard key={c.label} icon={c.icon} label={c.label} value={c.value} accent={c.accent} delay={i * 0.04} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Reveal>
          <div className="rounded-2xl glass-card p-6 hover-lift">
            <h2 className="font-display text-lg font-semibold">Faturamento (12 meses)</h2>
            <div className="mt-6 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={f?.monthly ?? []}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00F5FF" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#00F5FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#0a0713", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                  <Area type="monotone" dataKey="receita" stroke="#00F5FF" strokeWidth={2} fill="url(#revFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="rounded-2xl glass-card p-6 hover-lift">
            <h2 className="font-display text-lg font-semibold">Receita por plano</h2>
            <div className="mt-6 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(f?.byPlan ?? []).map((p) => ({
                  label: PLAN_LABEL[p.plan as PlanTier] ?? p.plan,
                  receita: p.cents / 100,
                }))}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={{ background: "#0a0713", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                  <Bar dataKey="receita" radius={[8, 8, 0, 0]}>
                    {(f?.byPlan ?? []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-6">
        <div className="rounded-2xl glass-card p-6">
          <h2 className="font-display text-lg font-semibold">Todas as vendas</h2>
          <div className="mt-5 -mx-2 overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-white/40">
                  {["Aluno", "Plano", "Valor", "Reembolsado", "Status", "Gateway", "Data"].map((h) => (
                    <th key={h} className="px-3 pb-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(f?.rows ?? []).map((r) => (
                  <tr key={r.id} className="border-t border-white/5 transition hover:bg-white/[0.03]">
                    <td className="px-3 py-3 text-white/80">{r.email}</td>
                    <td className="px-3 py-3 text-white/65">{PLAN_LABEL[r.plan as PlanTier] ?? r.plan ?? "—"}</td>
                    <td className="px-3 py-3 text-white/90">{formatBRL(r.amount_cents)}</td>
                    <td className="px-3 py-3 text-white/55">{r.refunded_cents ? formatBRL(r.refunded_cents) : "—"}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] ${
                        r.status === "paid" ? "bg-emerald-500/15 text-emerald-300"
                        : r.status === "refunded" ? "bg-amber-500/15 text-amber-300"
                        : r.status === "failed" ? "bg-red-500/15 text-red-300"
                        : "bg-white/10 text-white/60"
                      }`}>{r.status}</span>
                    </td>
                    <td className="px-3 py-3 text-white/55">{r.provider ?? "—"}</td>
                    <td className="px-3 py-3 text-white/55">{new Date(r.paid_at ?? r.created_at).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(f?.rows.length ?? 0) === 0 && <p className="py-12 text-center text-sm text-white/45">Nenhuma venda registrada ainda.</p>}
          </div>
        </div>
      </Reveal>
    </>
  );
}
