import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { AdminHeader } from "@/components/admin/AdminShell";
import { useAdminStats, formatBRL } from "@/hooks/use-admin";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · Console Admin — Projeto Radiante" },
      { name: "description", content: "Receita, crescimento e conversão do Projeto Radiante." },
      { property: "og:title", content: "Analytics — Console Admin" },
      { property: "og:description", content: "Receita e crescimento nos últimos 12 meses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: s } = useAdminStats();
  return (
    <>
      <AdminHeader title="Analytics" subtitle="Receita e crescimento nos últimos 12 meses." />
      <div className="rounded-2xl glass-card p-6">
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Receita total</div>
        <div className="mt-2 font-display text-4xl font-bold text-gradient-brand">{formatBRL(s?.revenueCents ?? 0)}</div>
        <div className="mt-8 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={s?.growth ?? []}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={{ background: "#0a0713", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              <Bar dataKey="receita" fill="#7B2EFF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
