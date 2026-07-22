import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Swords, Dumbbell, Brain, Zap,
  Crosshair, Map, Eye, Repeat, MapPin, MessageSquare, Sparkles,
  Check, Shield, ChevronDown, Star, Instagram, Youtube, Trophy,
  Rocket, Crown, Gem, ArrowRight,
} from "lucide-react";
import { useState } from "react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

export function SectionHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mx-auto inline-flex rounded-full glass px-3 py-1 text-xs font-medium uppercase tracking-widest text-white/70"
        >{eyebrow}</motion.div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gradient-brand"
      >{title}</motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mx-auto mt-5 max-w-2xl text-white/60 leading-relaxed"
        >{subtitle}</motion.p>
      )}
    </div>
  );
}

/* Narrative bridge after the video */
export function NarrativeSection() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="inline-flex rounded-full glass px-3 py-1 text-xs uppercase tracking-widest text-white/70"
        >
          Continuação da história
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-5 font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
        >
          Você já <span className="text-gradient-brand">percebeu</span> que...
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, filter: "blur(8px)" }} whileInView={{ opacity: 1, filter: "blur(0px)" }} viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1 }}
          className="mx-auto mt-8 max-w-2xl text-lg text-white/70 leading-[1.7]"
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
          className="mx-auto mt-12 h-px w-40 bg-gradient-to-r from-transparent via-[#7B2EFF] to-transparent"
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
    <section id="problema" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader eyebrow="O problema" title="Por que você travou" subtitle="Se um destes pontos te incomoda, você está exatamente no lugar certo." />
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {problems.map((p) => (
            <motion.div key={p.title} variants={fadeUp}
              className="group relative rounded-2xl glass p-6 transition-all duration-500 hover:-translate-y-2 hover:border-[#7B2EFF]/50 hover:shadow-[0_20px_60px_-15px_rgba(123,46,255,0.5)]"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#7B2EFF]/0 via-transparent to-[#00F5FF]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-20" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7B2EFF]/20 to-[#00F5FF]/10 border border-white/10">
                  <p.icon className="h-5 w-5 text-[#00F5FF]" />
                </div>
                <div>
                  <div className="font-display text-lg font-semibold">{p.title}</div>
                  <p className="mt-1.5 text-sm text-white/60 leading-relaxed">{p.desc}</p>
                </div>
              </div>
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
    <section id="mudanca" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          eyebrow="A mudança"
          title="Muito além da mecânica"
          subtitle="O Projeto Radiante não ensina só a mirar melhor. Ele muda a forma como você enxerga cada round."
        />
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {changeCards.map((c) => (
            <motion.div key={c.title} variants={fadeUp}
              className="group relative overflow-hidden rounded-3xl glass-strong p-7 transition-all duration-500 hover:-translate-y-2 hover:border-[#00F5FF]/40"
            >
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#7B2EFF] opacity-15 blur-3xl transition-opacity duration-700 group-hover:opacity-40" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7B2EFF] to-[#00AEEF] shadow-[0_10px_30px_-5px_rgba(123,46,255,0.6)]">
                  <c.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-6 font-display text-xl font-bold">{c.title}</h3>
                <p className="mt-2 text-sm text-white/60 leading-relaxed">{c.desc}</p>
              </div>
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
    <section id="planos" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          eyebrow="Planos"
          title="Escolha como você quer evoluir"
          subtitle="Três formas de entrar no Projeto Radiante. Do fundamento estruturado até acompanhamento 1:1 com o QCK."
        />

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((p, i) => {
            const highlight = p.highlight;
            return (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className={`relative flex flex-col ${highlight ? "lg:-my-6 lg:scale-[1.04]" : ""}`}
              >
                {highlight && (
                  <>
                    <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-[#7B2EFF] via-[#6F4BFF] to-[#00F5FF] opacity-70 blur-md animate-pulse-glow" />
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 rounded-full bg-gradient-to-r from-[#7B2EFF] to-[#00F5FF] px-4 py-1.5 text-xs font-semibold tracking-wide shadow-[0_10px_30px_-5px_rgba(123,46,255,0.6)]">
                      ★ MAIS POPULAR
                    </div>
                  </>
                )}
                <div className={`relative flex h-full flex-col rounded-[1.75rem] p-8 border ${
                  highlight
                    ? "border-white/15 bg-[linear-gradient(180deg,rgba(30,15,60,0.9),rgba(10,5,25,0.9))] shadow-[0_40px_100px_-20px_rgba(123,46,255,0.6)]"
                    : "glass-strong hover:border-white/15"
                } transition-all duration-500 ${!highlight ? "hover:-translate-y-1" : ""}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">{p.tier}</span>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${highlight ? "bg-gradient-to-br from-[#7B2EFF] to-[#00F5FF]" : "bg-white/5 border border-white/10"}`}>
                      <p.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <h3 className={`mt-5 font-display text-3xl font-bold tracking-tight ${highlight ? "text-gradient-brand" : "text-white"}`}>
                    {p.name}
                  </h3>
                  <p className="mt-2 text-sm text-white/60">{p.tagline}</p>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-bold text-white">{p.price}</span>
                    <span className="text-xs text-white/40">/ acesso</span>
                  </div>

                  <div className="my-6 h-px bg-white/10" />

                  <ul className="space-y-3 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-white/75">
                        <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${highlight ? "bg-gradient-to-br from-[#7B2EFF] to-[#00F5FF]" : "bg-white/10"}`}>
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a href="#cta" className={`mt-8 group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all ${
                    highlight
                      ? "btn-primary-radiante"
                      : "border border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:border-[#00F5FF]/40"
                  }`}>
                    {p.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>

                  {p.id === "mentoria" && (
                    <div className="mt-4 inline-flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-[#00F5FF]/80">
                      <span className="h-1 w-1 rounded-full bg-[#00F5FF] animate-pulse-glow" />
                      Vagas limitadas
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const ranks = ["Bronze", "Prata", "Ouro", "Platina", "Diamante", "Ascendente", "Imortal", "Radiante"];
const rankColors = ["#a97142", "#c0c0c0", "#f5c542", "#4dd0e1", "#7B2EFF", "#c46bff", "#ff4d6d", "#00F5FF"];

export function ResultsSection() {
  return (
    <section id="resultados" className="relative py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader eyebrow="Resultados" title="Sua evolução, passo a passo" subtitle="A jornada que centenas de alunos já percorreram — e você é o próximo." />
        <div className="relative mt-16">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#7B2EFF]/60 to-transparent" />
          <div className="space-y-8">
            {ranks.map((r, i) => (
              <motion.div key={r}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className={`relative flex items-center gap-6 ${i % 2 === 0 ? "justify-start" : "justify-end flex-row-reverse"}`}
              >
                <div className={`w-[calc(50%-2rem)] ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                  <div className="inline-flex items-center gap-3 rounded-2xl glass px-5 py-3">
                    <Trophy className="h-4 w-4" style={{ color: rankColors[i] }} />
                    <span className="font-display font-bold text-lg" style={{ color: rankColors[i] }}>{r}</span>
                  </div>
                </div>
                <div className="relative z-10 h-4 w-4 rounded-full ring-4 ring-[#050505]" style={{ background: rankColors[i], boxShadow: `0 0 20px ${rankColors[i]}` }} />
                <div className="w-[calc(50%-2rem)]" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutSection() {
  return (
    <section id="sobre" className="relative py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto"
          >
            <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-[#7B2EFF] to-[#00F5FF] opacity-40 blur-2xl" />
            <div className="relative h-64 w-64 rounded-full p-[2px] bg-gradient-to-br from-[#7B2EFF] via-[#6F4BFF] to-[#00F5FF]">
              <div className="h-full w-full rounded-full bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
                <div className="font-display text-7xl font-bold text-gradient-brand">QCK</div>
              </div>
            </div>
          </motion.div>
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="inline-flex rounded-full glass px-3 py-1 text-xs uppercase tracking-widest text-white/70">
              Sobre o mentor
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-3 font-display text-5xl font-bold text-gradient-brand">QCK</motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-white/70 leading-relaxed">
              Trajetória construída no competitivo, com anos de coach ativo e centenas de análises individuais.
              Todo o método apresentado no vídeo foi lapidado na prática — treinando jogadores reais,
              corrigindo VODs, revisando calls e transformando estagnação em evolução mensurável.
            </motion.p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { n: "+2.5k", l: "alunos" },
                { n: "+500", l: "análises 1:1" },
                { n: "+18k", l: "horas em VALORANT" },
              ].map((s, i) => (
                <motion.div key={s.l} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="rounded-2xl glass p-4 text-center">
                  <div className="font-display text-2xl md:text-3xl font-bold text-gradient-brand">{s.n}</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-white/50">{s.l}</div>
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
    <section id="depoimentos" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader eyebrow="Depoimentos" title="Alunos que subiram de elo" />
        <div className="mt-14 -mx-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
          <div className="flex gap-5 px-4 min-w-max">
            {testimonials.map((t) => (
              <div key={t.name} className="w-[340px] shrink-0 rounded-3xl glass-strong p-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#7B2EFF] to-[#00F5FF] p-[2px]">
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
                <p className="mt-3 text-sm text-white/70 leading-relaxed">"{t.quote}"</p>
              </div>
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
    <section id="faq" className="relative py-28">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeader eyebrow="FAQ" title="Perguntas frequentes" />
        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <motion.div key={f.q}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl glass overflow-hidden"
            >
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left">
                <span className="font-display font-semibold">{f.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 transition-transform duration-300 ${open === i ? "rotate-180 text-[#00F5FF]" : "text-white/50"}`} />
              </button>
              <div className={`grid transition-all duration-500 ease-out ${open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm text-white/60 leading-relaxed">{f.a}</p>
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
    <section id="cta" className="relative py-32">
      <div className="mx-auto max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 p-10 md:p-16 text-center"
          style={{
            background: "radial-gradient(ellipse at top, rgba(123,46,255,0.35), transparent 60%), radial-gradient(ellipse at bottom, rgba(0,174,239,0.25), transparent 60%), #0a0a0a",
          }}
        >
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#7B2EFF] opacity-30 blur-3xl" />
          <div className="relative">
            <div className="mx-auto inline-flex rounded-full glass px-3 py-1 text-xs uppercase tracking-widest">O próximo passo</div>
            <h2 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gradient-brand tracking-tight">
              Sua evolução começa agora.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-white/70 leading-relaxed">
              Você pode continuar jogando da mesma forma — ou aprender com quem já percorreu esse caminho
              e sabe exatamente onde estão os seus próximos degraus.
            </p>
            <a href="#planos" className="btn-primary-radiante mt-10 text-base" style={{ padding: "1.15rem 2.25rem" }}>
              ENTRAR NO PROJETO RADIANTE
            </a>
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-white/50">
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
