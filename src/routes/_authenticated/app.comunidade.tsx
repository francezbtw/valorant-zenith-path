import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Flame, Clock, Swords, Crosshair, Percent, TrendingUp, Heart,
  MessageCircle, Send, Sparkles, Award, Crown, ImagePlus, Radio, Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/membros/MemberShell";
import { Reveal, Tilt } from "@/components/ui/premium";
import {
  useCommunityMembers, usePosts, useCreatePost, useToggleLike, useAddComment,
  useDeletePost, useCommunityRealtime, useMyStats, type CommunityMember, type FeedPost,
} from "@/hooks/use-community";
import { useSessionUser } from "@/hooks/use-member";
import {
  BADGES, POST_KIND_ACCENT, POST_KIND_LABEL, TIER_FAMILIES, familyGain,
  initials, tierColor, tierFamily, tierGain, timeAgo, type BadgeKey,
} from "@/lib/community";

export const Route = createFileRoute("/_authenticated/app/comunidade")({
  head: () => ({
    meta: [
      { title: "Comunidade · Ranking dos Alunos — Projeto Radiante" },
      { name: "description", content: "Ranking geral, top evoluções da semana, Hall da Fama e a timeline em tempo real da comunidade do Projeto Radiante." },
      { property: "og:title", content: "Comunidade — Projeto Radiante" },
      { property: "og:description", content: "Compita de forma saudável, publique conquistas e acompanhe a evolução de todos os alunos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CommunityPage,
});

/* ------------------------------------------------------------------ */

const RANKINGS = [
  { key: "xp", label: "XP", icon: Sparkles, accent: "#7B2EFF", get: (m: CommunityMember) => m.stats?.xp ?? 0, fmt: (v: number) => `${v} XP` },
  { key: "evolucao", label: "Evolução", icon: TrendingUp, accent: "#00F5FF", get: (m: CommunityMember) => tierGain(m.stats?.entry_tier, m.stats?.current_tier ?? m.current_rank), fmt: (v: number) => `+${v} divisões` },
  { key: "streak", label: "Dias consecutivos", icon: Flame, accent: "#FF7A3D", get: (m: CommunityMember) => m.stats?.streak_days ?? 0, fmt: (v: number) => `${v} dias` },
  { key: "horas", label: "Horas estudadas", icon: Clock, accent: "#00AEEF", get: (m: CommunityMember) => Number(m.stats?.hours_studied ?? 0), fmt: (v: number) => `${v.toFixed(1)}h` },
  { key: "mentorias", label: "Mentorias", icon: Swords, accent: "#FF4655", get: (m: CommunityMember) => m.stats?.mentorships_done ?? 0, fmt: (v: number) => `${v}` },
  { key: "hs", label: "HS%", icon: Crosshair, accent: "#E8C05A", get: (m: CommunityMember) => Number(m.stats?.headshot_pct ?? 0), fmt: (v: number) => `${v.toFixed(1)}%` },
  { key: "winrate", label: "Win Rate", icon: Percent, accent: "#3BD16F", get: (m: CommunityMember) => Number(m.stats?.win_rate ?? 0), fmt: (v: number) => `${v.toFixed(1)}%` },
] as const;

function CommunityPage() {
  useCommunityRealtime();
  const { data: members = [] } = useCommunityMembers();
  const { data: me } = useSessionUser();
  const [metric, setMetric] = useState<(typeof RANKINGS)[number]["key"]>("xp");
  const [filter, setFilter] = useState<string>("Geral");

  const active = RANKINGS.find((r) => r.key === metric)!;

  const filtered = useMemo(() => {
    const base = filter === "Geral"
      ? members
      : members.filter((m) => tierFamily(m.stats?.current_tier ?? m.current_rank) === filter);
    return [...base].sort((a, b) => active.get(b) - active.get(a));
  }, [members, filter, active]);

  const topEvolutions = useMemo(
    () =>
      [...members]
        .filter((m) => familyGain(m.stats?.entry_tier, m.stats?.current_tier ?? m.current_rank) > 0)
        .sort(
          (a, b) =>
            tierGain(b.stats?.entry_tier, b.stats?.current_tier ?? b.current_rank) -
            tierGain(a.stats?.entry_tier, a.stats?.current_tier ?? a.current_rank),
        )
        .slice(0, 3),
    [members],
  );

  const hallOfFame = useMemo(
    () =>
      [...members]
        .sort(
          (a, b) =>
            tierGain(b.stats?.entry_tier, b.stats?.current_tier ?? b.current_rank) * 1000 + (b.stats?.xp ?? 0) -
            (tierGain(a.stats?.entry_tier, a.stats?.current_tier ?? a.current_rank) * 1000 + (a.stats?.xp ?? 0)),
        )
        .slice(0, 4),
    [members],
  );

  const lastRadiants = useMemo(
    () => members.filter((m) => tierFamily(m.stats?.current_tier ?? m.current_rank) === "Radiante").slice(0, 6),
    [members],
  );

  return (
    <>
      <PageHeader
        eyebrow="Comunidade"
        title="Ranking do Projeto Radiante"
        subtitle="Evolua, publique suas conquistas e compare seu progresso com toda a comunidade — em tempo real."
      />

      {/* Top evoluções da semana */}
      <Reveal>
        <div className="mb-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
          <Trophy className="h-3.5 w-3.5 text-[#E8C05A]" /> Top evoluções da semana
        </div>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-3">
        {topEvolutions.map((m, i) => {
          const from = m.stats?.entry_tier ?? "—";
          const to = m.stats?.current_tier ?? m.current_rank ?? "—";
          return (
            <Reveal key={m.id} delay={i * 0.06}>
              <Tilt className="group h-full rounded-3xl" intensity={6} glow={`${tierColor(to)}33`}>
                <div className="relative h-full overflow-hidden rounded-3xl glass-card p-6 hover-lift">
                  <div className="flex items-center gap-3">
                    <Avatar member={m} size={44} />
                    <div className="min-w-0">
                      <Link to="/app/aluno/$id" params={{ id: m.id }} className="block truncate text-sm font-semibold hover:text-white">
                        {m.full_name ?? "Aluno"}
                      </Link>
                      <div className="truncate text-[11px] text-white/40">{m.riot_id ?? "Riot ID não vinculado"}</div>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-2 font-display text-lg font-bold">
                    <span style={{ color: tierColor(from) }}>{from}</span>
                    <TrendingUp className="h-4 w-4 text-white/30" />
                    <span style={{ color: tierColor(to) }}>{to}</span>
                  </div>
                  <div className="mt-2 text-xs text-white/45">
                    +{tierGain(m.stats?.entry_tier, to)} divisões · {familyGain(m.stats?.entry_tier, to)} elos
                  </div>
                  <div
                    className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full opacity-25 blur-3xl transition-opacity group-hover:opacity-45"
                    style={{ background: tierColor(to) }}
                  />
                </div>
              </Tilt>
            </Reveal>
          );
        })}
        {topEvolutions.length === 0 && (
          <div className="rounded-3xl glass-card p-6 text-sm text-white/45 md:col-span-3">
            Nenhuma evolução registrada ainda. Atualize seu elo em Perfil Valorant para entrar no ranking.
          </div>
        )}
      </div>

      {/* Ranking geral */}
      <Reveal className="mt-8">
        <div className="overflow-hidden rounded-[28px] glass-card">
          <div className="border-b border-white/8 p-6 sm:p-7">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
              <Trophy className="h-3.5 w-3.5" /> Ranking geral
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {RANKINGS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setMetric(r.key)}
                  className={`relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs transition ${
                    metric === r.key ? "text-white" : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {metric === r.key && (
                    <motion.span
                      layoutId="metric-pill"
                      className="absolute inset-0 rounded-xl border border-white/12 bg-white/[0.07]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <r.icon className="relative z-10 h-3.5 w-3.5" style={{ color: r.accent }} />
                  <span className="relative z-10">{r.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Geral", ...TIER_FAMILIES].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full border px-3 py-1 text-[11px] transition ${
                    filter === f
                      ? "border-white/25 bg-white/10 text-white"
                      : "border-white/8 text-white/45 hover:border-white/20 hover:text-white/75"
                  }`}
                  style={filter === f && f !== "Geral" ? { color: tierColor(f), borderColor: `${tierColor(f)}66` } : undefined}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {filtered.slice(0, 20).map((m, i) => {
              const tier = m.stats?.current_tier ?? m.current_rank;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(0.3, i * 0.03), duration: 0.4 }}
                  className={`flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.035] sm:px-7 ${
                    m.id === me?.id ? "bg-[#7B2EFF]/[0.08]" : ""
                  }`}
                >
                  <div
                    className="w-8 shrink-0 text-center font-display text-lg font-bold"
                    style={{ color: i === 0 ? "#E8C05A" : i === 1 ? "#C9D1D9" : i === 2 ? "#B07A46" : "rgba(255,255,255,0.3)" }}
                  >
                    {i + 1}
                  </div>
                  <Avatar member={m} size={38} />
                  <div className="min-w-0 flex-1">
                    <Link to="/app/aluno/$id" params={{ id: m.id }} className="block truncate text-sm font-medium hover:underline">
                      {m.full_name ?? "Aluno"}
                    </Link>
                    <div className="truncate text-[11px] text-white/35">{m.riot_id ?? "—"}</div>
                  </div>
                  <div className="hidden shrink-0 items-center gap-1 sm:flex">
                    {m.badges.slice(0, 3).map((b) => (
                      <span key={b} title={BADGES[b as BadgeKey]?.label} className="text-sm">
                        {BADGES[b as BadgeKey]?.emoji ?? "🎖️"}
                      </span>
                    ))}
                  </div>
                  <div className="hidden w-28 shrink-0 text-right text-xs sm:block" style={{ color: tierColor(tier) }}>
                    {tier ?? "—"}
                  </div>
                  <div className="w-28 shrink-0 text-right font-display text-sm font-bold" style={{ color: active.accent }}>
                    {active.fmt(active.get(m))}
                  </div>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-7 py-8 text-sm text-white/45">Nenhum aluno neste filtro ainda.</div>
            )}
          </div>
        </div>
      </Reveal>

      {/* Últimos Radiantes */}
      <Reveal className="mt-8">
        <div className="rounded-[28px] glass-card p-7">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
            <Crown className="h-3.5 w-3.5 text-[#FFF6A9]" /> Últimos Radiantes
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {lastRadiants.map((m) => (
              <Link
                key={m.id}
                to="/app/aluno/$id"
                params={{ id: m.id }}
                className="group inline-flex items-center gap-3 rounded-2xl border border-[#FFF6A9]/25 bg-[#FFF6A9]/[0.05] px-4 py-3 transition hover:-translate-y-0.5 hover:border-[#FFF6A9]/60"
              >
                <Avatar member={m} size={34} />
                <div>
                  <div className="text-sm font-medium">{m.full_name ?? "Aluno"}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#FFF6A9]">Radiante</div>
                </div>
              </Link>
            ))}
            {lastRadiants.length === 0 && (
              <p className="text-sm text-white/45">O primeiro Radiante do Projeto pode ser você.</p>
            )}
          </div>
        </div>
      </Reveal>

      {/* Hall da Fama + Antes e Depois */}
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-[28px] glass-card p-7">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
              <Award className="h-3.5 w-3.5 text-[#E8C05A]" /> Hall da Fama
            </div>
            <div className="mt-5 space-y-3">
              {hallOfFame.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <span className="font-display text-lg font-bold text-white/25">{i + 1}</span>
                  <Avatar member={m} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{m.full_name ?? "Aluno"}</div>
                    <div className="text-[11px] text-white/40">
                      +{tierGain(m.stats?.entry_tier, m.stats?.current_tier ?? m.current_rank)} divisões desde a entrada
                    </div>
                  </div>
                  <span className="font-display text-sm font-bold text-[#7B2EFF]">{m.stats?.xp ?? 0} XP</span>
                </div>
              ))}
              {hallOfFame.length === 0 && <p className="text-sm text-white/45">Ainda sem alunos classificados.</p>}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="h-full rounded-[28px] glass-card p-7">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
              <TrendingUp className="h-3.5 w-3.5 text-[#00F5FF]" /> Antes e depois
            </div>
            <div className="mt-5 space-y-4">
              {hallOfFame.slice(0, 3).map((m) => {
                const from = m.stats?.entry_tier ?? "—";
                const to = m.stats?.current_tier ?? m.current_rank ?? "—";
                const days = m.stats?.joined_at
                  ? Math.max(1, Math.round((Date.now() - new Date(m.stats.joined_at).getTime()) / 86400000))
                  : null;
                return (
                  <div key={m.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-3">
                      <Avatar member={m} size={32} />
                      <span className="text-sm font-medium">{m.full_name ?? "Aluno"}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 font-display text-base font-bold">
                      <span style={{ color: tierColor(from) }}>{from}</span>
                      <span className="text-white/25">→</span>
                      <span style={{ color: tierColor(to) }}>{to}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-white/45">
                      <span>{days ? `${days} dias` : "—"}</span>
                      <span>{Number(m.stats?.hours_studied ?? 0).toFixed(0)}h de estudo</span>
                      <span>{m.stats?.mentorships_done ?? 0} mentorias</span>
                    </div>
                  </div>
                );
              })}
              {hallOfFame.length === 0 && <p className="text-sm text-white/45">Sem histórico ainda.</p>}
            </div>
          </div>
        </Reveal>
      </div>

      <Feed />
    </>
  );
}

/* ------------------------------------------------------------------ */

function Avatar({ member, size = 40 }: { member: CommunityMember | { full_name: string | null; avatar_url: string | null }; size?: number }) {
  if (member.avatar_url) {
    return (
      <img
        src={member.avatar_url}
        alt={member.full_name ?? "Aluno"}
        loading="lazy"
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover ring-1 ring-white/15"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7B2EFF] to-[#00F5FF] font-bold"
    >
      {initials(member.full_name)}
    </div>
  );
}

/* ------------------------------------------------------------------ */

const KINDS = [
  { key: "post", label: "Publicação" },
  { key: "achievement", label: "Conquista" },
  { key: "evolution", label: "Evolução" },
  { key: "certificate", label: "Certificado" },
] as const;

function Feed() {
  const { data: posts = [] } = usePosts();
  const { data: members = [] } = useCommunityMembers();
  const { data: me } = useSessionUser();
  const { data: stats } = useMyStats();
  const createPost = useCreatePost();
  const [kind, setKind] = useState<(typeof KINDS)[number]["key"]>("post");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const author = (id: string) => members.find((m) => m.id === id);

  const submit = () => {
    if (!body.trim()) return;
    createPost.mutate(
      { kind, body: body.trim().slice(0, 1000), image_url: imageUrl.trim() || null },
      { onSuccess: () => { setBody(""); setImageUrl(""); } },
    );
  };

  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        {/* Composer */}
        <Reveal>
          <div className="rounded-[28px] glass-card p-6">
            <div className="flex flex-wrap gap-2">
              {KINDS.map((k) => (
                <button
                  key={k.key}
                  onClick={() => setKind(k.key)}
                  className="rounded-full border px-3 py-1 text-[11px] transition"
                  style={{
                    borderColor: kind === k.key ? `${POST_KIND_ACCENT[k.key]}88` : "rgba(255,255,255,0.08)",
                    color: kind === k.key ? POST_KIND_ACCENT[k.key] : "rgba(255,255,255,0.45)",
                    background: kind === k.key ? `${POST_KIND_ACCENT[k.key]}12` : "transparent",
                  }}
                >
                  {k.label}
                </button>
              ))}
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, 1000))}
              rows={3}
              maxLength={1000}
              placeholder={
                stats?.current_tier
                  ? `Compartilhe sua evolução, ${stats.current_tier}…`
                  : "Compartilhe uma conquista, uma clutch ou seu novo elo…"
              }
              className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/85 outline-none transition placeholder:text-white/30 focus:border-[#7B2EFF]/60"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <ImagePlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value.slice(0, 500))}
                  placeholder="URL de imagem ou certificado (opcional)"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-xs text-white/80 outline-none transition placeholder:text-white/25 focus:border-[#00F5FF]/50"
                />
              </div>
              <button
                onClick={submit}
                disabled={!body.trim() || createPost.isPending}
                className="btn-hero inline-flex px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" /> Publicar
              </button>
            </div>
          </div>
        </Reveal>

        {/* Posts */}
        <div className="mt-5 space-y-5">
          <AnimatePresence initial={false}>
            {posts.map((p) => (
              <PostCard key={p.id} post={p} author={author(p.user_id)} me={me?.id} />
            ))}
          </AnimatePresence>
          {posts.length === 0 && (
            <div className="rounded-[28px] glass-card p-8 text-center text-sm text-white/45">
              Ainda não há publicações. Seja o primeiro a compartilhar uma conquista.
            </div>
          )}
        </div>
      </div>

      {/* Timeline em tempo real */}
      <Reveal delay={0.05}>
        <div className="sticky top-6 rounded-[28px] glass-card p-6">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
            <Radio className="h-3.5 w-3.5 text-[#00F5FF]" /> Timeline ao vivo
          </div>
          <div className="mt-5 space-y-4">
            {posts.slice(0, 12).map((p) => {
              const a = author(p.user_id);
              const name = (a?.full_name ?? "Um aluno").split(" ")[0];
              const verb =
                p.kind === "evolution" ? "registrou uma evolução"
                : p.kind === "achievement" ? "desbloqueou uma conquista"
                : p.kind === "certificate" ? "compartilhou um certificado"
                : "publicou na comunidade";
              return (
                <div key={p.id} className="relative pl-5">
                  <span
                    className="absolute left-0 top-1.5 h-2 w-2 rounded-full"
                    style={{ background: POST_KIND_ACCENT[p.kind], boxShadow: `0 0 10px ${POST_KIND_ACCENT[p.kind]}` }}
                  />
                  <div className="text-xs text-white/70">
                    <span className="font-medium text-white">{name}</span> {verb}.
                  </div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-white/30">{timeAgo(p.created_at)}</div>
                </div>
              );
            })}
            {posts.length === 0 && <p className="text-sm text-white/40">Nada acontecendo agora.</p>}
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function PostCard({ post, author, me }: { post: FeedPost; author?: CommunityMember; me?: string }) {
  const toggleLike = useToggleLike();
  const addComment = useAddComment();
  const del = useDeletePost();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const { data: members = [] } = useCommunityMembers();
  const accent = POST_KIND_ACCENT[post.kind];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[28px] glass-card p-6"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full opacity-15 blur-3xl"
        style={{ background: accent }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <Avatar member={author ?? { full_name: null, avatar_url: null }} size={40} />
          <div className="min-w-0 flex-1">
            {author ? (
              <Link to="/app/aluno/$id" params={{ id: author.id }} className="block truncate text-sm font-semibold hover:underline">
                {author.full_name ?? "Aluno"}
              </Link>
            ) : (
              <span className="text-sm font-semibold">Aluno</span>
            )}
            <div className="text-[11px] text-white/35">{timeAgo(post.created_at)}</div>
          </div>
          <span
            className="rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]"
            style={{ borderColor: `${accent}55`, color: accent, background: `${accent}10` }}
          >
            {POST_KIND_LABEL[post.kind]}
          </span>
          {me === post.user_id && (
            <button
              onClick={() => del.mutate(post.id)}
              aria-label="Excluir publicação"
              className="rounded-lg border border-white/8 p-1.5 text-white/35 transition hover:border-[#FF4655]/50 hover:text-[#FF4655]"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-white/80">{post.body}</p>

        {post.image_url && (
          <img
            src={post.image_url}
            alt="Publicação da comunidade"
            loading="lazy"
            className="mt-4 w-full rounded-2xl border border-white/10 object-cover"
          />
        )}

        <div className="mt-5 flex items-center gap-4">
          <button
            onClick={() => toggleLike.mutate({ postId: post.id, liked: post.likedByMe })}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs transition hover:-translate-y-0.5 ${
              post.likedByMe
                ? "border-[#FF4655]/50 bg-[#FF4655]/10 text-[#FF4655]"
                : "border-white/10 text-white/55 hover:text-white"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${post.likedByMe ? "fill-current" : ""}`} /> {post.likeCount}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2 text-xs text-white/55 transition hover:-translate-y-0.5 hover:text-white"
          >
            <MessageCircle className="h-3.5 w-3.5" /> {post.comments.length}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-5 space-y-3 border-t border-white/8 pt-5">
                {post.comments.map((c) => {
                  const ca = members.find((m) => m.id === c.user_id);
                  return (
                    <div key={c.id} className="flex gap-3">
                      <Avatar member={ca ?? { full_name: null, avatar_url: null }} size={28} />
                      <div className="min-w-0 flex-1 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-2.5">
                        <div className="text-[11px] text-white/45">
                          {ca?.full_name ?? "Aluno"} · {timeAgo(c.created_at)}
                        </div>
                        <p className="mt-1 text-sm text-white/80">{c.body}</p>
                      </div>
                    </div>
                  );
                })}
                <div className="flex gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, 500))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && text.trim()) {
                        addComment.mutate({ postId: post.id, body: text.trim() }, { onSuccess: () => setText("") });
                      }
                    }}
                    placeholder="Escreva um comentário…"
                    maxLength={500}
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm outline-none transition placeholder:text-white/25 focus:border-[#7B2EFF]/60"
                  />
                  <button
                    onClick={() => text.trim() && addComment.mutate({ postId: post.id, body: text.trim() }, { onSuccess: () => setText("") })}
                    disabled={!text.trim()}
                    className="rounded-xl border border-white/10 bg-white/[0.05] px-4 text-white/70 transition hover:text-white disabled:opacity-40"
                    aria-label="Enviar comentário"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
