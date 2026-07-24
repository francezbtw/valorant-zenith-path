import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Swords, Dumbbell, Brain, Zap,
  Crosshair, Eye, Repeat, MapPin, MessageSquare, Sparkles,
  Check, Shield, ChevronDown, Star, Instagram, Youtube, Trophy,
  Rocket, Crown, Gem, ArrowRight, Target, Flame, TrendingUp, Award,
} from "lucide-react";
import { useRef, useState, type MouseEvent, type ReactNode } from "react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

/* Reusable tilt-on-hover wrapper */
function TiltCard({ children, className = "", intensity = 6 }: { children: ReactNode; className?: string; intensity?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const rotateX = useSpring(useTransform(ry, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 150, damping: 18 });
  const rotateY = useSpring(useTransform(rx, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 150, damping: 18 });
  const glow = useTransform([gx, gy], ([x, y]) =>
    `radial-gradient(500px circle at ${x}% ${y}%, rgba(123,46,255,0.22), transparent 45%)`
  );
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    rx.set(nx - 0.5); ry.set(ny - 0.5);
    gx.set(nx * 100); gy.set(ny * 100);
  };
  const onLeave = () => { rx.set(0); ry.set(0); gx.set(50); gy.set(50); };
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ perspective: 1200 }}
      className={className}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative h-full w-full">
        <motion.div aria-hidden style={{ background: glow }} className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-70" />
        {children}
      </motion.div>
    </motion.div>
  );
}

export function SectionHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mx-auto inline-flex rounded-full glass px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/70"
        >{eyebrow}</motion.div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.045em] text-gradient-brand leading-[0.95]"
      >{title}</motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-white/60 leading-[1.7]"
        >{subtitle}</motion.p>
      )}
    </div>
  );
}

/* Narrative bridge after the video */
export function NarrativeSection() {
  return (
    <section className="relative py-40">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="inline-flex rounded-full glass px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white/70"
        >
          Continuação da história
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 font-display text-5xl sm:text-6xl md:text-8xl font-bold tracking-[-0.05em] leading-[0.9]"
        >
          Você já <span className="text-gradient-shift">percebeu</span> que...
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, filter: "blur(8px)" }} whileInView={{ opacity: 1, filter: "blur(0px)" }} viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.1 }}
          className="mx-auto mt-10 max-w-2xl text-lg md:text-xl text-white/70 leading-[1.75]"
        >
          A maioria dos jogadores passa <span className="text-white">centenas de horas</span> no Valorant
          e continua estagnada no mesmo elo. Não porque falta talento —
          mas porque nunca ensinaram <span className="text-white">como treinar</span>,
          <span className="text-white"> como pensar</span> e
          <span className="text-white"> como decidir</span> dentro do jogo.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }} whileInView={{ opacity: 1, scaleX: 1 }} viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="mx-auto mt-16 h-px w-40 bg-gradient-to-r from-transparent via-[#7B2EFF] to-transparent"
        />
      </div>
    </section>
  );
}

const problems = [
  { icon: Dumbbell, title: "Você treina errado", desc: "Horas em deathmatch sem plano viram esforço desperdiçado." },
  { icon: Zap, title: "Você joga no automático", desc: "Decisões repetidas por reflexo, nunca por leitura." },
  { icon: Crosshair, title: "Você culpa a mira", desc: "Quando o problema real está no posicionamento e no timing." },
  { icon: Brain, title: "Você não entende decisões", desc: "Cada round parece aleatório porque falta um framework." },
  { icon: Eye, title: "Você não sabe revisar partidas", desc: "Assistir replay não é o mesmo que analisar erros." },
  { icon: Repeat, title: "Você repete os mesmos erros", desc: "Sem consciência não existe correção. Sem correção, não existe evolução." },
];

