import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { fulfillPayment, planFromMetadata } from "@/lib/payments.server";

function verifyStripeSignature(header: string | null, payload: string, secret: string) {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const timestamp = parts.t;
  const provided = parts.v1;
  if (!timestamp || !provided) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        const body = await request.text();

        if (!secret) return new Response("Webhook não configurado", { status: 503 });
        if (!verifyStripeSignature(request.headers.get("stripe-signature"), body, secret)) {
          return new Response("Assinatura inválida", { status: 401 });
        }

        const event = JSON.parse(body);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("payment_events").upsert(
          { provider: "stripe", event_id: event.id, event_type: event.type, payload: event },
          { onConflict: "provider,event_id" },
        );

        if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
          return new Response("ignored");
        }

        const session = event.data.object;
        try {
          await fulfillPayment({
            provider: "stripe",
            providerRef: String(session.id),
            email: session.customer_details?.email ?? session.customer_email ?? null,
            fullName: session.customer_details?.name ?? null,
            plan: planFromMetadata(session.metadata?.plan),
            amountCents: Number(session.amount_total ?? 0),
            currency: String(session.currency ?? "brl").toUpperCase(),
          });
          await supabaseAdmin
            .from("payment_events")
            .update({ processed: true })
            .eq("provider", "stripe")
            .eq("event_id", event.id);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error("stripe fulfillment failed", message);
          await supabaseAdmin
            .from("payment_events")
            .update({ error: message })
            .eq("provider", "stripe")
            .eq("event_id", event.id);
          return new Response(`Falha ao liberar acesso: ${message}`, { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
