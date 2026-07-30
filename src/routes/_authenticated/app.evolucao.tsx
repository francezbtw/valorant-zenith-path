import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
} from "recharts";
import { ArrowRight, CalendarClock, Loader2, Plus, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/membros/MemberShell";
import { useEnrollment } from "@/hooks/use-member";
import { useRankHistory, useAddRankEntry, useDeleteRankEntry } from "@/hooks/use-valorant";
import { VALORANT_TIERS, rankScore, scoreToTier, tierColor } from "@/lib/valorant";

export const Route = createFileRoute("/_authenticated/app/evolucao")({
  head: () => ({
    meta: [
      { title: "Minha Evolução · Projeto Radiante" },
      { name: "description", content: "Histórico de elo, RR, linha do tempo, gráfico de evolução e comparação antes e depois do curso." },
      { property: "og:title", content: "Minha Evolução — Projeto Radiante" },
      { property: "og:description", content: "Acompanhe seu elo, RR e a diferença antes e depois do Projeto Radiante." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EvolucaoPage,
});

const fmt = (d: string) =>
  new Date(`${d.slice(0, 10)}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" });

function EvolucaoPage() {
  const { data: history = [] } = useRankHistory();
  const { data: enrollment } = useEnrollment();

  const startedAt: string | null = (enrollment as { started_at?: string } | null)?.started_at?.slice(0, 10) ?? null;

  const chartData = useMemo(
    () =>
      history.map((h) => ({
        date: fmt(h.recorded_at),
        raw: h.recorded_at.slice(0, 10),
        score: rankScore(h.rank_tier, h.rr),
        tier: h.rank_tier,
        rr: h.rr,
      })),
    [history],
  );

  const before = useMemo(() => {
    if (!history.length) return null;
    if (!startedAt) return history[0];
    const prior = history.filter((h) => h.recorded_at.slice(0, 10) <= startedAt);
    return prior.length ? prior[prior.length - 1] : history[0];
  }, [history, startedAt]);

  const after = history[history.length - 1] ?? null;
  const delta = before && after ? rankScore(after.rank_tier, after.rr) - rankScore(before.rank_tier, before.rr) : 0;
  const divisions = Math.trunc(delta / 100);

  const startLabel = startedAt ? fmt(startedAt) : null;

  return (
    <>
      <PageHeader
        eyebrow="Área Valorant"
        title="Minha evolução"
        subtitle="Elo, RR e linha do tempo — a prova concreta do que mudou depois do curso."
      />

      {/* Antes x Depois */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-3xl glass-card p-7">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/45">
            <CalendarClock className="h-3.5 w-3.5" /> Antes e depois do curso
          </div>
          <div className="mt-6 grid items-center gap-5 sm:grid-cols-[1fr_auto_1fr]">
            <SnapshotCard label="Antes" entry={before} date={startLabel ? `até ${startLabel}` : "primeiro registro"} />
            <ArrowRight className="mx-auto hidden h-6 w-6 text-white/25 sm:block" />
            <SnapshotCard label="Agora" entry={after} date={after ? fmt(after.recorded_at) : "—"} highlight />
          </div>
          {before && after && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/75">
                <TrendingUp className="h-3.5 w-3.5" /> {delta >= 0 ? "+" : ""}{delta} pontos de progressão
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#7B2EFF]/35 bg-[#7B2EFF]/10 px-3.5 py-1.5 text-xs text-[#C7ADFF]">
                {divisions >= 0 ? "+" : ""}{divisions} divisão{Math.abs(divisions) === 1 ? "" : "ões"}
              </span>
              <span className="text-xs text-white/35">
                {startLabel ? `Início do plano: ${startLabel}` : "Sem data de plano registrada — usando o primeiro registro."}
              </span>
            </div>
          )}
          {!history.length && (
            <p className="mt-6 text-sm text-white/40">Registre seu elo ao lado para começar a comparação.</p>
          )}
        </div>

        <RankForm />
      </div>

      {/* Gráfico */}
      <div className="mt-5 rounded-3xl glass-card p-7">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/45">
          <TrendingUp className="h-3.5 w-3.5" /> Gráfico de evolução (elo + RR)
        </div>
        <div className="mt-6 h-[320px]">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-white/40">
              Sem dados ainda. Cada registro vira um ponto nessa curva.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="evoFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7B2EFF" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#00F5FF" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} width={78}
                  tickFormatter={(v: number) => scoreToTier(v).split(" ")[0]}
                />
                <Tooltip
                  contentStyle={{ background: "#0c0c0c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, fontSize: 12 }}
                  labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                  formatter={(_v, _n, item) => {
                    const p = (item as { payload: { tier: string; rr: number } }).payload;
                    return [`${p.tier} · ${p.rr} RR`, "Elo"];
                  }}
                />
                {startedAt && chartData.some((d) => d.raw >= startedAt) && (
                  <ReferenceLine
                    x={chartData.find((d) => d.raw >= startedAt)?.date}
                    stroke="#00F5FF" strokeDasharray="4 4"
                    label={{ value: "Início do curso", fill: "#00F5FF", fontSize: 10, position: "insideTopRight" }}
                  />
                )}
                <Area
                  type="monotone" dataKey="score" stroke="#00F5FF" strokeWidth={2.5}
                  fill="url(#evoFill)" dot={{ r: 3, fill: "#7B2EFF", stroke: "#00F5FF" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Linha do tempo */}
      <div className="mt-5 rounded-3xl glass-card p-7">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/45">
          <CalendarClock className="h-3.5 w-3.5" /> Linha do tempo do elo
        </div>
        <div className="relative mt-6 space-y-5 pl-6">
          <div className="absolute left-[7px] bottom-2 top-2 w-px bg-gradient-to-b from-[#7B2EFF] via-[#00AEEF] to-transparent" />
          {history.length === 0 && <p className="text-sm text-white/40">Nenhum registro de elo ainda.</p>}
          {[...history].reverse().map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: i * 0.04 }}
              className="relative"
            >
              <span
                className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 border-[#050505]"
                style={{ background: tierColor(h.rank_tier) }}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium" style={{ color: tierColor(h.rank_tier) }}>
                  {h.rank_tier} · {h.rr} RR
                </span>
                <span className="text-[11px] uppercase tracking-[0.18em] text-white/35">{fmt(h.recorded_at)}</span>
              </div>
              {h.note && <p className="mt-0.5 text-xs text-white/45">{h.note}</p>}
            </motion.div>
          ))}
        </div>
      </div>

      <HistoryTable />
    </>
  );
}

function SnapshotCard({
  label, entry, date, highlight,
}: { label: string; entry: { rank_tier: string; rr: number } | null; date: string; highlight?: boolean }) {
  const color = tierColor(entry?.rank_tier);
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 ${
        highlight ? "border-[#00F5FF]/30 bg-[#00F5FF]/[0.05]" : "border-white/8 bg-white/[0.03]"
      }`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-30 blur-3xl" style={{ background: color }} />
      <div className="relative z-10">
        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">{label}</div>
        <div className="mt-2 font-display text-2xl font-bold" style={{ color }}>{entry?.rank_tier ?? "—"}</div>
        <div className="text-sm text-white/50">{entry ? `${entry.rr} RR` : "sem registro"}</div>
        <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/30">{date}</div>
      </div>
    </div>
  );
}

function RankForm() {
  const add = useAddRankEntry();
  const [tier, setTier] = useState<string>("Ouro 1");
  const [rr, setRr] = useState("0");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(rr);
    if (Number.isNaN(value) || value < 0 || value > 100) return toast.error("RR deve estar entre 0 e 100.");
    if (note.length > 120) return toast.error("Nota muito longa (máx. 120 caracteres).");
    try {
      await add.mutateAsync({ rank_tier: tier, rr: value, recorded_at: date, note: note.trim() || null });
      setNote("");
      toast.success("Elo registrado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl glass-card p-7">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/45">
        <Plus className="h-3.5 w-3.5" /> Registrar elo
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.22em] text-white/40">Elo</label>
        <select
          value={tier} onChange={(e) => setTier(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-4 py-3 text-sm outline-none transition focus:border-[#7B2EFF]/60"
        >
          {VALORANT_TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-[0.22em] text-white/40">RR</label>
          <input
            type="number" min={0} max={100} value={rr} onChange={(e) => setRr(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-[#7B2EFF]/60"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.22em] text-white/40">Data</label>
          <input
            type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-[#7B2EFF]/60"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.22em] text-white/40">Nota (opcional)</label>
        <input
          value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: subi após o módulo 2"
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-[#7B2EFF]/60"
        />
      </div>
      <button type="submit" disabled={add.isPending} className="btn-hero w-full disabled:opacity-60">
        {add.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />} Adicionar registro
      </button>
    </form>
  );
}

function HistoryTable() {
  const { data: history = [] } = useRankHistory();
  const del = useDeleteRankEntry();
  if (!history.length) return null;

  return (
    <div className="mt-5 rounded-3xl glass-card p-7">
      <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Histórico completo</div>
      <div className="mt-5 divide-y divide-white/5">
        {[...history].reverse().map((h) => (
          <div key={h.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <div className="text-sm" style={{ color: tierColor(h.rank_tier) }}>{h.rank_tier} · {h.rr} RR</div>
              <div className="text-[11px] text-white/35">{fmt(h.recorded_at)}{h.note ? ` · ${h.note}` : ""}</div>
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
