import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/membros/MemberShell";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, usePlan } from "@/hooks/use-member";
import { PLAN_LABEL } from "@/lib/member";

export const Route = createFileRoute("/_authenticated/app/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil · Área de Membros — Projeto Radiante" },
      { name: "description", content: "Atualize seu nome, Riot ID e elo atual dentro do Projeto Radiante." },
      { property: "og:title", content: "Perfil — Projeto Radiante" },
      { property: "og:description", content: "Seus dados de aluno no Projeto Radiante." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { data: profile } = useProfile();
  const plan = usePlan();
  const qc = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [riotId, setRiotId] = useState("");
  const [rank, setRank] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setRiotId(profile.riot_id ?? "");
      setRank(profile.current_rank ?? "");
    }
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, riot_id: riotId, current_rank: rank })
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
    <>
      <PageHeader eyebrow={plan ? `Plano ${PLAN_LABEL[plan]}` : "Sem plano"} title="Seu perfil" subtitle="Mantenha seus dados atualizados para as análises da mentoria." />

      <form onSubmit={save} className="max-w-xl space-y-4 rounded-3xl glass-card p-7">
        <Input label="Nome completo" value={fullName} onChange={setFullName} />
        <Input label="Riot ID" value={riotId} onChange={setRiotId} placeholder="Nome#TAG" />
        <Input label="Elo atual" value={rank} onChange={setRank} placeholder="Ex.: Ascendente 2" />
        <div>
          <label className="text-[10px] uppercase tracking-[0.22em] text-white/40">E-mail</label>
          <div className="mt-2 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5 text-sm text-white/45">
            {profile?.email}
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-hero w-full disabled:opacity-60">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Salvar alterações
        </button>
      </form>
    </>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
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
