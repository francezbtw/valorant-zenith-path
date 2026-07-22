import { motion } from "framer-motion";
import {
  Target, Swords, Dumbbell, Move, Brain, Zap, Users, GraduationCap, Sparkles,
  Crosshair, Map, DollarSign, Rocket, Repeat, MapPin, MessageSquare, Wand2,
  Check, Shield, Bell, HeartHandshake, LayoutGrid, ChevronDown, Star, Instagram, Youtube, Trophy
} from "lucide-react";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
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
          className="mx-auto mt-4 max-w-2xl text-white/60"
        >{subtitle}</motion.p>
      )}
    </div>
  );
}

const problems = [
  { icon: Crosshair, title: "Mira inconsistente", desc: "Um dia bom, três dias ruins. Sem base técnica." },
  { icon: Swords, title: "Perde clutch", desc: "Trava na hora decisiva e joga a rodada fora." },
  { icon: Dumbbell, title: "Não sabe treinar", desc: "Fica horas em deathmatch sem evoluir de verdade." },
  { icon: Move, title: "Movimentação ruim", desc: "Peekando errado, dando bait pra si mesmo." },
  { icon: Brain, title: "Mental abalado", desc: "Uma derrota e o resto da noite vai embora." },
  { icon: Zap, title: "Usa habilidade errado", desc: "Gasta util no início e fica pelado no retake." },
];

export function ProblemsSection() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader eyebrow="O problema" title="Você está preso no mesmo elo?" subtitle="Se você se identifica com um destes pontos, o Projeto Radiante foi feito para você." />
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
                  <div className="flex items-center gap-2 font-display text-lg font-semibold">
                    <span className="text-red-400">❌</span>{p.title}
                  </div>
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

