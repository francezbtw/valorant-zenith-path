import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Save, User2, Gamepad2, ExternalLink, BadgeCheck, ShieldQuestion } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/membros/MemberShell";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, usePlan } from "@/hooks/use-member";
import { useValorantAccount, useSaveValorantAccount } from "@/hooks/use-valorant";
import { PLAN_LABEL } from "@/lib/member";
import { VALORANT_REGIONS, trackerUrl, tierColor } from "@/lib/valorant";
import { verifyRiotId } from "@/lib/riot.functions";

export const Route = createFileRoute("/_authenticated/app/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil · Área de Membros — Projeto Radiante" },
      { name: "description", content: "Atualize seu nome, sua conta Valorant e o elo atual dentro do Projeto Radiante." },
      { property: "og:title", content: "Perfil — Projeto Radiante" },
      { property: "og:description", content: "Seus dados de aluno e sua conta Valorant no Projeto Radiante." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PerfilPage,
});

type Tab = "dados" | "valorant";

function PerfilPage() {
  const plan = usePlan();
  const [tab, setTab] = useState<Tab>("dados");

  return (
    <>
      <PageHeader
        eyebrow={plan ? `Plano ${PLAN_LABEL[plan]}` : "Sem plano"}
        title="Seu perfil"
        subtitle="Mantenha seus dados atualizados para as análises da mentoria."
      />

      <div className="mb-6 inline-flex rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur">
        {([
          { id: "dados" as Tab, label: "Dados da conta", icon: User2 },
          { id: "valorant" as Tab, label: "Conta Valorant", icon: Gamepad2 },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition ${
              tab === t.id ? "text-white" : "text-white/50 hover:text-white/80"
            }`}
          >
            {tab === t.id && (
              <motion.span
                layoutId="perfil-tab"
                className="absolute inset-0 rounded-xl border border-white/10 bg-gradient-to-r from-[#7B2EFF]/30 to-[#00F5FF]/10 shadow-[0_0_30px_-10px_rgba(123,46,255,0.9)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <t.icon className="relative z-10 h-4 w-4" />
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === "dados" ? <DadosForm /> : <ValorantForm />}
    </>
  );
}

function DadosForm() {
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [rank, setRank] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setRank(profile.current_rank ?? "");
    }
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, current_rank: rank })
      .eq("id", profile.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Perfil atualizado.");
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
      onSubmit={save}
      className="max-w-xl space-y-4 rounded-3xl glass-card p-7"
    >
      <Field label="Nome completo" value={fullName} onChange={setFullName} />
      <Field label="Elo atual" value={rank} onChange={setRank} placeholder="Ex.: Ascendente 2" />
      <div>
        <label className="text-[10px] uppercase tracking-[0.22em] text-white/40">E-mail</label>
        <div className="mt-2 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5 text-sm text-white/45">
          {profile?.email}
        </div>
      </div>
      <button type="submit" disabled={saving} className="btn-hero w-full disabled:opacity-60">
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Salvar alterações
      </button>
    </motion.form>
  );
}

function ValorantForm() {
  const { data: account } = useValorantAccount();
  const { data: profile } = useProfile();
  const saveAccount = useSaveValorantAccount();
  const [riotName, setRiotName] = useState("");
  const [riotTag, setRiotTag] = useState("");
  const [region, setRegion] = useState("br");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (account) {
      setRiotName(account.riot_name);
      setRiotTag(account.riot_tag);
      setRegion(account.region);
    }
  }, [account]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = riotName.trim();
    const tag = riotTag.trim().replace(/^#/, "");
    if (!name || !tag) {
      toast.error("Informe o Riot ID e a tag.");
      return;
    }
    try {
      await saveAccount.mutateAsync({ riot_name: name, riot_tag: tag, region });
      toast.success("Conta Valorant vinculada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  };

  const verify = async () => {
    const name = riotName.trim();
    const tag = riotTag.trim().replace(/^#/, "");
    if (!name || !tag) {
      toast.error("Informe o Riot ID e a tag antes de verificar.");
      return;
    }
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

  const fullId = account ? `${account.riot_name}#${account.riot_tag}` : null;
  const accent = tierColor(profile?.current_rank);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
      className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      <form onSubmit={save} className="space-y-4 rounded-3xl glass-card p-7">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/45">
          <Gamepad2 className="h-3.5 w-3.5" /> Vincular conta
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <Field label="Riot ID" value={riotName} onChange={setRiotName} placeholder="Francez" />
          <Field label="Tag" value={riotTag} onChange={setRiotTag} placeholder="BR1" />
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
          Exemplo de Riot ID completo: <span className="text-white/70">Francez#BR1</span>
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={saveAccount.isPending} className="btn-hero flex-1 disabled:opacity-60">
            {saveAccount.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Salvar conta
          </button>
          <button
            type="button"
            onClick={verify}
            disabled={checking}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-5 py-3.5 text-sm text-white/75 transition hover:border-[#00F5FF]/50 hover:text-white disabled:opacity-60"
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldQuestion className="h-4 w-4" />}
            Verificar na Riot
          </button>
        </div>
      </form>

      <div className="rounded-3xl glass-card relative overflow-hidden p-7">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-40"
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
          {fullId && (
            <a
              href={trackerUrl(account!.riot_name, account!.riot_tag)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white/80 transition hover:-translate-y-0.5 hover:border-[#00F5FF]/50 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" /> Abrir no Tracker.gg
            </a>
          )}
          <p className="mt-5 text-[11px] leading-relaxed text-white/35">
            A verificação automática usa a API oficial da Riot e é ativada assim que a chave (RIOT_API_KEY) for
            configurada. Até então você pode registrar seus dados manualmente.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.22em] text-white/40">{label}</label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm outline-none transition focus:border-[#7B2EFF]/60 focus:bg-white/[0.07]"
      />
    </div>
  );
}
