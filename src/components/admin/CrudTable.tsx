import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAdminMutations, useAdminRows, type AdminTable } from "@/hooks/use-admin";

export type FieldType = "text" | "textarea" | "number" | "boolean" | "select" | "json" | "datetime" | "readonly";

export type Field = {
  key: string;
  label: string;
  type?: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  /** hide from the table listing */
  hideInTable?: boolean;
  /** hide from the create/edit form */
  hideInForm?: boolean;
  /** default value when creating */
  defaultValue?: unknown;
};

type Row = Record<string, unknown>;

function displayValue(field: Field, value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (field.type === "boolean") return value ? "Sim" : "Não";
  if (field.type === "json") return Array.isArray(value) ? `${value.length} item(ns)` : "—";
  if (field.type === "datetime") return new Date(String(value)).toLocaleString("pt-BR");
  const s = String(value);
  return s.length > 46 ? `${s.slice(0, 46)}…` : s;
}

export function CrudTable({
  table,
  fields,
  title,
  emptyLabel = "Nenhum registro ainda.",
  orderBy = "created_at",
  ascending = false,
  canCreate = true,
  canDelete = true,
  canEdit = true,
  searchKeys,
}: {
  table: AdminTable;
  fields: Field[];
  title: string;
  emptyLabel?: string;
  orderBy?: string;
  ascending?: boolean;
  canCreate?: boolean;
  canDelete?: boolean;
  canEdit?: boolean;
  searchKeys?: string[];
}) {
  const { data: rows, isLoading } = useAdminRows<Row>(table, orderBy, ascending);
  const { create, update, remove } = useAdminMutations(table);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");

  const tableFields = fields.filter((f) => !f.hideInTable);
  const formFields = fields.filter((f) => !f.hideInForm && f.type !== "readonly");

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    const keys = searchKeys ?? fields.map((f) => f.key);
    return rows.filter((r) => keys.some((k) => String(r[k] ?? "").toLowerCase().includes(q)));
  }, [rows, query, searchKeys, fields]);

  const closeForm = () => { setEditing(null); setCreating(false); };

  const submit = async (values: Row) => {
    try {
      if (editing) await update.mutateAsync({ id: String(editing.id), values });
      else await create.mutateAsync(values);
      toast.success(editing ? "Registro atualizado." : "Registro criado.");
      closeForm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível salvar.");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success("Registro removido.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível remover.");
    }
  };

  return (
    <div className="rounded-2xl glass-card p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Buscar em ${title.toLowerCase()}`}
            aria-label={`Buscar em ${title}`}
            className="w-64 max-w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#00F5FF]/40"
          />
        </div>
        {canCreate && (
          <button
            onClick={() => { setEditing(null); setCreating(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7B2EFF] to-[#00AEEF] px-4 py-2.5 text-sm font-semibold shadow-[0_10px_30px_-10px_rgba(123,46,255,0.9)] transition hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" /> Novo
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-white/50">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-14 text-center text-sm text-white/45">{emptyLabel}</p>
      ) : (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-white/40">
                {tableFields.map((f) => (
                  <th key={f.key} className="px-3 pb-3 font-medium">{f.label}</th>
                ))}
                <th className="px-3 pb-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={String(row.id)} className="border-t border-white/5 transition hover:bg-white/[0.03]">
                  {tableFields.map((f) => (
                    <td key={f.key} className="px-3 py-3 text-white/75">{displayValue(f, row[f.key])}</td>
                  ))}
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit && (
                        <button
                          onClick={() => { setCreating(false); setEditing(row); }}
                          aria-label="Editar"
                          className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(String(row.id))}
                          aria-label="Remover"
                          className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 transition hover:border-red-500/40 hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {(creating || editing) && (
          <RecordForm
            fields={formFields}
            initial={editing ?? {}}
            title={editing ? `Editar ${title}` : `Novo em ${title}`}
            saving={create.isPending || update.isPending}
            onCancel={closeForm}
            onSubmit={submit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RecordForm({
  fields, initial, title, saving, onCancel, onSubmit,
}: {
  fields: Field[];
  initial: Row;
  title: string;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (values: Row) => void;
}) {
  const [values, setValues] = useState<Row>(() => {
    const base: Row = {};
    for (const f of fields) {
      const v = initial[f.key];
      base[f.key] = v !== undefined && v !== null
        ? (f.type === "json" ? JSON.stringify(v, null, 2) : v)
        : (f.defaultValue ?? (f.type === "boolean" ? false : f.type === "number" ? 0 : ""));
    }
    return base;
  });

  const set = (k: string, v: unknown) => setValues((s) => ({ ...s, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Row = {};
    for (const f of fields) {
      const raw = values[f.key];
      if (f.type === "number") payload[f.key] = Number(raw) || 0;
      else if (f.type === "boolean") payload[f.key] = !!raw;
      else if (f.type === "json") {
        try { payload[f.key] = JSON.parse(String(raw || "[]")); }
        catch { toast.error(`Campo "${f.label}" precisa ser um JSON válido.`); return; }
      } else if (f.type === "datetime") payload[f.key] = raw ? new Date(String(raw)).toISOString() : null;
      else payload[f.key] = raw === "" ? null : raw;
    }
    onSubmit(payload);
  };

  const inputCls = "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#00F5FF]/40";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onCancel}
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
      />
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-1/2 top-1/2 z-50 max-h-[86vh] w-[min(640px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-white/10 bg-[#0a0713]/95 p-6 shadow-[0_60px_140px_-40px_rgba(123,46,255,0.8)] backdrop-blur-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button type="button" onClick={onCancel} aria-label="Fechar" className="rounded-lg border border-white/10 bg-white/5 p-1.5">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className={f.type === "textarea" || f.type === "json" ? "sm:col-span-2" : ""}>
              <label htmlFor={`f-${f.key}`} className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-white/45">
                {f.label}
              </label>
              {f.type === "textarea" || f.type === "json" ? (
                <textarea
                  id={`f-${f.key}`} rows={f.type === "json" ? 5 : 3}
                  value={String(values[f.key] ?? "")}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className={`${inputCls} font-mono`}
                />
              ) : f.type === "boolean" ? (
                <button
                  id={`f-${f.key}`} type="button"
                  onClick={() => set(f.key, !values[f.key])}
                  className={`flex h-[42px] w-full items-center gap-3 rounded-xl border px-3.5 text-sm transition ${
                    values[f.key] ? "border-[#00F5FF]/40 bg-[#00F5FF]/10 text-white" : "border-white/10 bg-white/[0.03] text-white/50"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${values[f.key] ? "bg-[#00F5FF] shadow-[0_0_10px_#00F5FF]" : "bg-white/25"}`} />
                  {values[f.key] ? "Ativo" : "Inativo"}
                </button>
              ) : f.type === "select" ? (
                <select
                  id={`f-${f.key}`}
                  value={String(values[f.key] ?? "")}
                  onChange={(e) => set(f.key, e.target.value)}
                  className={`${inputCls} [&>option]:bg-[#0a0713]`}
                >
                  <option value="">—</option>
                  {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input
                  id={`f-${f.key}`}
                  type={f.type === "number" ? "number" : f.type === "datetime" ? "datetime-local" : "text"}
                  value={
                    f.type === "datetime" && values[f.key]
                      ? new Date(String(values[f.key])).toISOString().slice(0, 16)
                      : String(values[f.key] ?? "")
                  }
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  required={f.required}
                  className={inputCls}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 transition hover:text-white">
            Cancelar
          </button>
          <button
            type="submit" disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7B2EFF] to-[#00AEEF] px-5 py-2.5 text-sm font-semibold shadow-[0_10px_30px_-10px_rgba(123,46,255,0.9)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
          </button>
        </div>
      </motion.form>
    </>
  );
}
