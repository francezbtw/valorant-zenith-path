import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAdminOps, useRoleAssignments, useMyRoles, ROLE_LABEL, type AppRole } from "@/hooks/use-admin-ops";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const ROLES: AppRole[] = ["admin", "mentor", "support", "user"];

const ROLE_STYLE: Record<string, string> = {
  admin: "bg-[#7B2EFF]/20 text-[#c8b0ff]",
  mentor: "bg-[#00AEEF]/20 text-[#9fe4ff]",
  support: "bg-[#00F5FF]/15 text-[#a8fbff]",
  moderator: "bg-white/10 text-white/70",
  user: "bg-white/8 text-white/55",
};

/** Grant, list and revoke platform access levels. */
export function RolesManager() {
  const { data: assignments = [], isLoading } = useRoleAssignments();
  const { data: myRoles = [] } = useMyRoles();
  const { grantRole, revokeRole, claimFirstAdmin } = useAdminOps();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("support");
  const [pending, setPending] = useState<{ userId: string; role: AppRole; email: string } | null>(null);

  const hasAdmin = assignments.some((a) => a.role === "admin");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await grantRole.mutateAsync({ email, role });
      toast.success(`${ROLE_LABEL[role]} concedido a ${email}.`);
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível conceder o acesso.");
    }
  };

  return (
    <section className="rounded-3xl glass-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Segurança</div>
          <h2 className="mt-1 font-display text-lg font-bold">Níveis de permissão</h2>
          <p className="mt-1 max-w-xl text-xs text-white/45">
            Admin administra tudo. Mentor responde mentorias. Suporte atende alunos. Aluno acessa apenas a área de membros.
          </p>
        </div>
        {!hasAdmin && !myRoles.includes("admin") && (
          <button
            onClick={async () => {
              try {
                const r = await claimFirstAdmin.mutateAsync();
                toast[r.claimed ? "success" : "error"](r.claimed ? "Você agora é administrador." : r.reason ?? "Já existe um admin.");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Falhou.");
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7B2EFF] to-[#00F5FF] px-4 py-2.5 text-sm font-semibold"
          >
            <ShieldCheck className="h-4 w-4" /> Tornar-me administrador
          </button>
        )}
      </div>

      <form onSubmit={submit} className="mt-6 flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <label htmlFor="role-email" className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-white/40">E-mail da conta</label>
          <input
            id="role-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="pessoa@email.com"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-[#00F5FF]/40"
          />
        </div>
        <div>
          <label htmlFor="role-select" className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-white/40">Nível</label>
          <select
            id="role-select"
            value={role}
            onChange={(e) => setRole(e.target.value as AppRole)}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-[#00F5FF]/40"
          >
            {ROLES.map((r) => (
              <option key={r} value={r} className="bg-[#0a0713]">{ROLE_LABEL[r]}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={grantRole.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7B2EFF] to-[#00AEEF] px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 disabled:opacity-50"
        >
          {grantRole.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Conceder acesso
        </button>
      </form>

      <div className="mt-7">
        {isLoading ? (
          <div className="flex justify-center py-10 text-white/50"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : assignments.length === 0 ? (
          <p className="py-10 text-center text-sm text-white/45">Nenhuma permissão atribuída ainda.</p>
        ) : (
          <ul className="space-y-2">
            {assignments.map((a) => (
              <motion.li
                key={a.id}
                layout
                className="flex flex-wrap items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm"
              >
                <span className={`rounded-full px-2.5 py-1 text-[11px] ${ROLE_STYLE[a.role] ?? "bg-white/10"}`}>
                  {ROLE_LABEL[a.role] ?? a.role}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-white/85">{a.name}</div>
                  <div className="truncate text-xs text-white/40">{a.email}</div>
                </div>
                <button
                  onClick={() => setPending({ userId: a.user_id, role: a.role, email: a.email })}
                  aria-label="Revogar acesso"
                  className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 transition hover:border-red-500/40 hover:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={!!pending}
        title="Revogar permissão"
        description={`Remover o nível ${pending ? ROLE_LABEL[pending.role] : ""} de ${pending?.email ?? ""}? A pessoa perde o acesso imediatamente.`}
        confirmLabel="Revogar"
        busy={revokeRole.isPending}
        onCancel={() => setPending(null)}
        onConfirm={async () => {
          if (!pending) return;
          try {
            await revokeRole.mutateAsync({ userId: pending.userId, role: pending.role });
            toast.success("Permissão revogada.");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Não foi possível revogar.");
          } finally {
            setPending(null);
          }
        }}
      />
    </section>
  );
}
