import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { ArrowLeft, Check, CreditCard, Loader2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { getPlan } from "@/lib/plans.functions";
import { createCheckout } from "@/lib/checkout.functions";
import { supabase } from "@/integrations/supabase/client";
import { PLAN_LABEL } from "@/lib/member";

export const Route = createFileRoute("/checkout/$slug")({
  loader: async ({ params }) => {
    const plan = await getPlan({ data: { slug: params.slug } });
    if (!plan) throw notFound();
    return plan;
  },
  head: ({ loaderData }) => {
    const title = loaderData
      ? `Checkout ${loaderData.name} — Projeto Radiante`
      : "Checkout — Projeto Radiante";
    const description = loaderData?.description
      ? loaderData.description.slice(0, 155)
      : "Finalize sua matrícula no Projeto Radiante com pagamento seguro.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  errorComponent: () => <Fallback message="Não foi possível carregar este plano." />,
  notFoundComponent: () => <Fallback message="Plano não encontrado ou indisponível." />,
  component: CheckoutPage,
});

function Fallback({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card rounded-3xl p-10 text-center">
        <h1 className="font-display text-2xl font-bold">{message}</h1>
        <Link to="/" hash="planos" className="btn-hero mt-6 inline-flex">
          Ver planos
        </Link>
      </div>
    </main>
  );
}

const METHODS = [
  { id: "stripe" as const, label: "Cartão de crédito", hint: "Stripe · seguro e imediato", available: true },
  { id: "mercadopago" as const, label: "Pix e boleto", hint: "Mercado Pago · em breve", available: false },
];

function brl(cents: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: currency || "BRL" }).format(cents / 100);
}

function CheckoutPage() {
  const plan = Route.useLoaderData();
  const startCheckout = useServerFn(createCheckout);
  const [method, setMethod] = useState<"stripe" | "mercadopago">("stripe");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  async function finish() {
    setError(null);
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Informe um e-mail válido — é nele que você recebe o acesso.");
      return;
    }
    setLoading(true);
    try {
      const origin = window.location.origin;
      const { url } = await startCheckout({
        data: {
          planSlug: plan.slug,
          provider: method,
          customerEmail: email,
          successUrl: `${origin}/checkout/sucesso?plano=${plan.slug}`,
          cancelUrl: `${origin}/checkout/${plan.slug}`,
        },
      });
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível iniciar o pagamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen px-4 py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(123,46,255,0.28),transparent_70%)] blur-2xl" />
      <div className="relative mx-auto max-w-5xl">
        <Link
          to="/"
          hash="planos"
          className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para os planos
        </Link>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 font-display text-3xl font-bold tracking-tight sm:text-4xl"
        >
          Finalize sua matrícula
        </motion.h1>
        <p className="mt-2 text-sm text-white/55">
          Plano <span className="text-white">{PLAN_LABEL[plan.tier]}</span> · acesso liberado automaticamente após a
          confirmação do pagamento.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Plano + método */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card rounded-3xl p-7 sm:p-9"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">Plano escolhido</span>
                <h2 className="mt-2 font-display text-2xl font-bold text-gradient-brand">{plan.name}</h2>
                {plan.tagline && <p className="mt-1 text-sm text-white/55">{plan.tagline}</p>}
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7B2EFF] to-[#00F5FF] shadow-[0_10px_30px_-5px_rgba(0,245,255,0.5)]">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>

            {plan.description && (
              <p className="mt-5 text-sm leading-relaxed text-white/65">{plan.description}</p>
            )}

            <div className="my-7 h-px bg-white/10" />

            <h3 className="text-[11px] uppercase tracking-[0.22em] text-white/40">Benefícios inclusos</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-white/75">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7B2EFF] to-[#00F5FF]">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="my-7 h-px bg-white/10" />

            <h3 className="text-[11px] uppercase tracking-[0.22em] text-white/40">E-mail de acesso</h3>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#00F5FF]/50"
            />
            <p className="mt-2 text-xs text-white/40">
              Sua conta é criada automaticamente neste e-mail e você recebe o link para definir a senha.
            </p>

            <h3 className="mt-8 text-[11px] uppercase tracking-[0.22em] text-white/40">Método de pagamento</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  disabled={!m.available}
                  onClick={() => setMethod(m.id)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                    method === m.id
                      ? "border-[#00F5FF]/50 bg-white/[0.07] shadow-[0_0_30px_-12px_rgba(0,245,255,0.8)]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/25"
                  }`}
                >
                  <CreditCard className="h-4 w-4 text-white/70" />
                  <span>
                    <span className="block text-sm font-medium text-white">{m.label}</span>
                    <span className="block text-[11px] text-white/45">{m.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </motion.section>

          {/* Resumo */}
          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="h-fit rounded-3xl border border-white/15 bg-[linear-gradient(180deg,rgba(35,18,70,0.9),rgba(8,5,20,0.95))] p-7 shadow-[0_50px_120px_-40px_rgba(123,46,255,0.8)] lg:sticky lg:top-8"
          >
            <h2 className="font-display text-lg font-semibold">Resumo da compra</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between text-white/60">
                <dt>{plan.name}</dt>
                <dd className="text-white">{brl(plan.price_cents, plan.currency)}</dd>
              </div>
              <div className="flex justify-between text-white/60">
                <dt>Acesso</dt>
                <dd>Imediato</dd>
              </div>
              <div className="flex justify-between text-white/60">
                <dt>Descontos</dt>
                <dd>—</dd>
              </div>
            </dl>
            <div className="my-6 h-px bg-white/10" />
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-white/60">Total</span>
              <span className="font-display text-3xl font-bold">{brl(plan.price_cents, plan.currency)}</span>
            </div>

            {error && (
              <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
                {error}
              </p>
            )}

            <button
              onClick={finish}
              disabled={loading}
              className="btn-primary-radiante mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {loading ? "Abrindo pagamento…" : "Finalizar compra"}
            </button>

            <div className="mt-5 flex items-center gap-2 text-[11px] text-white/40">
              <ShieldCheck className="h-4 w-4 text-[#00F5FF]/70" />
              Pagamento processado com criptografia · garantia de 7 dias
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}
