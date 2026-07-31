import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Flame, Clock, Swords, Crosshair, Percent, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/membros/MemberShell";
import { Reveal, Tilt } from "@/components/ui/premium";
import { useCommunityMember } from "@/hooks/use-community";
import { BADGES, initials, tierColor, tierGain, type BadgeKey } from "@/lib/community";

export const Route = createFileRoute("/_authenticated/app/aluno/$id")({
  head: () => ({
    meta: [
      { title: "Perfil do Aluno — Projeto Radiante" },
      { name: "description", content: "Evolução, elo, XP, medalhas e estatísticas do aluno dentro do Projeto Radiante." },
      { property: "og:title", content: "Perfil do Aluno — Projeto Radiante" },
      { property: "og:description", content: "Acompanhe a evolução completa deste aluno no Projeto Radiante." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentProfile,
});

function StudentProfile() {
  const { id } = Route.useParams();
  const { data: member } = useCommunityMember(id);

  if (!member) {
    return (
      <>
        <PageHeader title="Perfil do aluno" subtitle="Carregando informações…" />
        <div className="rounded-[28px] glass-card p-8 text-sm text-white/45">
          Este perfil não está disponível.
        </div>
      </>
    );
  }

  const s = member.stats;
  const tier = s?.current_tier ?? member.current_rank ?? "—";
  const entry = s?.entry_tier ?? "—";
  const gain = tierGain(s?.entry_tier, tier);
  const days = s?.joined_at
    ? Math.max(1, Math.round((Date.now() - new Date(s.joined_at).getTime()) / 86400000))
    : null;

  const metrics = [
    { icon: Sparkles, label: "XP", value: `${s?.xp ?? 0}`, accent: "#7B2EFF" },
    { icon: Flame, label: "Sequência", value: `${s?.streak_days ?? 0} dias`, accent: "#FF7A3D" },
    { icon: CalendarDays, label: "Dias ativos", value: `${s?.active_days ?? 0}`, accent: "#6F4BFF" },
    { icon: Clock, label: "Horas de estudo", value: `${Number(s?.hours_studied ?? 0).toFixed(1)}h`, accent: "#00AEEF" },
    { icon: Swords, label: "Mentorias", value: `${s?.mentorships_done ?? 0}`, accent: "#FF4655" },
    { icon: Crosshair, label: "HS%", value: `${Number(s?.headshot_pct ?? 0).toFixed(1)}%`, accent: "#E8C05A" },
    { icon: Percent, label: "Win rate", value: `${Number(s?.win_rate ?? 0).toFixed(1)}%`, accent: "#3BD16F" },
  ];

  return (
    <>
      <Link
        to="/app/comunidade"
        className="mb-6 inline-flex items-center gap-2 text-xs text-white/45 transition hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para a comunidade
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[28px] glass-card p-8 sm:p-10"
      >
        <div
          className="pointer-events-none absolute -right-28 -top-28 h-[340px] w-[340px] rounded-full opacity-25 blur-[120px]"
          style={{ background: tierColor(tier) }}
        />
        <div className="relative z-10 flex flex-wrap items-center gap-6">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={member.full_name ?? "Aluno"}
              className="h-24 w-24 rounded-3xl object-cover ring-1 ring-white/15"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#7B2EFF] to-[#00F5FF] font-display text-2xl font-bold">
              {initials(member.full_name)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {member.full_name ?? "Aluno"}
            </h1>
            <div className="mt-1 text-sm text-white/45">{member.riot_id ?? "Riot ID não vinculado"}</div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span
                className="rounded-full border px-3 py-1 text-xs font-medium"
                style={{ borderColor: `${tierColor(tier)}66`, color: tierColor(tier), background: `${tierColor(tier)}12` }}
              >
                {tier}
              </span>
              {gain > 0 && (
                <span className="rounded-full border border-[#00F5FF]/40 bg-[#00F5FF]/10 px-3 py-1 text-xs text-[#00F5FF]">
                  +{gain} divisões desde {entry}
                </span>
              )}
              {days && <span className="text-xs text-white/40">{days} dias no Projeto</span>}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <Reveal key={m.label} delay={i * 0.04}>
            <Tilt className="group h-full rounded-3xl" intensity={5} glow={`${m.accent}33`}>
              <div className="relative h-full overflow-hidden rounded-3xl glass-card p-6 hover-lift">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">{m.label}</span>
                  <m.icon className="h-4 w-4" style={{ color: m.accent }} />
                </div>
                <div className="mt-4 font-display text-2xl font-bold" style={{ color: m.accent }}>
                  {m.value}
                </div>
                <div
                  className="pointer-events-none absolute -bottom-14 -right-14 h-36 w-36 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40"
                  style={{ background: m.accent }}
                />
              </div>
            </Tilt>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-5">
        <div className="rounded-[28px] glass-card p-7">
          <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">Medalhas</div>
          <div className="mt-5 flex flex-wrap gap-3">
            {member.badges.map((b) => {
              const badge = BADGES[b as BadgeKey];
              if (!badge) return null;
              return (
                <div
                  key={b}
                  className="inline-flex items-center gap-3 rounded-2xl border px-4 py-3 transition hover:-translate-y-0.5"
                  style={{ borderColor: `${badge.accent}44`, background: `${badge.accent}0d` }}
                >
                  <span className="text-xl">{badge.emoji}</span>
                  <div>
                    <div className="text-sm font-medium" style={{ color: badge.accent }}>{badge.label}</div>
                    <div className="text-[11px] text-white/40">{badge.desc}</div>
                  </div>
                </div>
              );
            })}
            {member.badges.length === 0 && (
              <p className="text-sm text-white/45">Este aluno ainda não conquistou medalhas.</p>
            )}
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-5">
        <div className="rounded-[28px] glass-card p-7">
          <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">Antes e depois</div>
          <div className="mt-5 flex items-center gap-4 font-display text-2xl font-bold">
            <span style={{ color: tierColor(entry) }}>{entry}</span>
            <span className="text-white/25">→</span>
            <span style={{ color: tierColor(tier) }}>{tier}</span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/8">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.min(100, gain * 8)}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-[#7B2EFF] via-[#6F4BFF] to-[#00F5FF] shadow-[0_0_18px_rgba(0,245,255,0.55)]"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-white/45 sm:grid-cols-4">
            <span>{days ? `${days} dias de jornada` : "—"}</span>
            <span>{Number(s?.hours_studied ?? 0).toFixed(0)}h assistidas</span>
            <span>{s?.mentorships_done ?? 0} mentorias</span>
            <span>Objetivo: {s?.goal_tier ?? "Radiante"}</span>
          </div>
        </div>
      </Reveal>
    </>
  );
}