export function ProblemsSection() {
  return (
    <section id="problema" className="relative py-32">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader eyebrow="O problema" title="Por que você travou" subtitle="Se um destes pontos te incomoda, você está exatamente no lugar certo." />
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {problems.map((p) => (
            <motion.div key={p.title} variants={fadeUp}>
              <TiltCard className="h-full">
                <div className="group relative h-full rounded-2xl glass-card p-7 transition-all duration-500 hover:border-[#7B2EFF]/40">
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7B2EFF]/25 to-[#00F5FF]/15 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                      <p.icon className="h-5 w-5 text-[#00F5FF]" />
                    </div>
                    <div>
                      <div className="font-display text-xl font-semibold tracking-tight">{p.title}</div>
                      <p className="mt-2 text-sm text-white/60 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* A Mudança */
const changeCards = [
  { icon: Brain, title: "Game Sense", desc: "Ler o mapa, prever o adversário e antecipar rotações antes de acontecerem." },
  { icon: Sparkles, title: "Mentalidade", desc: "Blindar a cabeça contra tilt, ranked anxiety e sequências ruins." },
  { icon: Dumbbell, title: "Treino Inteligente", desc: "Rotina de treino com objetivo, métrica e progressão real." },
  { icon: Swords, title: "Tomada de decisão", desc: "Framework claro para cada situação: 5v5, 3v3, clutch e retake." },
  { icon: MessageSquare, title: "Comunicação", desc: "Calls curtas, precisas e que fazem o time inteiro jogar melhor." },
  { icon: MapPin, title: "Posicionamento", desc: "Aparecer no lugar certo, na hora certa, com a util certa." },
];

export function ChangeSection() {
  return (
    <section id="mudanca" className="relative py-32">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          eyebrow="A mudança"
          title="Muito além da mecânica"
          subtitle="O Projeto Radiante não ensina só a mirar melhor. Ele muda a forma como você enxerga cada round."
        />
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {changeCards.map((c) => (
            <motion.div key={c.title} variants={fadeUp}>
              <TiltCard className="h-full" intensity={5}>
                <div className="group relative h-full overflow-hidden rounded-3xl glass-card p-8 transition-all duration-500 hover:border-[#00F5FF]/40">
                  <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#7B2EFF] opacity-20 blur-3xl transition-opacity duration-700 group-hover:opacity-50" />
                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7B2EFF] to-[#00AEEF] shadow-[0_10px_30px_-5px_rgba(123,46,255,0.7),inset_0_1px_0_rgba(255,255,255,0.25)]">
                      <c.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mt-6 font-display text-2xl font-bold tracking-tight">{c.title}</h3>
                    <p className="mt-3 text-sm text-white/60 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* Planos */
const plans = [
  {
    id: "basico", tier: "Plano 1", name: "BÁSICO", price: "R$ 97",
    icon: Rocket, tagline: "Ideal para quem quer começar.",
    features: ["Curso base completo", "Rotina de treinos", "Atualizações inclusas", "Acesso ao conteúdo"],
    cta: "Começar",
  },
  {
    id: "intermediario", tier: "Plano 2", name: "INTERMEDIÁRIO", price: "R$ 197",
    icon: Crown, tagline: "O mais vendido.", highlight: true,
    features: [
      "Tudo do Básico",
      "Conteúdo avançado por mapa",
      "Aulas extras semanais",
      "Análises guiadas",
      "Comunidade exclusiva",
      "Atualizações prioritárias",
    ],
    cta: "Quero Evoluir",
  },
  {
    id: "mentoria", tier: "Plano 3", name: "MENTORIA", price: "R$ 497",
    icon: Gem, tagline: "Produto premium. Vagas limitadas.",
    features: [
      "Tudo do Intermediário",
      "Mentorias ao vivo",
      "Correção individual de VOD",
      "Plano de evolução pessoal",
      "Contato direto com o coach",
      "Acompanhamento contínuo",
    ],
    cta: "Entrar para Mentoria",
  },
];

export function PlansSection() {
  return (
    <section id="planos" className="relative py-32">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          eyebrow="Planos"
          title="Escolha como você quer evoluir"
          subtitle="Três formas de entrar no Projeto Radiante. Do fundamento estruturado ao acompanhamento 1:1 com o QCK."
        />

        <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((p, i) => {
            const highlight = p.highlight;
            return (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex flex-col ${highlight ? "lg:-my-8 lg:scale-[1.06] z-10" : ""}`}
              >
                {highlight && (
                  <>
                    <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-[#7B2EFF] via-[#6F4BFF] to-[#00F5FF] opacity-80 blur-lg animate-pulse-glow" />
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 rounded-full bg-gradient-to-r from-[#7B2EFF] to-[#00F5FF] px-5 py-1.5 text-[11px] font-bold tracking-[0.15em] shadow-[0_10px_30px_-5px_rgba(123,46,255,0.7)] uppercase">
                      ★ Mais Popular
                    </div>
                  </>
                )}
                <TiltCard className="h-full" intensity={highlight ? 4 : 6}>
                  <div className={`relative flex h-full flex-col rounded-[1.75rem] p-8 border transition-all duration-500 ${
                    highlight
                      ? "border-white/20 bg-[linear-gradient(180deg,rgba(35,18,70,0.95),rgba(8,5,20,0.95))] shadow-[0_50px_120px_-20px_rgba(123,46,255,0.7)]"
                      : "glass-card hover:border-white/20"
                  }`}>
                    {highlight && (
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00F5FF] to-transparent" />
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">{p.tier}</span>
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${highlight ? "bg-gradient-to-br from-[#7B2EFF] to-[#00F5FF] shadow-[0_10px_30px_-5px_rgba(0,245,255,0.5)]" : "bg-white/5 border border-white/10"}`}>
                        <p.icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <h3 className={`mt-6 font-display text-4xl font-bold tracking-tight ${highlight ? "text-gradient-brand" : "text-white"}`}>
                      {p.name}
                    </h3>
                    <p className="mt-2 text-sm text-white/60">{p.tagline}</p>

                    <div className="mt-8 flex items-baseline gap-1.5">
                      <span className="font-display text-5xl font-bold text-white tracking-tight">{p.price}</span>
                      <span className="text-xs text-white/40">/ acesso</span>
                    </div>

                    <div className="my-7 h-px bg-white/10" />

                    <ul className="space-y-3.5 flex-1">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-sm text-white/75">
                          <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${highlight ? "bg-gradient-to-br from-[#7B2EFF] to-[#00F5FF] shadow-[0_0_10px_rgba(0,245,255,0.6)]" : "bg-white/10"}`}>
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <a href="#cta" className={`mt-10 group inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold transition-all ${
                      highlight
                        ? "btn-primary-radiante"
                        : "border border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:border-[#00F5FF]/40 hover:-translate-y-0.5"
                    }`}>
                      {p.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </a>

                    {p.id === "mentoria" && (
                      <div className="mt-4 inline-flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#00F5FF]/80">
                        <span className="h-1 w-1 rounded-full bg-[#00F5FF] animate-pulse-glow" />
                        Vagas limitadas
                      </div>
                    )}
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* Results — scoreboard style match history */
const matches = [
  { rank: "Ouro → Diamante", agent: "Jett", map: "Ascent", kda: "24 / 11 / 6", score: "13-8", result: "W", acs: 312, hs: "38%", accent: "#00F5FF" },
  { rank: "Prata → Platina", agent: "Reyna", map: "Bind", kda: "22 / 9 / 4", score: "13-6", result: "W", acs: 298, hs: "34%", accent: "#7B2EFF" },
  { rank: "Platina → Imortal", agent: "Chamber", map: "Haven", kda: "19 / 8 / 8", score: "13-10", result: "W", acs: 275, hs: "31%", accent: "#c46bff" },
  { rank: "Diamante → Radiante", agent: "Omen", map: "Split", kda: "27 / 12 / 5", score: "13-11", result: "W", acs: 334, hs: "41%", accent: "#00AEEF" },
];

export function ResultsSection() {
  return (
    <section id="resultados" className="relative py-32">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          eyebrow="Resultados"
          title="Histórico real de evolução"
          subtitle="Cada card representa a jornada de um aluno — partida por partida, elo por elo."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-5">
          {matches.map((m, i) => (
            <motion.div key={m.map}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <TiltCard className="h-full" intensity={5}>
                <div
                  className="group relative h-full overflow-hidden rounded-2xl glass-card p-6 transition-all duration-500 hover:border-white/20"
                  style={{ boxShadow: `0 30px 80px -30px ${m.accent}55` }}
                >
                  {/* Win stripe */}
                  <div className="absolute left-0 top-0 h-full w-1" style={{ background: `linear-gradient(180deg, ${m.accent}, transparent)` }} />
                  {/* Result badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">Evolução</div>
                      <div className="mt-1 font-display text-xl font-bold text-white">{m.rank}</div>
                    </div>
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl font-display text-lg font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${m.accent}, ${m.accent}88)`, boxShadow: `0 0 30px ${m.accent}88` }}
                    >
                      {m.result}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
                      <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">Agente</div>
                      <div className="mt-1 text-sm font-semibold text-white">{m.agent}</div>
                    </div>
                    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
                      <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">Mapa</div>
                      <div className="mt-1 text-sm font-semibold text-white">{m.map}</div>
                    </div>
                    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
                      <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">Score</div>
                      <div className="mt-1 text-sm font-semibold text-white">{m.score}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">K / D / A</div>
                      <div className="mt-0.5 font-display text-lg font-bold text-white">{m.kda}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">ACS · HS</div>
                      <div className="mt-0.5 font-display text-lg font-bold" style={{ color: m.accent }}>{m.acs} · {m.hs}</div>
                    </div>
                  </div>

                  {/* Hover glow */}
                  <div
                    className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
                    style={{ background: m.accent }}
                  />
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Rank timeline mini */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-2 text-xs">
          {["Ferro", "Bronze", "Prata", "Ouro", "Platina", "Diamante", "Ascendente", "Imortal", "Radiante"].map((r, i, arr) => (
            <div key={r} className="flex items-center gap-2">
              <span className="rounded-full glass px-3 py-1 text-white/70">{r}</span>
              {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-white/30" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutSection() {
  return (
    <section id="sobre" className="relative py-32 overflow-hidden">
      {/* Background ambient */}
      <div className="pointer-events-none absolute left-1/4 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-[#7B2EFF] opacity-15 blur-[160px]" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,520px)_1fr] gap-16 items-center">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full max-w-[520px]"
          >
            {/* Aura glow */}
            <div className="absolute -inset-10 rounded-[3rem] bg-[radial-gradient(ellipse_at_center,rgba(123,46,255,0.6),transparent_65%)] blur-3xl" />
            <div className="absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(ellipse_at_bottom,rgba(0,245,255,0.5),transparent_60%)] blur-3xl" />

            <TiltCard className="relative" intensity={6}>
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] holo-border">
                <div className="absolute inset-[3px] overflow-hidden rounded-[1.85rem] bg-[linear-gradient(180deg,#12081f_0%,#1a0d2e_50%,#050510_100%)]">
                  {/* Photo */}
                  <img
                    src="/qck.jpg"
                    alt="QCK — coach do Projeto Radiante"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                  {/* Fallback halo + silhouette (shown if image missing) */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(123,46,255,0.35),transparent_60%)]" />
                  {/* Gradient overlay for text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {/* Bottom info bar */}
                  <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.25em] text-white/50">Coach · Mentor</div>
                        <div className="mt-1 font-display text-lg font-bold text-white">QCK</div>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7B2EFF] to-[#00F5FF]">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  {/* Scanline */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F5FF]/70 to-transparent blur-[1px] animate-scan" />
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Content */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="inline-flex rounded-full glass px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white/70">
              Sobre o mentor
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="mt-5 font-display text-6xl md:text-8xl font-bold text-gradient-brand tracking-[-0.05em] leading-[0.9]">
              QCK
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="mt-6 max-w-xl text-lg text-white/70 leading-[1.75]">
              QCK construiu sua trajetória no cenário competitivo de Valorant, passando por scrims de alto nível,
              campeonatos e bootcamps ao lado de jogadores profissionais. Anos como coach ativo consolidaram um método
              próprio — testado em quadra, refinado em VOD e comprovado por dezenas de alunos que subiram vários elos
              seguindo o mesmo caminho.
            </motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="mt-5 max-w-xl text-base text-white/55 leading-[1.75]">
              Hoje, além de continuar competindo, dedica-se a formar a próxima geração de Radiantes —
              ensinando game sense, tomada de decisão, comunicação e mentalidade de alto rendimento.
            </motion.p>

            {/* Dashboard stats */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { n: "+2.5k", l: "alunos", icon: Trophy, accent: "#7B2EFF" },
                { n: "+500", l: "análises 1:1", icon: Target, accent: "#00F5FF" },
                { n: "+18k", l: "horas jogadas", icon: Flame, accent: "#c46bff" },
              ].map((s, i) => (
                <motion.div key={s.l} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}>
                  <TiltCard intensity={8}>
                    <div className="relative overflow-hidden rounded-2xl glass-card p-5">
                      <div className="flex items-center justify-between">
                        <div className="text-[9px] uppercase tracking-[0.25em] text-white/40">{s.l}</div>
                        <s.icon className="h-3.5 w-3.5" style={{ color: s.accent }} />
                      </div>
                      <div className="mt-3 font-display text-3xl md:text-4xl font-bold text-gradient-brand tracking-tight">{s.n}</div>
                      <div className="mt-3 flex items-center gap-1 text-[10px] text-white/40">
                        <TrendingUp className="h-3 w-3" style={{ color: s.accent }} />
                        <span>últimos 12 meses</span>
                      </div>
                      <div
                        className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full opacity-25 blur-3xl"
                        style={{ background: s.accent }}
                      />
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  { name: "Rafael M.", from: "Ouro 2", to: "Imortal 1", quote: "Nunca imaginei sair de Ouro. Em 4 meses cheguei em Imortal. O método destrava a cabeça." },
  { name: "Leticia S.", from: "Prata", to: "Diamante 3", quote: "Deixei de jogar no chute. Hoje cada round tem plano. E vencer virou consequência." },
  { name: "João P.", from: "Platina", to: "Ascendente 2", quote: "Análise de VOD mudou tudo. Vi erros que eu jurava que não cometia." },
  { name: "Marina L.", from: "Ouro 3", to: "Diamante 1", quote: "A comunidade acelerou minha evolução. Scrims toda noite com gente que quer o mesmo." },
  { name: "Diego A.", from: "Ferro", to: "Platina 2", quote: "Do Ferro ao Platina em uma temporada. O plano de treino faz uma diferença absurda." },
];

export function TestimonialsSection() {
  return (
    <section id="depoimentos" className="relative py-32">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader eyebrow="Depoimentos" title="Alunos que subiram de elo" />
        <div className="mt-16 -mx-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
          <div className="flex gap-5 px-4 min-w-max">
            {testimonials.map((t) => (
              <TiltCard key={t.name} className="w-[360px] shrink-0" intensity={5}>
                <div className="rounded-3xl glass-card p-7 h-full">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#7B2EFF] to-[#00F5FF] p-[2px] shadow-[0_0_20px_rgba(123,46,255,0.5)]">
                      <div className="h-full w-full rounded-full bg-[#0a0a0a] flex items-center justify-center font-display font-bold">
                        {t.name[0]}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-xs text-white/50">
                        <span className="text-white/70">{t.from}</span> → <span className="text-[#00F5FF]">{t.to}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-0.5 text-[#f5c542]">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="mt-4 text-sm text-white/70 leading-[1.7]">"{t.quote}"</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const faqs = [
  { q: "Preciso ter algum elo mínimo para entrar?", a: "Não. O método funciona de Ferro a Imortal. O conteúdo é organizado por nível." },
  { q: "Quanto tempo por dia preciso dedicar?", a: "A partir de 1h/dia com o plano de treino você já sente evolução consistente." },
  { q: "Qual a diferença entre o Intermediário e a Mentoria?", a: "A Mentoria inclui sessões ao vivo com o QCK, análise individual de VOD e um plano de evolução personalizado." },
  { q: "Tenho acesso vitalício?", a: "Sim. Uma vez dentro, acesso vitalício ao curso, comunidade e atualizações." },
  { q: "Existe garantia?", a: "7 dias de garantia incondicional. Se não gostar, devolvemos 100% do valor." },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-32">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeader eyebrow="FAQ" title="Perguntas frequentes" />
        <div className="mt-14 space-y-3">
          {faqs.map((f, i) => (
            <motion.div key={f.q}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl glass-card overflow-hidden"
            >
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-6 text-left">
                <span className="font-display font-semibold text-lg">{f.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 transition-transform duration-300 ${open === i ? "rotate-180 text-[#00F5FF]" : "text-white/50"}`} />
              </button>
              <div className={`grid transition-all duration-500 ease-out ${open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <p className="px-6 pb-6 text-sm text-white/60 leading-[1.75]">{f.a}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section id="cta" className="relative py-40">
      <div className="mx-auto max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/10 p-12 md:p-20 text-center holo-border"
          style={{
            background: "radial-gradient(ellipse at top, rgba(123,46,255,0.4), transparent 60%), radial-gradient(ellipse at bottom, rgba(0,174,239,0.3), transparent 60%), #0a0a12",
          }}
        >
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#7B2EFF] opacity-30 blur-3xl" />
          <div className="relative">
            <div className="mx-auto inline-flex rounded-full glass px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em]">O próximo passo</div>
            <h2 className="mt-8 font-display text-5xl sm:text-6xl md:text-8xl font-bold text-gradient-shift tracking-[-0.05em] leading-[0.9]">
              Sua evolução<br />começa agora.
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-white/70 leading-[1.7]">
              Você pode continuar jogando da mesma forma — ou aprender com quem já percorreu esse caminho
              e sabe exatamente onde estão os seus próximos degraus.
            </p>
            <a href="#planos" className="btn-hero mt-12">
              <Rocket className="h-5 w-5" />
              Entrar no Projeto Radiante
            </a>
            <div className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50">
              <Shield className="h-3.5 w-3.5" /> Garantia incondicional de 7 dias
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#7B2EFF] to-[#00F5FF] p-[1.5px]">
              <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#0a0a0a] font-display text-xs font-bold">R</div>
            </div>
            <span className="font-display font-semibold">Projeto <span className="text-gradient-brand">Radiante</span></span>
          </div>
          <div className="flex items-center gap-3">
            {[Instagram, Youtube, MessageSquare].map((I, i) => (
              <a key={i} href="#" className="flex h-10 w-10 items-center justify-center rounded-full glass hover:border-[#00F5FF]/50 hover:-translate-y-0.5 transition-all">
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="text-xs text-white/40">© {new Date().getFullYear()} Projeto Radiante. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
