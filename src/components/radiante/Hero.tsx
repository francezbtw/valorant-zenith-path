import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Flame, Play } from "lucide-react";
import { Particles } from "./Background";
import type { MouseEvent } from "react";

export function Hero() {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(useTransform(ry, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 15 });
  const rotateY = useSpring(useTransform(rx, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 15 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    rx.set((e.clientX - r.left) / r.width - 0.5);
    ry.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden pt-28 pb-16">
      <Particles />
      <div className="relative z-10 mx-auto max-w-6xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs sm:text-sm text-white/80"
        >
          <span>🔥</span>
          <span>Método para jogadores que querem chegar ao próximo nível</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-6 font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-[0.9] tracking-tighter"
        >
          <span className="block text-white">PROJETO</span>
          <span className="block text-gradient-brand">RADIANTE</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-white/70 leading-relaxed"
        >
          Aprenda exatamente como jogadores <span className="text-white">Radiantes</span> pensam, treinam e vencem.
          Sem perder meses vendo conteúdos aleatórios.
        </motion.p>

        {/* Video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          style={{ perspective: 1200 }}
          className="group relative mx-auto mt-12 w-full max-w-4xl"
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative"
          >
            {/* Glow layers */}
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-[#7B2EFF] via-[#6F4BFF] to-[#00F5FF] opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-70" />
            <div className="absolute -inset-1 rounded-[1.75rem] bg-gradient-to-r from-[#7B2EFF] via-[#6F4BFF] to-[#00F5FF] opacity-80" />
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-black shadow-[0_40px_120px_-20px_rgba(123,46,255,0.6)]">
              <div className="aspect-video w-full">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80"
                  className="h-full w-full object-cover"
                >
                  <source src="https://cdn.coverr.co/videos/coverr-a-gamer-playing-a-video-game-3388/1080p.mp4" type="video/mp4" />
                </video>
              </div>
              {/* Reflection */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10" />
            </div>
          </motion.div>
          {/* Reflection under */}
          <div className="mx-auto mt-2 h-16 w-[80%] rounded-[100%] bg-[#7B2EFF]/40 blur-3xl opacity-60" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <a href="#cta" className="btn-primary-radiante">
            <Flame className="h-4 w-4" /> Quero Evoluir Agora
          </a>
          <a href="#videos" className="btn-ghost-radiante">
            <Play className="h-4 w-4" /> Assistir Conteúdo
          </a>
        </motion.div>
      </div>
    </section>
  );
}
