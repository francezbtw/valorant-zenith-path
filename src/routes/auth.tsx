import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Particles } from "@/components/radiante/Background";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar · Área de Membros — Projeto Radiante" },
      { name: "description", content: "Acesse a área de membros do Projeto Radiante: curso, mentoria, comunidade e seu progresso em um só lugar." },
      { property: "og:title", content: "Área de Membros — Projeto Radiante" },
      { property: "og:description", content: "Entre na plataforma do Projeto Radiante e continue sua evolução no Valorant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta, Radiante.");
        navigate({ to: "/app", replace: true });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Confirme seu e-mail para liberar o acesso.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Enviamos um link de recuperação para o seu e-mail.");
        setMode("login");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Algo deu errado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/app", replace: true });
  };

  const titles: Record<Mode, string> = {
    login: "Acessar plataforma",
    signup: "Criar sua conta",
    forgot: "Recuperar acesso",
  };
  const subtitles: Record<Mode, string> = {
    login: "Entre para continuar de onde você parou.",
    signup: "Crie sua conta e comece a pensar o jogo como um Radiante.",
    forgot: "Enviaremos um link para você definir uma nova senha.",
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-4 py-16">
      <Particles />
      <div className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-[#7B2EFF]/25 blur-[150px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[520px] w-[520px] rounded-full bg-[#00AEEF]/20 blur-[150px]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-xs text-white/45 transition hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao site
        </Link>

        <div className="relative overflow-hidden rounded-[2rem] glass-card p-8 sm:p-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00F5FF]/70 to-transparent" />

          <div className="flex items-center gap-2.5">
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-[#7B2EFF] via-[#6F4BFF] to-[#00F5FF] p-[1.5px] shadow-[0_0_24px_rgba(123,46,255,0.7)]">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0a0a0a] font-display text-sm font-bold">R</div>
            </div>
            <span className="font-display text-base font-semibold">
              Projeto <span className="text-gradient-brand">Radiante</span>
            </span>
          </div>

          <h1 className="mt-7 font-display text-2xl font-bold tracking-tight sm:text-3xl">{titles[mode]}</h1>
          <p className="mt-2 text-sm text-white/50">{subtitles[mode]}</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-3.5">
            <AnimatePresence initial={false}>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                >
                  <Field icon={User} type="text" placeholder="Seu nome" value={name} onChange={setName} required />
                </motion.div>
              )}
            </AnimatePresence>

            <Field icon={Mail} type="email" placeholder="seu@email.com" value={email} onChange={setEmail} required />

            {mode !== "forgot" && (
              <Field icon={Lock} type="password" placeholder="Sua senha" value={password} onChange={setPassword} required minLength={6} />
            )}

            {mode === "login" && (
              <button type="button" onClick={() => setMode("forgot")} className="block text-right text-xs text-white/45 transition hover:text-[#00F5FF] w-full">
                Esqueci minha senha
              </button>
            )}

            <button type="submit" disabled={loading} className="btn-hero w-full disabled:opacity-60">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
              {mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Enviar link"}
            </button>
          </form>

          {mode !== "forgot" && (
            <>
              <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-white/30">
                <span className="h-px flex-1 bg-white/10" /> ou <span className="h-px flex-1 bg-white/10" />
              </div>

              <button
                onClick={googleSignIn}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/12 bg-white/5 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
              >
                <GoogleIcon /> Continuar com Google
              </button>
            </>
          )}

          <p className="mt-7 text-center text-sm text-white/45">
            {mode === "signup" ? "Já tem conta?" : "Ainda não tem conta?"}{" "}
            <button
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              className="font-medium text-[#00F5FF] transition hover:text-white"
            >
              {mode === "signup" ? "Entrar" : "Criar agora"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function Field({
  icon: Icon, type, placeholder, value, onChange, required, minLength,
}: {
  icon: React.ComponentType<{ className?: string }>;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div className="group relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35 transition group-focus-within:text-[#00F5FF]" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        minLength={minLength}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#7B2EFF]/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_4px_rgba(123,46,255,0.12)]"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
