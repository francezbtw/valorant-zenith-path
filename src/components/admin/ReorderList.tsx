import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { GripVertical, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logAdmin } from "@/hooks/use-admin-ops";

type Item = { id: string; title: string; position: number; parent?: string | null };

/**
 * Drag-and-drop ordering for modules or lessons.
 * Positions are persisted only when the admin confirms.
 */
export function ReorderList({
  table,
  parentKey,
  label,
}: {
  table: "modules" | "lessons";
  parentKey?: "course_id" | "module_id";
  label: string;
}) {
  const qc = useQueryClient();
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [parent, setParent] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reorder", table],
    queryFn: async () => {
      const cols = parentKey ? `id, title, position, ${parentKey}` : "id, title, position";
      const { data, error } = await supabase.from(table).select(cols).order("position");
      if (error) throw error;
      return (data ?? []) as unknown as Record<string, string | number>[];
    },
  });

  const { data: parents = [] } = useQuery({
    queryKey: ["admin", "reorder-parents", parentKey],
    enabled: !!parentKey,
    queryFn: async () => {
      const from = parentKey === "course_id" ? "courses" : "modules";
      const { data } = await supabase.from(from).select("id, title").order("position");
      return (data ?? []) as { id: string; title: string }[];
    },
  });

  useEffect(() => {
    const mapped = (data ?? []).map((r) => ({
      id: String(r.id),
      title: String(r.title),
      position: Number(r.position ?? 0),
      parent: parentKey ? (r[parentKey] ? String(r[parentKey]) : null) : null,
    }));
    setItems(parentKey && parent ? mapped.filter((m) => m.parent === parent) : mapped);
  }, [data, parent, parentKey]);

  function onDrop(targetId: string) {
    if (!dragging || dragging === targetId) return;
    setItems((list) => {
      const next = [...list];
      const from = next.findIndex((i) => i.id === dragging);
      const to = next.findIndex((i) => i.id === targetId);
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDragging(null);
  }

  async function persist() {
    setSaving(true);
    try {
      await Promise.all(
        items.map((item, index) => supabase.from(table).update({ position: index + 1 }).eq("id", item.id)),
      );
      await logAdmin("reorder", table, null, { count: items.length });
      await qc.invalidateQueries({ queryKey: ["admin", table] });
      await qc.invalidateQueries({ queryKey: ["admin", "reorder", table] });
      toast.success("Ordem salva.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível salvar a ordem.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mb-8 rounded-3xl glass-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Ordenação</div>
          <h2 className="mt-1 font-display text-lg font-bold">{label}</h2>
          <p className="mt-1 text-xs text-white/45">Arraste os itens para reordenar e salve para aplicar.</p>
        </div>
        <div className="flex items-center gap-3">
          {parentKey && (
            <select
              value={parent}
              onChange={(e) => setParent(e.target.value)}
              className="min-w-[200px] rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-[#00F5FF]/50"
            >
              <option value="">Todos</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#111]">{p.title}</option>
              ))}
            </select>
          )}
          <button
            onClick={persist}
            disabled={saving || items.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7B2EFF] to-[#00AEEF] px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 disabled:opacity-40"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar ordem
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10 text-white/50"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-white/45">Nada para ordenar aqui ainda.</p>
      ) : (
        <ul className="mt-5 space-y-2">
          {items.map((item, i) => (
            <motion.li
              key={item.id}
              layout
              draggable
              onDragStart={() => setDragging(item.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(item.id)}
              className={`flex cursor-grab items-center gap-3 rounded-xl border px-3.5 py-3 text-sm transition ${
                dragging === item.id
                  ? "border-[#00F5FF]/50 bg-[#00F5FF]/10"
                  : "border-white/8 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              <GripVertical className="h-4 w-4 text-white/35" />
              <span className="w-7 text-xs text-white/35">{i + 1}</span>
              <span className="flex-1 truncate">{item.title}</span>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}
