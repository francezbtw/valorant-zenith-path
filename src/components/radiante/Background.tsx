export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute inset-0 bg-grid opacity-60" />
      {/* Orbs */}
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#7B2EFF] opacity-20 blur-[140px] animate-float-slow" />
      <div className="absolute top-1/3 -right-40 h-[700px] w-[700px] rounded-full bg-[#00AEEF] opacity-15 blur-[160px] animate-float-slower" />
      <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-[#6F4BFF] opacity-15 blur-[140px] animate-float-slow" />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050505_85%)]" />
      {/* Noise */}
      <div className="absolute inset-0 opacity-[0.035] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }} />
    </div>
  );
}

/** Deterministic pseudo-random so SSR and client render identical particles. */
function rand(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export function Particles() {
  const particles = Array.from({ length: 24 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((_, i) => {
        const size = Number((rand(i + 1) * 3 + 1).toFixed(3));
        const left = Number((rand(i + 11) * 100).toFixed(3));
        const top = Number((rand(i + 23) * 100).toFixed(3));
        const delay = Number((rand(i + 37) * 6).toFixed(3));
        const dur = Number((8 + rand(i + 53) * 10).toFixed(3));
        const color = i % 3 === 0 ? "#00F5FF" : "#7B2EFF";

        return (
          <span
            key={i}
            className="absolute rounded-full animate-pulse-glow"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              top: `${top}%`,
              background: color,
              boxShadow: `0 0 ${size * 4}px ${color}`,
              animationDelay: `${delay}s`,
              animationDuration: `${dur}s`,
            }}
          />
        );
      })}
    </div>
  );
}
