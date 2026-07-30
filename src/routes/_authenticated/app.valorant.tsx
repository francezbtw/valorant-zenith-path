import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  BadgeCheck, ExternalLink, Gamepad2, Loader2, RefreshCcw, Save, ShieldQuestion, TrendingUp, Zap,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/membros/MemberShell";
import { useProfile } from "@/hooks/use-member";
import { useValorantAccount, useSaveValorantAccount, useRankHistory } from "@/hooks/use-valorant";
import { VALORANT_REGIONS, trackerUrl, tierColor, formatRiotId } from "@/lib/valorant";
import { verifyRiotId, syncValorantRank } from "@/lib/riot.functions";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/app/valorant")({
  head: () => ({
    meta: [
      { title: "Meu Perfil Valorant · Projeto Radiante" },
      { name: "description", content: "Vincule seu Riot ID, tag e região para acompanhar sua evolução dentro do Projeto Radiante." },
      { property: "og:title", content: "Meu Perfil Valorant — Projeto Radiante" },
      { property: "og:description", content: "Riot ID, tag, região e sincronização de elo do aluno." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ValorantProfilePage,
});

function ValorantProfilePage() {
  const qc = useQueryClient();
  const { data: account } = useValorantAccount();
  const { data: profile } = useProfile();
  const { data: history = [] } = useRankHistory();
  const saveAccount = useSaveValorantAccount();

  const [riotName, setRiotName] = useState("");
  const [riotTag, setRiotTag] = useState("");
  const [region, setRegion] = useState("br");
  const [checking, setChecking] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (account) {
      setRiotName(account.riot_name);
      setRiotTag(account.riot_tag);
      setRegion(account.region);
    }
  }, [account]);

  const latest = history[history.length - 1];
  const accent = tierColor(latest?.rank_tier ?? profile?.current_rank);
  const fullId = formatRiotId(account?.riot_name, account?.riot_tag);

  const clean = () => ({ name: riotName.trim(), tag: riotTag.trim().replace(/^#/, "") });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, tag } = clean();
    if (!name || !tag) return toast.error("Informe o Riot ID e a tag.");
    if (name.length > 32 || tag.length > 8) return toast.error("Riot ID ou tag muito longos.");
    try {
      await saveAccount.mutateAsync({ riot_name: name, riot_tag: tag, region });
      toast.success("Perfil Valorant salvo.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  };

  const verify = async () => {
    const { name, tag } = clean();
    if (!name || !tag) return toast.error("Informe o Riot ID e a tag antes de verificar.");
    setChecking(true);
    try {
      const result = await verifyRiotId({ data: { riotName: name, riotTag: tag, region } });
      if (result.status === "not_configured") {
        toast.info("Verificação automática indisponível: a chave da API da Riot ainda não foi configurada.");
      } else if (result.status === "found") {
        await saveAccount.mutateAsync({
          riot_name: result.gameName,
          riot_tag: result.tagLine,
          region,
          puuid: result.puuid,
          verified_at: new Date().toISOString(),
        });
        toast.success(`Riot ID confirmado: ${result.gameName}#${result.tagLine}`);
      } else if (result.status === "not_found") {
        toast.error("Esse Riot ID não foi encontrado.");
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro na verificação.");
    } finally {
      setChecking(false);
    }
  };

  const sync = async () => {
    setSyncing(true);
    try {
      const result = await syncValorantRank({ data: {} });
      if (result.status === "synced") {
        qc.invalidateQueries({ queryKey: ["rank-history"] });
        toast.success(`Elo sincronizado: ${result.tier} · ${result.rr} RR`);
      } else if (result.status === "no_account") {
        toast.error("Salve seu Riot ID antes de sincronizar.");
      } else if (result.status === "not_configured") {
        toast.info(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro na sincronização.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Área Valorant"
        title="Meu Perfil Valorant"
        subtitle="Vincule sua conta para conectar seu elo real ao seu progresso no curso."
      />

      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]"
      >
        <form onSubmit={save} className="space-y-4 rounded-3xl glass-card p-7">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/45">
            <Gamepad2 className="h-3.5 w-3.5" /> Dados da conta Riot
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <Field label="Riot ID" value={riotName} onChange={setRiotName} placeholder="QCK" maxLength={32} />
            <Field label="Tag" value={riotTag} onChange={setRiotTag} placeholder="BR1" maxLength={8} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.22em] text-white/40">Região</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-4 py-3.5 text-sm outline-none transition focus:border-[#7B2EFF]/60"
            >
              {VALORANT_REGIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-white/40">
            Riot ID completo: <span className="text-white/70">{riotName || "QCK"}#{riotTag || "BR1"}</span>
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" disabled={saveAccount.isPending} className="btn-hero flex-1 disabled:opacity-60">
              {saveAccount.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Salvar
            </button>
            <button
              type="button" onClick={verify} disabled={checking}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-5 py-3.5 text-sm text-white/75 transition hover:border-[#00F5FF]/50 hover:text-white disabled:opacity-60"
            >
              {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldQuestion className="h-4 w-4" />}
              Verificar na Riot
            </button>
          </div>
        </form>

        <div className="relative overflow-hidden rounded-3xl glass-card p-7">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
            style={{ background: accent }}
          />
          <div className="relative z-10">
            <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Conta vinculada</div>
            <div className="mt-4 font-display text-xl font-bold">{fullId ?? "Nenhuma conta ainda"}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">
              {account ? (VALORANT_REGIONS.find((r) => r.value === account.region)?.label ?? account.region) : "—"}
            </div>
            {account?.verified_at && (
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#3BD16F]/40 bg-[#3BD16F]/10 px-3 py-1 text-[11px] text-[#8CF0B0]">
                <BadgeCheck className="h-3.5 w-3.5" /> Verificada na Riot
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Elo registrado</div>
              <div className="mt-1 font-display text-2xl font-bold" style={{ color: accent }}>
                {latest?.rank_tier ?? "—"}
              </div>
              <div className="text-xs text-white/45">{latest ? `${latest.rr} RR` : "Sem registros ainda"}</div>
            </div>

            <button
              onClick={sync} disabled={syncing}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white/80 transition hover:-translate-y-0.5 hover:border-[#7B2EFF]/60 hover:text-white disabled:opacity-60"
            >
              {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Sincronizar elo automático
            </button>

            {fullId && (
              <a
                href={trackerUrl(account!.riot_name, account!.riot_tag)}
                target="_blank" rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white/80 transition hover:-translate-y-0.5 hover:border-[#00F5FF]/50 hover:text-white"
              >
                <ExternalLink className="h-4 w-4" /> Abrir no Tracker.gg
              </a>
            )}

            <Link
              to="/app/evolucao"
              className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white/80 transition hover:-translate-y-0.5 hover:border-[#00F5FF]/50 hover:text-white"
            >
              <TrendingUp className="h-4 w-4" /> Ver minha evolução
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="mt-5 flex items-start gap-3 rounded-3xl border border-[#7B2EFF]/25 bg-[#7B2EFF]/[0.06] p-6">
        <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[#B486FF]" />
        <p className="text-sm leading-relaxed text-white/55">
          Estrutura pronta para a API oficial da Riot Games. Assim que a chave de API for configurada, a verificação do
          Riot ID e a atualização de elo/RR passam a acontecer automaticamente — nada precisa ser refeito aqui.
        </p>
      </div>
    </>
  );
}

function Field({
  label, value, onChange, placeholder, maxLength,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.22em] text-white/40">{label}</label>
      <input
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm outline-none transition focus:border-[#7B2EFF]/60 focus:bg-white/[0.07]"
      />
    </div>
  );
}
