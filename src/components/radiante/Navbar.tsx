import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const links = [
  { label: "Início", href: "#hero" },
  { label: "A Mudança", href: "#mudanca" },
  { label: "Planos", href: "#planos" },
  { label: "Resultados", href: "#resultados" },
  { label: "QCK", href: "#sobre" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div
          className={`flex items-center justify-between rounded-full px-5 py-3 transition-all duration-500 ${
            scrolled ? "glass-strong shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]" : "bg-transparent"
          }`}
        >
          <a href="#hero" className="flex items-center gap-2.5 group">
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-[#7B2EFF] via-[#6F4BFF] to-[#00F5FF] p-[1.5px] shadow-[0_0_20px_rgba(123,46,255,0.6)]">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0a0a0a] font-display text-sm font-bold">
                R
              </div>
            </div>
            <span className="font-display text-base font-semibold tracking-tight">
              Projeto <span className="text-gradient-brand">Radiante</span>
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative rounded-full px-3.5 py-1.5 text-sm text-white/70 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/auth" className="hidden rounded-full px-3.5 py-1.5 text-sm text-white/70 transition-colors hover:text-white md:inline-flex">
              Área de Membros
            </Link>
            <a href="#cta" className="btn-primary-radiante hidden text-sm md:inline-flex" style={{ padding: "0.6rem 1.25rem" }}>
              Entrar Agora
            </a>
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10"
              aria-label="Menu"
            >
              <div className="space-y-1.5">
                <span className="block h-0.5 w-5 bg-white" />
                <span className="block h-0.5 w-5 bg-white" />
              </div>
            </button>
          </div>
        </div>

        {open && (
          <div className="mt-2 rounded-2xl glass-strong p-4 md:hidden">
            <div className="flex flex-col gap-2">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                >
                  {l.label}
                </a>
              ))}
              <a href="#cta" onClick={() => setOpen(false)} className="btn-primary-radiante mt-2 text-sm">
                Entrar Agora
              </a>
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
}
