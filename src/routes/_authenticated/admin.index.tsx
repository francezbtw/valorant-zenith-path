import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, UserPlus, Wallet, GraduationCap, Activity, BookOpen } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { AdminHeader } from "@/components/admin/AdminShell";
import { useAdminStats, formatBRL } from "@/hooks/use-admin";
import { StatCard, Reveal } from "@/components/ui/premium";


export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Console Admin — Projeto Radiante" },
      { name: "description", content: "Visão geral de alunos, receita, matrículas e crescimento do Projeto Radiante." },
      { property: "og:title", content: "Dashboard — Console Admin" },
      { property: "og:description", content: "Panorama completo da operação do Projeto Radiante." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: s } = useAdminStats();

  const cards = [
    { label: "Total de alunos", value: String(s?.totalStudents ?? 0), icon: Users, accent: "#7B2EFF" },
    { label: "Novos (30 dias)", value: String(s?.newStudents ?? 0), icon: UserPlus, accent: "#00F5FF" },
    { label: "Receita", value: formatBRL(s?.revenueCents ?? 0), icon: Wallet, accent: "#00AEEF" },
    { label: "Matrículas", value: String(s?.enrollments ?? 0), icon: GraduationCap, accent: "#6F4BFF" },
    { label: "Alunos ativos", value: String(s?.activeStudents ?? 0), icon: Activity, accent: "#c46bff" },
    { label: "Cursos · Aulas", value: `${s?.courses ?? 0} · ${s?.lessons ?? 0}`, icon: BookOpen, accent: "#00F5FF" },
  ];

  return (
    <>
      <AdminHeader title="Dashboard" subtitle="Panorama completo da operação do Projeto Radiante." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <StatCard
            key={c.label}
            icon={c.icon}
            label={c.label}
            value={c.value}
            accent={c.accent}
            delay={i * 0.05}
          />
        ))}
      </div>


      <Reveal className="mt-6">
      <div className="rounded-2xl glass-card p-6 hover-lift">

        <h2 className="font-display text-lg font-semibold">Crescimento de alunos</h2>
        <div className="mt-6 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={s?.growth ?? []}>
              <defs>
                <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7B2EFF" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#7B2EFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0a0713", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="alunos" stroke="#00F5FF" strokeWidth={2} fill="url(#growthFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      </Reveal>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl glass-card p-6 hover-lift">

          <h2 className="font-display text-lg font-semibold">Últimos pagamentos</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {(s?.latestPayments ?? []).map((p) => (
              <li key={p.id} className="flex items-center justify-between border-b border-white/5 pb-2 text-white/70">
                <span className="truncate">{p.plan ?? "—"} · {p.status}</span>
                <span className="font-semibold text-white">{formatBRL(p.amount_cents ?? 0)}</span>
              </li>
            ))}
            {(s?.latestPayments ?? []).length === 0 && <li className="text-white/40">Nenhum pagamento registrado.</li>}
          </ul>
        </div>
        <div className="rounded-2xl glass-card p-6">
          <h2 className="font-display text-lg font-semibold">Últimos acessos</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {(s?.latestStudents ?? []).map((p) => (
              <li key={p.id} className="flex items-center justify-between border-b border-white/5 pb-2 text-white/70">
                <span className="truncate">{p.full_name ?? p.email ?? "Aluno"}</span>
                <span className="text-white/40">{new Date(p.created_at).toLocaleDateString("pt-BR")}</span>
              </li>
            ))}
            {(s?.latestStudents ?? []).length === 0 && <li className="text-white/40">Nenhum aluno ainda.</li>}
          </ul>
        </div>
      </div>
    </>
  );
}
