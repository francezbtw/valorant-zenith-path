import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AppRole = "admin" | "moderator" | "user" | "mentor" | "support";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function assertAdmin(context: any) {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!data) throw new Error("Acesso negado: apenas administradores.");
}

/**
 * First-run bootstrap: if the platform has no administrator yet, the signed-in
 * user claims the admin role. Once an admin exists this becomes a no-op.
 */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) return { claimed: false, reason: "Já existe um administrador." };
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { claimed: true };
  });

/** Grant a role to an existing account, found by e-mail. Admin only. */
export const grantRoleByEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; role: AppRole }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.trim().toLowerCase();

    const { data: profile } = await supabaseAdmin.from("profiles").select("id").ilike("email", email).maybeSingle();
    let userId = profile?.id ?? null;

    if (!userId) {
      const invited = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
      userId = invited.data.user?.id ?? null;
      if (!userId) throw new Error("Não foi possível localizar ou convidar esse e-mail.");
    }

    const { error } = await supabaseAdmin.from("user_roles").upsert(
      { user_id: userId, role: data.role },
      { onConflict: "user_id,role" },
    );
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("admin_logs").insert({
      actor_id: context.userId,
      action: "role.grant",
      entity: "user_roles",
      entity_id: userId,
      details: { email, role: data.role },
    });
    return { userId };
  });

/** Remove a role from an account. Admin only. */
export const revokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; role: AppRole }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.userId === context.userId && data.role === "admin") {
      throw new Error("Você não pode remover o seu próprio acesso de administrador.");
    }
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", data.role);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("admin_logs").insert({
      actor_id: context.userId,
      action: "role.revoke",
      entity: "user_roles",
      entity_id: data.userId,
      details: { role: data.role },
    });
    return { ok: true };
  });

/** Permanently delete a student account and all of its data. Admin only. */
export const deleteStudentAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.userId === context.userId) throw new Error("Você não pode excluir a própria conta.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("admin_logs").insert({
      actor_id: context.userId,
      action: "student.delete",
      entity: "profiles",
      entity_id: data.userId,
      details: {},
    });
    return { ok: true };
  });

/** Wipe a student's course progress. Admin only. */
export const resetStudentProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("lesson_progress").delete().eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("admin_logs").insert({
      actor_id: context.userId,
      action: "student.reset_progress",
      entity: "profiles",
      entity_id: data.userId,
      details: {},
    });
    return { ok: true };
  });

/** Send a one-off e-mail to a single student. Admin only. */
export const sendStudentEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; email: string; subject: string; message: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const apiKey = process.env["RESEND_API_KEY"];
    const from = process.env["RESEND_FROM"] ?? "Projeto Radiante <onboarding@resend.dev>";
    if (!apiKey) {
      throw new Error("Envio de e-mail indisponível: conecte um domínio de e-mail para ativar os disparos.");
    }
    const html = `<div style="font-family:Inter,Arial,sans-serif;background:#050505;color:#fff;padding:32px">
      <h1 style="font-size:20px;margin:0 0 16px">${data.subject}</h1>
      <div style="color:#cfcfe6;line-height:1.6;white-space:pre-wrap">${data.message}</div>
      <p style="margin-top:28px;color:#7a7a90;font-size:12px">Projeto Radiante</p>
    </div>`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [data.email], subject: data.subject, html }),
    });
    if (!res.ok) throw new Error(`Falha no envio: ${await res.text()}`);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("admin_logs").insert({
      actor_id: context.userId,
      action: "student.email",
      entity: "profiles",
      entity_id: data.userId,
      details: { subject: data.subject },
    });
    return { ok: true };
  });
