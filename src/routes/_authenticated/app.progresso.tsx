import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { Loader2, Plus, Trash2, TrendingUp, Trophy } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/membros/MemberShell";
import { useLessons, useModules, useProgress } from "@/hooks/use-member";
import { useRankHistory, useAddRankEntry, useDeleteRankEntry } from "@/hooks/use-valorant";
import { PLAN_LABEL } from "@/lib/member";
import { VALORANT_TIERS, rankScore, scoreToTier, tierColor } from "@/lib/valorant";

export const Route = createFileRoute("/_authenticated/app/progresso")({
  head: () => ({
    meta: [
      { title: "Meu Progresso · Área de Membros — Projeto Radiante" },
      { name: "description", content: "Registre seu elo, acompanhe o gráfico de evolução e veja a timeline entre módulos concluídos e ranks." },
      { property: "og:title", content: "Meu Progresso — Projeto Radiante" },
      { property: "og:description", content: "Gráfico de evolução de elo e histórico de módulos concluídos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProgressoPage,
});

function ProgressoPage() {
  const { data: modules = [] } = useModules();
  const { data: lessons = [] } = useLessons();
  const { data: progress = [] } = useProgress();
  const { data: history = [] } = useRankHistory();

  const completed = new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id));
  const total = lessons.length;
  const done = lessons.filter((l) => completed.has(l.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const chartData = useMemo(
    () =>
      history.map((h) => ({
        date: new Date(`${h.recorded_at}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        score: rankScore(h.rank_tier, h.rr),
        tier: h.rank_tier,
        rr: h.rr,
      })),
    [history],
  );

  const latest = history[history.length - 1];
  const first = history[0];
  const delta = latest && first ? rankScore(latest.rank_tier, latest.rr) - rankScore(first.rank_tier, first.rr) : 0;

  // Timeline: relaciona cada módulo concluído com o elo registrado naquele momento.
  const timeline = useMemo(() => {
    return modules
      .map((mod) => {
        const modLessons = lessons.filter((l) => l.module_id === mod.id);
        if (!modLessons.length) return null;
        const stamps = modLessons
          .map((l) => progress.find((p) => p.lesson_id === l.id && p.completed)?.completed_at)
          .filter(Boolean) as string[];
        if (stamps.length !== modLessons.length) return { mod, finishedAt: null, rank: null };
        const finishedAt = stamps.sort().at(-1)!;
        const entry = [...history].reverse().find((h) => new Date(`${h.recorded_at}T23:59:59`) <= new Date(finishedAt))
          ?? history[0];
        return { mod, finishedAt, rank: entry ?? null };
      })
      .filter(Boolean) as { mod: (typeof modules)[number]; finishedAt: string | null; rank: (typeof history)[number] | null }[];
  }, [modules, lessons, progress, history]);

  return (
    <>
      <PageHeader eyebrow="Histórico real" title="Meu progresso" subtitle="Cada aula concluída é uma decisão a menos tomada no escuro." />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-3xl glass-card p-8 lg:col-span-2">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Conclusão do curso</div>
              <div className="mt-2 font-display text-5xl font-bold text-gradient-brand">{pct}%</div>
            </div>
            <div className="text-right text-sm text-white/50">{done}/{total} aulas</div>
          </div>
          <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-white/8">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-[#7B2EFF] via-[#00AEEF] to-[#00F5FF] shadow-[0_0_20px_rgba(0,245,255,0.6)]"
            />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl glass-card p-8">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-40 blur-3xl"
            style={{ background: tierColor(latest?.rank_tier) }}
          />
          <div className="relative z-10">
            <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Elo atual registrado</div>
            <div className="mt-3 font-display text-3xl font-bold" style={{ color: tierColor(latest?.rank_tier) }}>
              {latest?.rank_tier ?? "—"}
            </div>
            <div className="mt-1 text-sm text-white/50">{latest ? `${latest.rr} RR` : "Registre seu primeiro elo"}</div>
            {history.length > 1 && (
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-white/70">
                <TrendingUp className="h-3.5 w-3.5" /> {delta >= 0 ? "+" : ""}{delta} pontos desde o início
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-3xl glass-card p-7">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/45">
            <TrendingUp className="h-3.5 w-3.5" /> Evolução do elo
          </div>
          <div className="mt-6 h-[300px]">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-white/40">
                Registre seu elo ao lado para gerar o gráfico.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="eloFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7B2EFF" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#00F5FF" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="rgba(255,255,255,0.35)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => scoreToTier(v).split(" ")[0]}
                    width={78}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0c0c0c",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 14,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                    formatter={(_v, _n, item) => [
                      `${(item as { payload: { tier: string; rr: number } }).payload.tier} · ${(item as { payload: { rr: number } }).payload.rr} RR`,
                      "Elo",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#00F5FF"
                    strokeWidth={2.5}
                    fill="url(#eloFill)"
                    dot={{ r: 3, fill: "#7B2EFF", stroke: "#00F5FF" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <RankForm />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl glass-card p-7">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/45">
            <Trophy className="h-3.5 w-3.5" /> Módulos × elo
          </div>
          <div className="relative mt-6 space-y-5 pl-6">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-[#7B2EFF] via-[#00AEEF] to-transparent" />
            {timeline.length === 0 && <p className="text-sm text-white/40">Conclua um módulo para começar sua timeline.</p>}
            {timeline.map(({ mod, finishedAt, rank }, i) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}
                className="relative"
              >
                <span
                  className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 border-[#050505]"
                  style={{ background: finishedAt ? tierColor(rank?.rank_tier) : "rgba(255,255,255,0.2)" }}
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium">{mod.title}</span>
                  <span className="text-xs" style={{ color: finishedAt ? tierColor(rank?.rank_tier) : "rgba(255,255,255,0.35)" }}>
                    {finishedAt ? (rank ? `${rank.rank_tier}` : "sem elo registrado") : "em andamento"}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-white/35">
                  {PLAN_LABEL[mod.tier]}
                  {finishedAt ? ` · concluído em ${new Date(finishedAt).toLocaleDateString("pt-BR")}` : ""}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl glass-card p-7">
          <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Progresso por módulo</div>
          <div className="mt-6 space-y-4">
            {modules.map((mod) => {
              const modLessons = lessons.filter((l) => l.module_id === mod.id);
              const d = modLessons.filter((l) => completed.has(l.id)).length;
              const p = modLessons.length ? Math.round((d / modLessons.length) * 100) : 0;
              return (
                <div key={mod.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{mod.title}</span>
                    <span className="text-white/45">{PLAN_LABEL[mod.tier]} · {p}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#7B2EFF] to-[#00F5FF]" style={{ width: `${p}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <RankTable />
    </>
  );
}

function RankForm() {
  const add = useAddRankEntry();
  const [tier, setTier] = useState<string>("Ouro 1");
  const [rr, setRr] = useState("0");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rrValue = Number(rr);
    if (Number.isNaN(rrValue) || rrValue < 0 || rrValue > 100) {
      toast.error("RR deve ser um número entre 0 e 100.");
      return;
    }
    try {
      await add.mutateAsync({ rank_tier: tier, rr: rrValue, recorded_at: date, note: note.trim() || null });
      setNote("");
      toast.success("Elo registrado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl glass-card p-7">
      <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Registrar elo</div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.22em] text-white/40">Elo</label>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-4 py-3.5 text-sm outline-none focus:border-[#7B2EFF]/60"
        >
          {VALORANT_TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-[0.22em] text-white/40">RR</label>
          <input
            type="number" min={0} max={100} value={rr} onChange={(e) => setRr(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm outline-none focus:border-[#7B2EFF]/60"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.22em] text-white/40">Data</label>
          <input
            type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm outline-none focus:border-[#7B2EFF]/60"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.22em] text-white/40">Observação</label>
        <input
          value={note} onChange={(e) => setNote(e.target.value)} placeholder="Opcional"
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm outline-none focus:border-[#7B2EFF]/60"
        />
      </div>
      <button type="submit" disabled={add.isPending} className="btn-hero w-full disabled:opacity-60">
        {add.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />} Adicionar registro
      </button>
    </form>
  );
}

function RankTable() {
  const { data: history = [] } = useRankHistory();
  const del = useDeleteRankEntry();
  if (!history.length) return null;

  return (
    <div className="mt-5 rounded-3xl glass-card p-7">
      <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Registros</div>
      <div className="mt-5 divide-y divide-white/5">
        {[...history].reverse().map((h) => (
          <div key={h.id} className="flex items-center justify-between gap-4 py-3">
            <div>
              <div className="text-sm font-medium" style={{ color: tierColor(h.rank_tier) }}>
                {h.rank_tier} · {h.rr} RR
              </div>
              <div className="text-[11px] text-white/40">
                {new Date(`${h.recorded_at}T00:00:00`).toLocaleDateString("pt-BR")}
                {h.note ? ` · ${h.note}` : ""}
              </div>
            </div>
            <button
              onClick={() => del.mutate(h.id)}
              className="rounded-lg border border-white/10 p-2 text-white/40 transition hover:border-[#FF4655]/50 hover:text-[#FF4655]"
              aria-label="Remover registro"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
