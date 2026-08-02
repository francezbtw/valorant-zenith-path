import type { PlanTier } from "@/lib/member";

export type Gateway = "stripe" | "mercadopago";

export type FulfillInput = {
  provider: Gateway;
  providerRef: string;
  email: string | null;
  fullName?: string | null;
  plan: PlanTier;
  amountCents: number;
  currency?: string;
  userId?: string | null;
  /** Fim do ciclo, quando o gateway informa (assinaturas recorrentes). */
  expiresAt?: string | null;
};

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/**
 * Única fonte de verdade para "pagamento aprovado":
 * 1. resolve (ou cria) a conta do aluno + e-mail de boas-vindas/senha
 * 2. registra o pagamento
 * 3. cria/atualiza a assinatura (libera o plano comprado)
 * 4. mantém o perfil atualizado
 */
export async function fulfillPayment(input: FulfillInput) {
  const supabaseAdmin = await admin();

  let userId = input.userId ?? null;
  let accessLink: string | null = null;
  let isNewAccount = false;

  if (!userId && input.email) {
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", input.email)
      .maybeSingle();

    if (existing) {
      userId = existing.id;
    } else {
      // Convite = conta criada + e-mail automático com link para definir a senha.
      const invited = await supabaseAdmin.auth.admin.inviteUserByEmail(input.email, {
        data: { full_name: input.fullName ?? null, plan: input.plan },
      });

      if (invited.error) {
        // Fallback: cria a conta e gera o link de acesso mesmo assim.
        const created = await supabaseAdmin.auth.admin.createUser({
          email: input.email,
          email_confirm: true,
          user_metadata: { full_name: input.fullName ?? null },
        });
        if (created.error) throw created.error;
        userId = created.data.user?.id ?? null;
        const link = await supabaseAdmin.auth.admin.generateLink({
          type: "recovery",
          email: input.email,
        });
        accessLink = link.data?.properties?.action_link ?? null;
      } else {
        userId = invited.data.user?.id ?? null;
      }
      isNewAccount = true;
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
      expires_at: input.expiresAt ?? null,
      canceled_at: null,
    },
    { onConflict: "user_id" },
  );

  if (input.email) {
    await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email: input.email,
        ...(input.fullName ? { full_name: input.fullName } : {}),
      },
      { onConflict: "id" },
    );
  }

  return { userId, accessLink, isNewAccount };
}

/**
 * Sincroniza o ciclo de vida da assinatura (cancelamento, expiração,
 * pagamento pendente ou falho) a partir de um evento do gateway.
 */
export async function syncSubscriptionStatus(params: {
  provider: Gateway;
  providerRef: string;
  status: "active" | "canceled" | "pending" | "expired";
  expiresAt?: string | null;
  userId?: string | null;
  email?: string | null;
}) {
  const supabaseAdmin = await admin();

  let userId = params.userId ?? null;
  if (!userId) {
    const { data } = await supabaseAdmin
      .from("enrollments")
      .select("user_id")
      .eq("provider", params.provider)
      .eq("provider_ref", params.providerRef)
      .maybeSingle();
    userId = data?.user_id ?? null;
  }
  if (!userId && params.email) {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", params.email)
      .maybeSingle();
    userId = data?.id ?? null;
  }
  if (!userId) return { updated: false };

  await supabaseAdmin
    .from("enrollments")
    .update({
      status: params.status,
      expires_at: params.expiresAt ?? (params.status === "expired" ? new Date().toISOString() : undefined),
      canceled_at: params.status === "canceled" ? new Date().toISOString() : null,
    })
    .eq("user_id", userId);

  return { updated: true, userId };
}

/** Marca um pagamento como reembolsado/falho e bloqueia o acesso premium. */
export async function markPaymentStatus(params: {
  provider: Gateway;
  providerRef: string;
  status: "pending" | "paid" | "refunded" | "failed";
}) {
  const supabaseAdmin = await admin();
  await supabaseAdmin
    .from("payments")
    .update({ status: params.status })
    .eq("provider", params.provider)
    .eq("provider_ref", params.providerRef);
}

export function planFromMetadata(value: unknown): PlanTier {
  const v = String(value ?? "").toLowerCase();
  if (v === "mentoria" || v === "intermediario" || v === "basico") return v;
  return "basico";
}
