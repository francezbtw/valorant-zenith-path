import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Lock, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Definir nova senha — Projeto Radiante" },
      { name: "description", content: "Escolha uma nova senha para voltar a acessar a área de membros do Projeto Radiante." },
      { property: "og:title", content: "Definir nova senha — Projeto Radiante" },
      { property: "og:description", content: "Recupere o acesso à sua conta do Projeto Radiante." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Senha atualizada com sucesso.");
    navigate({ to: "/app", replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#050505] px-4">
      <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-[#7B2EFF]/25 blur-[150px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-[#00AEEF]/20 blur-[150px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md rounded-[2rem] glass-card p-8 sm:p-10"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#7B2EFF]/40 to-[#00F5FF]/20">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold">Definir nova senha</h1>
        <p className="mt-2 text-sm text-white/50">Escolha uma senha forte com pelo menos 6 caracteres.</p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <div className="group relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35 group-focus-within:text-[#00F5FF]" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nova senha"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#7B2EFF]/60 focus:bg-white/[0.07]"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-hero w-full disabled:opacity-60">
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            Salvar nova senha
          </button>
        </form>
      </motion.div>
    </div>
  );
}
