import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Rocket } from "lucide-react";
import { Particles } from "./Background";
import { useRef, type MouseEvent } from "react";
import heroVideo from "@/assets/hero-video.mp4.asset.json";

export function Hero() {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(useTransform(ry, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 15 });
  const rotateY = useSpring(useTransform(rx, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 15 });
  const glowX = useTransform(rx, [-0.5, 0.5], ["0%", "100%"]);
  const glowY = useTransform(ry, [-0.5, 0.5], ["0%", "100%"]);

  const videoRef = useRef<HTMLVideoElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    rx.set((e.clientX - r.left) / r.width - 0.5);
    ry.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  const scrollToPlans = () => {
    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden pt-32 pb-20">
      <Particles />
      {/* Energy beams */}
      <div className="pointer-events-none absolute inset-y-0 left-[15%] w-px bg-gradient-to-b from-transparent via-[#7B2EFF]/40 to-transparent animate-beam" />
      <div className="pointer-events-none absolute inset-y-0 right-[18%] w-px bg-gradient-to-b from-transparent via-[#00F5FF]/40 to-transparent animate-beam" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs sm:text-sm text-white/80"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#00F5FF] shadow-[0_0_10px_#00F5FF] animate-pulse-glow" />
          <span className="uppercase tracking-[0.18em] text-[11px]">Mentoria oficial · QCK</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 font-display text-[3.5rem] sm:text-7xl md:text-8xl lg:text-[9.5rem] font-bold leading-[0.85] tracking-[-0.05em]"
        >
          <span className="block text-white">PROJETO</span>
          <span className="block text-gradient-shift">RADIANTE</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mx-auto mt-8 max-w-2xl text-base sm:text-lg md:text-xl text-white/60 leading-[1.6]"
        >
          O caminho para jogar como um verdadeiro Radiante não começa na mira.
          Começa na forma como você <span className="text-white">pensa o jogo</span>.
        </motion.p>

        {/* Video monitor */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 60 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          style={{ perspective: 1400 }}
          className="group relative mx-auto mt-14 w-[92%] max-w-5xl"
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative"
          >
            {/* Ambient glow behind */}
            <div className="absolute -inset-16 rounded-[3rem] bg-[radial-gradient(ellipse_at_center,rgba(123,46,255,0.5),transparent_60%)] blur-3xl opacity-70 transition-opacity duration-700 group-hover:opacity-100" />
            <div className="absolute -inset-10 rounded-[2.5rem] bg-[radial-gradient(ellipse_at_center,rgba(0,245,255,0.35),transparent_65%)] blur-3xl opacity-60" />

            {/* Monitor frame */}
            <div className="relative monitor-frame holo-border rounded-[1.75rem]">
              {/* Top status bar */}
              <div className="relative z-10 flex items-center justify-between px-2 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00F5FF] animate-pulse-glow" />
                  radiante.live · qck
                </div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">HD</span>
              </div>

              {/* Screen */}
              <div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-black">
                <div className="relative aspect-video w-full">
                  <video
                    ref={videoRef}
                    src={heroVideo.url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    controlsList="nodownload"
                    preload="auto"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {/* Scanline */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F5FF]/60 to-transparent blur-[1px] animate-scan" />
                  {/* Mouse-follow highlight */}
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
                    style={{
                      background: useTransform(
                        [glowX, glowY],
                        ([x, y]) => `radial-gradient(400px circle at ${x} ${y}, rgba(255,255,255,0.35), transparent 55%)`
                      ),
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Floor reflection */}
            <div className="mx-auto mt-3 h-24 w-[85%] rounded-[100%] bg-[#7B2EFF]/50 blur-3xl opacity-70" />
            <div className="mx-auto -mt-16 h-16 w-[60%] rounded-[100%] bg-[#00F5FF]/40 blur-3xl opacity-50" />
          </motion.div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-14 flex flex-col items-center gap-4"
        >
          <button onClick={scrollToPlans} className="btn-hero">
            <Rocket className="h-5 w-5" />
            Quero Entrar no Projeto Radiante
          </button>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/40">
            <span className="h-px w-10 bg-white/20" />
            Garantia de 7 dias
            <span className="h-px w-10 bg-white/20" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
