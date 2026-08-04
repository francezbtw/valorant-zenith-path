import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";

/**
 * Confirmation modal for destructive administrative actions.
 * When `phrase` is given, the admin must type it to unlock the button.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  phrase,
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  phrase?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [typed, setTyped] = useState("");
  const locked = !!phrase && typed.trim().toUpperCase() !== phrase.toUpperCase();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            role="alertdialog"
            aria-modal="true"
            className="fixed left-1/2 top-1/2 z-[61] w-[min(460px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-[#0a0713]/95 p-6 shadow-[0_60px_140px_-40px_rgba(255,60,90,0.5)] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h2 className="font-display text-lg font-bold">{title}</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">{description}</p>

            {phrase && (
              <div className="mt-5">
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-white/40">
                  Digite <span className="text-white/80">{phrase}</span> para confirmar
                </label>
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none transition focus:border-red-400/50"
                />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => { setTyped(""); onCancel(); }}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 transition hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => { onConfirm(); setTyped(""); }}
                disabled={locked || busy}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-[#7B2EFF] px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
