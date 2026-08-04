import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search, Lock, Unlock, Mail, RotateCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useStudents, useStudentActions, type StudentOverview } from "@/hooks/use-admin";
import { useAdminOps } from "@/hooks/use-admin-ops";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const PLANS = [
  { value: "basico", label: "Básico" },
  { value: "intermediario", label: "Intermediário" },
  { value: "mentoria", label: "Mentoria" },
] as const;

const STATUS = [
  { value: "active", label: "Ativa" },
  { value: "canceled", label: "Cancelada" },
  { value: "past_due", label: "Atrasada" },
];

function fmtDate(v: string | null) {
  return v ? new Date(v).toLocaleDateString("pt-BR") : "—";
}

export function StudentsManager() {
  const { data: students, isLoading } = useStudents();
  const { setPlan, setBlocked, setStatus } = useStudentActions();
  const { deleteStudent, resetProgress, emailStudent } = useAdminOps();
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState<{ kind: "delete" | "reset"; student: StudentOverview } | null>(null);
  const [mailTo, setMailTo] = useState<StudentOverview | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");


  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students ?? [];
    return (students ?? []).filter((s) =>
      `${s.full_name ?? ""} ${s.email ?? ""} ${s.plan ?? ""}`.toLowerCase().includes(q),
    );
  }, [students, query]);

  const run = async (p: Promise<unknown>, ok: string) => {
    try {
      await p;
      toast.success(ok);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível salvar.");
    }
  };

  return (
    <div className="rounded-2xl glass-card p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Alunos</h2>
          <p className="text-xs text-white/45">{filtered.length} registro(s)</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, e-mail ou plano"
            className="w-64 rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-white/30 focus:border-[#7B2EFF]/60"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-white/50">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-14 text-center text-sm text-white/45">Nenhum aluno encontrado.</p>
      ) : (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-white/40">
                {["Aluno", "Plano", "Status", "Cadastro", "Último acesso", "Progresso", "Conta", "Ações"].map((h) => (
                  <th key={h} className="px-3 pb-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s: StudentOverview) => (
                <tr key={s.id} className="border-t border-white/5 transition hover:bg-white/[0.03]">
                  <td className="px-3 py-3">
                    <div className="font-medium text-white/90">{s.full_name ?? "Aluno"}</div>
                    <div className="text-xs text-white/40">{s.email ?? "—"}</div>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={s.plan ?? ""}
                      onChange={(e) =>
                        run(
                          setPlan.mutateAsync({
                            userId: s.id,
                            enrollmentId: s.enrollmentId,
                            plan: e.target.value as "basico" | "intermediario" | "mentoria",
                          }),
                          "Plano atualizado.",
                        )
                      }
                      className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs outline-none focus:border-[#7B2EFF]/60"
                    >
                      <option value="" disabled>Sem plano</option>
                      {PLANS.map((p) => (
                        <option key={p.value} value={p.value} className="bg-[#0a0713]">{p.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={s.status ?? ""}
                      disabled={!s.enrollmentId}
                      onChange={(e) =>
                        run(setStatus.mutateAsync({ enrollmentId: s.enrollmentId!, status: e.target.value }), "Status atualizado.")
                      }
                      className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs outline-none disabled:opacity-40 focus:border-[#7B2EFF]/60"
                    >
                      <option value="" disabled>—</option>
                      {STATUS.map((o) => (
                        <option key={o.value} value={o.value} className="bg-[#0a0713]">{o.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3 text-white/65">{fmtDate(s.created_at)}</td>
                  <td className="px-3 py-3 text-white/65">{fmtDate(s.last_seen_at)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, s.progress)}%` }}
                          transition={{ duration: 0.6 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#7B2EFF] to-[#00F5FF]"
                        />
                      </div>
                      <span className="text-xs text-white/55">{Math.min(100, s.progress)}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => run(setBlocked.mutateAsync({ userId: s.id, blocked: !s.blocked }), s.blocked ? "Conta desbloqueada." : "Conta bloqueada.")}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition ${
                        s.blocked
                          ? "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                          : "border-white/10 bg-white/5 text-white/70 hover:text-white"
                      }`}
                    >
                      {s.blocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                      {s.blocked ? "Bloqueada" : "Ativa"}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { setMailTo(s); setSubject(""); setMessage(""); }}
                        aria-label="Enviar e-mail"
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 transition hover:text-white"
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirm({ kind: "reset", student: s })}
                        aria-label="Resetar progresso"
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 transition hover:text-white"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirm({ kind: "delete", student: s })}
                        aria-label="Excluir conta"
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 transition hover:border-red-500/40 hover:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
