import { createFileRoute } from "@tanstack/react-router";
import { AnimatedBackground } from "@/components/radiante/Background";
import { Navbar } from "@/components/radiante/Navbar";
import { Hero } from "@/components/radiante/Hero";
import {
  PlansSection, ResultsSection, AboutSection, TestimonialsSection,
  FaqSection, FinalCta, Footer,
} from "@/components/radiante/Sections";
import { SmoothScroll } from "@/components/radiante/SmoothScroll";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Projeto Radiante — Mentoria e Curso de Valorant com QCK" },
      { name: "description", content: "O caminho para jogar como um verdadeiro Radiante começa na forma como você pensa o jogo. Mentoria, curso e comunidade com QCK." },
      { property: "og:title", content: "Projeto Radiante — Mentoria e Curso de Valorant" },
      { property: "og:description", content: "Aprenda com QCK como Radiantes pensam, treinam e vencem. Método completo com mentoria 1:1, curso avançado e comunidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <SmoothScroll />
      <AnimatedBackground />
      <Navbar />
      <main className="relative">
        <Hero />
        <ResultsSection />
        <AboutSection />
        <PlansSection />
        <TestimonialsSection />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
