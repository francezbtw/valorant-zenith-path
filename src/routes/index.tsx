import { createFileRoute } from "@tanstack/react-router";
import { AnimatedBackground } from "@/components/radiante/Background";
import { Navbar } from "@/components/radiante/Navbar";
import { Hero } from "@/components/radiante/Hero";
import {
  ProblemsSection, HowItWorks, LearnSection, ResultsSection,
  PerksSection, AboutSection, VideosSection, TestimonialsSection,
  FaqSection, FinalCta, Footer,
} from "@/components/radiante/Sections";
import { SmoothScroll } from "@/components/radiante/SmoothScroll";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Projeto Radiante — Mentoria + Curso de Valorant" },
      { name: "description", content: "Método premium de mentoria e curso para jogadores de Valorant que querem sair do platô e chegar ao Radiante." },
      { property: "og:title", content: "Projeto Radiante — Mentoria + Curso de Valorant" },
      { property: "og:description", content: "Aprenda como jogadores Radiantes pensam, treinam e vencem. Mentoria 1:1, curso completo e comunidade exclusiva." },
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
        <ProblemsSection />
        <HowItWorks />
        <LearnSection />
        <ResultsSection />
        <PerksSection />
        <AboutSection />
        <VideosSection />
        <TestimonialsSection />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
