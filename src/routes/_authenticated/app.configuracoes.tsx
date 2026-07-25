import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/membros/MemberShell";
import { supabase } from "@/integrations/supabase/client";
import { usePlan, useEnrollment } from "@/hooks/use-member";
import { PLAN_LABEL } from "@/lib/member";

export const Route = createFileRoute("/_authenticated/app/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações · Área de Membros — Projeto Radiante" },
      { name: "description", content: "Gerencie sua senha, sessão e detalhes do plano contratado no Projeto Radiante." },
      { property: "og:title", content: "Configurações — Projeto Radiante" },
      { property: "og:description", content: "Segurança da conta e informações do seu plano." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfigPage,
});

function ConfigPage() {
  const plan = usePlan();
  const { data: enrollment } = useEnrollment();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    setPassword("");
    toast.success("Senha alterada com sucesso.");
  };

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <>
      <PageHeader eyebrow="Conta" title="Configurações" subtitle="Segurança, sessão e detalhes do seu acesso." />

      <div className="grid gap-5 lg:grid-cols-2">
        <form onSubmit={changePassword} className="rounded-3xl glass-card p-7">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/45">
            <KeyRound className="h-3.5 w-3.5" /> Alterar senha
          </div>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nova senha"
            className="mt-5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm outline-none transition focus:border-[#7B2EFF]/60"
          />
          <button type="submit" disabled={loading} className="btn-hero mt-4 w-full disabled:opacity-60">
            {loading && <Loader2 className="h-5 w-5 animate-spin" />} Atualizar senha
          </button>
        </form>

        <div className="rounded-3xl glass-card p-7">
          <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Seu plano</div>
          <div className="mt-5 font-display text-3xl font-bold text-gradient-brand">
            {plan ? PLAN_LABEL[plan] : "Nenhum plano ativo"}
          </div>
          <dl className="mt-5 space-y-2 text-sm text-white/55">
            <div className="flex justify-between"><dt>Status</dt><dd>{enrollment?.status ?? "—"}</dd></div>
            <div className="flex justify-between"><dt>Origem</dt><dd>{enrollment?.source ?? "—"}</dd></div>
            <div className="flex justify-between">
              <dt>Válido até</dt>
              <dd>{enrollment?.expires_at ? new Date(enrollment.expires_at).toLocaleDateString("pt-BR") : "Vitalício"}</dd>
            </div>
          </dl>
          <button
            onClick={signOut}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" /> Encerrar sessão
          </button>
        </div>
      </div>
    </>
  );
}
