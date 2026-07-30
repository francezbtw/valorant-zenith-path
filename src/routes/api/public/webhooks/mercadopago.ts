import { createFileRoute } from "@tanstack/react-router";
import { fulfillPayment, planFromMetadata } from "@/lib/payments.server";

/**
 * Mercado Pago webhook (IPN). Mercado Pago sends only an id + topic, so we
 * fetch the authoritative payment from their API before releasing access.
 */
export const Route = createFileRoute("/api/public/webhooks/mercadopago")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!token) return new Response("Webhook não configurado", { status: 503 });

        const body = await request.text();
        let event: any = {};
        try {
          event = JSON.parse(body);
        } catch {
          return new Response("Payload inválido", { status: 400 });
        }

        const url = new URL(request.url);
        const type = String(event.type ?? url.searchParams.get("topic") ?? "");
        const paymentId = String(
          event.data?.id ?? url.searchParams.get("id") ?? "",
        );

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("payment_events").upsert(
          { provider: "mercadopago", event_id: paymentId || null, event_type: type, payload: event },
          { onConflict: "provider,event_id" },
        );

        if (!paymentId || (type !== "payment" && type !== "merchant_order")) {
          return new Response("ignored");
        }

        const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payment = await res.json();
        if (!res.ok) {
          console.error(`mercadopago lookup failed [${res.status}]`, payment);
          return new Response(`Mercado Pago [${res.status}]`, { status: 502 });
        }
        if (payment.status !== "approved") return new Response("pending");

        try {
          await fulfillPayment({
            provider: "mercadopago",
            providerRef: String(payment.id),
            email: payment.payer?.email ?? null,
            fullName:
              [payment.payer?.first_name, payment.payer?.last_name].filter(Boolean).join(" ") || null,
            plan: planFromMetadata(payment.metadata?.plan ?? payment.external_reference),
            amountCents: Math.round(Number(payment.transaction_amount ?? 0) * 100),
            currency: String(payment.currency_id ?? "BRL"),
          });
          await supabaseAdmin
            .from("payment_events")
            .update({ processed: true })
            .eq("provider", "mercadopago")
            .eq("event_id", paymentId);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error("mercadopago fulfillment failed", message);
          await supabaseAdmin
            .from("payment_events")
            .update({ error: message })
            .eq("provider", "mercadopago")
            .eq("event_id", paymentId);
          return new Response(`Falha ao liberar acesso: ${message}`, { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
