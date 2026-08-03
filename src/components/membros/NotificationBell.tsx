import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellRing, Check } from "lucide-react";
import {
  useNotifications,
  useMarkNotificationsRead,
  useNotificationsRealtime,
  requestPushPermission,
} from "@/hooks/use-notifications";
import { timeAgo } from "@/lib/community";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: items = [] } = useNotifications();
  const markRead = useMarkNotificationsRead();
  useNotificationsRealtime();

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={async () => {
          setOpen((v) => !v);
          if (!open) await requestPushPermission();
        }}
        className="relative rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
        aria-label="Notificações"
      >
        {unread > 0 ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF4655] px-1 text-[9px] font-bold shadow-[0_0_10px_rgba(255,70,85,0.8)]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 z-50 mt-2 w-[320px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0910]/95 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Notificações</span>
                {unread > 0 && (
                  <button
                    onClick={() => markRead.mutate(undefined)}
                    className="inline-flex items-center gap-1 text-[11px] text-white/50 transition hover:text-white"
                  >
                    <Check className="h-3 w-3" /> marcar lidas
                  </button>
                )}
              </div>
              <div className="max-h-[340px] overflow-y-auto">
                {items.length === 0 ? (
                  <p className="px-4 py-8 text-center text-xs text-white/40">Nada por aqui ainda.</p>
                ) : (
                  items.map((n) => (
                    <Link
                      key={n.id}
                      to={n.link ?? "/app"}
                      onClick={() => {
                        markRead.mutate([n.id]);
                        setOpen(false);
                      }}
                      className={`block border-b border-white/5 px-4 py-3 transition hover:bg-white/5 ${n.read ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00F5FF] shadow-[0_0_8px_#00F5FF]" />}
                        <div className="min-w-0">
                          <div className="text-sm font-medium">{n.title}</div>
                          {n.body && <div className="mt-0.5 text-xs text-white/50">{n.body}</div>}
                          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/30">{timeAgo(n.created_at)}</div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
