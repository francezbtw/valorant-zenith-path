import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useRef, type MouseEvent, type ReactNode } from "react";

/**
 * Reveal — cinematic scroll-in wrapper used across the whole platform.
 * Respects prefers-reduced-motion.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 24,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Tilt — 3D hover with a cursor-following spotlight.
 */
export function Tilt({
  children,
  className = "",
  intensity = 6,
  glow = "rgba(123,46,255,0.20)",
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glow?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const rotateX = useSpring(useTransform(ry, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: 150,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(rx, [-0.5, 0.5], [-intensity, intensity]), {
    stiffness: 150,
    damping: 18,
  });
  const spotlight = useTransform(
    [gx, gy],
    ([x, y]) => `radial-gradient(420px circle at ${x}% ${y}%, ${glow}, transparent 45%)`,
  );

  if (reduce) return <div className={className}>{children}</div>;

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    rx.set(nx - 0.5);
    ry.set(ny - 0.5);
    gx.set(nx * 100);
    gy.set(ny * 100);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    gx.set(50);
    gy.set(50);
  };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ perspective: 1100 }}>
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`relative ${className}`}
      >
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 [.group:hover_&]:opacity-100"
          style={{ background: spotlight, opacity: 1 }}
        />
        <div className="relative z-10 h-full">{children}</div>
      </motion.div>
    </div>
  );
}

/**
 * StatCard — the shared metric tile for dashboards (student + admin).
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  accent = "#7B2EFF",
  hint,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
  accent?: string;
  hint?: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <Tilt className="group h-full rounded-3xl" intensity={5} glow={`${accent}33`}>
        <div className="relative h-full overflow-hidden rounded-3xl glass-card p-6 hover-lift">
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-[10px] uppercase tracking-[0.22em] text-white/40">
              {label}
            </span>
            <Icon className="h-4 w-4 shrink-0" style={{ color: accent }} />
          </div>
          <div
            className="mt-4 font-display text-3xl font-bold tracking-tight"
            style={{ color: accent }}
          >
            {value}
          </div>
          {hint && <div className="mt-1 text-xs text-white/40">{hint}</div>}
          <div
            className="pointer-events-none absolute -bottom-12 -right-12 h-36 w-36 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
            style={{ background: accent }}
          />
        </div>
      </Tilt>
    </Reveal>
  );
}
