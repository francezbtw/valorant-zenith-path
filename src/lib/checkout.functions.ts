import { createServerFn } from "@tanstack/react-start";
import type { PlanTier } from "@/lib/member";

type CheckoutInput = {
  planSlug: string;
  provider: "stripe" | "mercadopago";
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string | null;
};

/**
 * Creates a checkout session. Works as soon as STRIPE_SECRET_KEY /
 * MERCADOPAGO_ACCESS_TOKEN are configured — no other change needed.
 */
export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: CheckoutInput) => {
    if (!input?.planSlug) throw new Error("Plano inválido");
    if (input.provider !== "stripe" && input.provider !== "mercadopago") throw new Error("Provedor inválido");
    return input;
  })
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createClient(process.env.SUPABASE_URL!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const { data: plan, error } = await supabase
      .from("plans")
      .select("slug, name, tier, price_cents, currency, stripe_price_id")
      .eq("slug", data.planSlug)
      .eq("active", true)
      .maybeSingle();
    if (error) throw error;
    if (!plan) throw new Error("Plano não encontrado.");

    if (data.provider === "stripe") {
      const secret = process.env.STRIPE_SECRET_KEY;
      if (!secret) throw new Error("Stripe ainda não está configurado. Adicione a chave STRIPE_SECRET_KEY.");

      const body = new URLSearchParams();
      body.set("mode", "payment");
      body.set("success_url", data.successUrl);
      body.set("cancel_url", data.cancelUrl);
      body.set("metadata[plan]", plan.tier as PlanTier);
      if (plan.stripe_price_id) {
        body.set("line_items[0][price]", plan.stripe_price_id);
        body.set("line_items[0][quantity]", "1");
      } else {
        body.set("line_items[0][quantity]", "1");
        body.set("line_items[0][price_data][currency]", (plan.currency ?? "BRL").toLowerCase());
        body.set("line_items[0][price_data][unit_amount]", String(plan.price_cents));
        body.set("line_items[0][price_data][product_data][name]", plan.name);
      }

      const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(`Stripe [${res.status}]: ${JSON.stringify(json)}`);
      return { url: json.url as string };
    }

    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) throw new Error("Mercado Pago ainda não está configurado. Adicione a chave MERCADOPAGO_ACCESS_TOKEN.");

    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          {
            title: plan.name,
            quantity: 1,
            currency_id: plan.currency ?? "BRL",
            unit_price: plan.price_cents / 100,
          },
        ],
        metadata: { plan: plan.tier },
        external_reference: plan.tier,
        back_urls: { success: data.successUrl, failure: data.cancelUrl, pending: data.cancelUrl },
        auto_return: "approved",
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(`Mercado Pago [${res.status}]: ${JSON.stringify(json)}`);
    return { url: (json.init_point ?? json.sandbox_init_point) as string };
  });