const howCards = [
  { n: "01", icon: GraduationCap, title: "Mentoria Individual", desc: "Sessões 1:1 com análise de VOD, plano de treino sob medida e correção em tempo real dos seus erros." },
  { n: "02", icon: LayoutGrid, title: "Curso Completo", desc: "Módulos organizados do zero ao Radiante. Fundamentos, mid game, calls e execuções por mapa." },
  { n: "03", icon: Users, title: "Comunidade Exclusiva", desc: "Discord privado com scrims, sparrings, dailies e networking direto com jogadores em ascensão." },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader eyebrow="Como funciona" title="Três pilares. Um método." subtitle="Cada peça foi desenhada pra você ter evolução mensurável, não só sensação de progresso." />
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {howCards.map((c, i) => (
            <motion.div key={c.n}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-3xl glass-strong p-8 hover:border-[#00F5FF]/40 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#7B2EFF] opacity-20 blur-3xl transition-opacity duration-700 group-hover:opacity-40" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="font-display text-5xl font-bold text-white/10">{c.n}</span>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7B2EFF] to-[#00AEEF] shadow-[0_10px_30px_-5px_rgba(123,46,255,0.6)]">
                    <c.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold">{c.title}</h3>
                <p className="mt-3 text-white/60 leading-relaxed">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const learnItems = [
  { icon: Crosshair, title: "Aim" }, { icon: Target, title: "Crosshair Placement" },
  { icon: Move, title: "Movimentação" }, { icon: Brain, title: "Game Sense" },
  { icon: DollarSign, title: "Economia" }, { icon: Rocket, title: "Execuções" },
  { icon: Repeat, title: "Retake" }, { icon: Map, title: "Rotação" },
  { icon: MapPin, title: "Posicionamento" }, { icon: Sparkles, title: "Mental" },
  { icon: MessageSquare, title: "Comunicação" }, { icon: Wand2, title: "Uso de habilidades" },
];

export function LearnSection() {
  return (
    <section id="aprender" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader eyebrow="O que você vai aprender" title="Do fundamento à execução Radiante" />
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {learnItems.map((it) => (
            <motion.div key={it.title} variants={fadeUp}
              className="group relative rounded-2xl glass p-5 text-center transition-all duration-500 hover:-translate-y-1 hover:border-[#00F5FF]/40"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#7B2EFF]/30 to-[#00F5FF]/20 shadow-[0_0_30px_rgba(123,46,255,0.4)] group-hover:shadow-[0_0_50px_rgba(0,245,255,0.5)] transition-shadow">
                <it.icon className="h-5 w-5 text-white" />
              </div>
              <div className="font-display font-semibold text-sm">{it.title}</div>
            </motion.div>
          ))}
        </motion.div>
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
                className={`relative flex items-center gap-6 ${i % 2 === 0 ? "justify-start pr-1/2" : "justify-end pl-1/2 flex-row-reverse"}`}
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

const perks = [
  { icon: Dumbbell, title: "Treinos personalizados" },
  { icon: Sparkles, title: "Método atualizado" },
  { icon: MessageSquare, title: "Discord exclusivo" },
  { icon: HeartHandshake, title: "Suporte direto" },
  { icon: Bell, title: "Atualizações constantes" },
  { icon: Users, title: "Comunidade ativa" },
  { icon: LayoutGrid, title: "Conteúdo organizado" },
  { icon: Zap, title: "Sem enrolação" },
];

export function PerksSection() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader eyebrow="Diferenciais" title="O que vai fazer você subir de elo" />
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          {perks.map((p, i) => (
            <motion.div key={p.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="rounded-2xl glass p-6 hover:border-[#7B2EFF]/50 transition-all hover:-translate-y-1"
            >
              <p.icon className="h-6 w-6 text-[#00F5FF]" />
              <div className="mt-4 font-display font-semibold">{p.title}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutSection() {
  return (
    <section className="relative py-28">
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
                <div className="font-display text-7xl font-bold text-gradient-brand">F</div>
              </div>
            </div>
          </motion.div>
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="inline-flex rounded-full glass px-3 py-1 text-xs uppercase tracking-widest text-white/70">
              Sobre o professor
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-3 font-display text-5xl font-bold text-gradient-brand">Francez</motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-white/70 leading-relaxed">
              Experiência competitiva, coach e criador de conteúdo com milhares de horas em Valorant.
              Desenvolvi o método Radiante ao longo de anos ensinando jogadores reais a saírem do platô e chegarem ao topo.
            </motion.p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { n: "+2.5k", l: "alunos" },
                { n: "+18k", l: "horas de gameplay" },
                { n: "+500", l: "conteúdos publicados" },
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

const videos = [
  { title: "Como treinar aim de verdade", tag: "Aim", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80" },
  { title: "Crosshair placement por mapa", tag: "Fundamentos", img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80" },
  { title: "Como pensar em clutch 1v3", tag: "Mental", img: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=1200&q=80" },
  { title: "Rotação e leitura de mapa", tag: "Game sense", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80" },
];

export function VideosSection() {
  return (
    <section id="videos" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader eyebrow="Conteúdo" title="Vídeos do método" subtitle="Uma amostra do que você vai encontrar dentro do Projeto Radiante." />
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((v, i) => (
            <motion.a href="#" key={v.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-3xl glass-strong hover:-translate-y-1 transition-all duration-500 hover:shadow-[0_30px_80px_-20px_rgba(123,46,255,0.5)]"
            >
              <div className="relative aspect-video overflow-hidden">
                <img src={v.img} alt={v.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/20 glow-violet">
                    <div className="ml-1 h-0 w-0 border-l-[14px] border-l-white border-y-[9px] border-y-transparent" />
                  </div>
                </div>
                <span className="absolute top-4 left-4 rounded-full bg-black/50 backdrop-blur border border-white/10 px-3 py-1 text-xs font-medium">{v.tag}</span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold group-hover:text-[#00F5FF] transition-colors">{v.title}</h3>
              </div>
            </motion.a>
          ))}
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
  { q: "Como funciona a mentoria individual?", a: "Sessões 1:1 com análise de VOD, correções ao vivo e plano personalizado semana a semana." },
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

const ctaItems = [
  "Curso completo", "Mentoria individual", "Comunidade exclusiva",
  "Atualizações constantes", "Suporte direto", "Garantia de 7 dias",
];

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
            <div className="mx-auto inline-flex rounded-full glass px-3 py-1 text-xs uppercase tracking-widest">Vagas limitadas</div>
            <h2 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gradient-brand tracking-tight">
              Pronto para finalmente subir de elo?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">
              Entre no Projeto Radiante e transforme frustração em performance real.
            </p>
            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {ctaItems.map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl glass px-4 py-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#7B2EFF] to-[#00F5FF]">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm">{i}</span>
                </div>
              ))}
            </div>
            <a href="#" className="btn-primary-radiante mt-10 text-base" style={{ padding: "1.15rem 2.25rem" }}>
              🔥 QUERO ENTRAR NO PROJETO RADIANTE
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
