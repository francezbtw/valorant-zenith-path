import type { PlanTier } from "@/lib/member";

export type FulfillInput = {
  provider: "stripe" | "mercadopago";
  providerRef: string;
  email: string | null;
  fullName?: string | null;
  plan: PlanTier;
  amountCents: number;
  currency?: string;
  userId?: string | null;
};

/**
 * Single source of truth for "payment approved":
 * 1. resolve (or create) the student account
 * 2. register the payment
 * 3. create/upgrade the enrollment (releases the purchased plan)
 * 4. keep the profile up to date
 */
export async function fulfillPayment(input: FulfillInput) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  let userId = input.userId ?? null;
  let accessLink: string | null = null;

  if (!userId && input.email) {
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", input.email)
      .maybeSingle();

    if (existing) {
      userId = existing.id;
    } else {
      const created = await supabaseAdmin.auth.admin.createUser({
        email: input.email,
        email_confirm: true,
        user_metadata: { full_name: input.fullName ?? null },
      });
      if (created.error) throw created.error;
      userId = created.data.user?.id ?? null;

      // Welcome flow: recovery link lets the student set their own password.
      const link = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: input.email,
      });
      accessLink = link.data?.properties?.action_link ?? null;
    }
  }

  if (!userId) throw new Error("Não foi possível identificar o aluno do pagamento.");

  await supabaseAdmin.from("payments").upsert(
    {
      user_id: userId,
      plan: input.plan,
      amount_cents: input.amountCents,
      currency: input.currency ?? "BRL",
      status: "paid",
      provider: input.provider,
      provider_ref: input.providerRef,
      paid_at: new Date().toISOString(),
    },
    { onConflict: "provider,provider_ref" },
  );

  await supabaseAdmin.from("enrollments").upsert(
    {
      user_id: userId,
      plan: input.plan,
      status: "active",
      provider: input.provider,
      provider_ref: input.providerRef,
      started_at: new Date().toISOString(),
      expires_at: null,
    },
    { onConflict: "user_id" },
  );

  if (input.email) {
    await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: userId,
          email: input.email,
          ...(input.fullName ? { full_name: input.fullName } : {}),
        },
        { onConflict: "id" },
      );
  }

  return { userId, accessLink };
}

export function planFromMetadata(value: unknown): PlanTier {
  const v = String(value ?? "").toLowerCase();
  if (v === "mentoria" || v === "intermediario" || v === "basico") return v;
  return "basico";
}
