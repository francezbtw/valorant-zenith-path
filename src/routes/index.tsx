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
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Course",
          name: "Projeto Radiante",
          description:
            "Mentoria e curso de Valorant com QCK: mentalidade, leitura de jogo, treino estruturado e evolução de elo.",
          inLanguage: "pt-BR",
          provider: {
            "@type": "Organization",
            name: "Projeto Radiante",
            url: "https://valorant-zenith-path.lovable.app/",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            ["Preciso ter algum elo mínimo para entrar?", "Não. O método funciona de Ferro a Imortal. O conteúdo é organizado por nível."],
            ["Quanto tempo por dia preciso dedicar?", "A partir de 1h/dia com o plano de treino você já sente evolução consistente."],
            ["Qual a diferença entre o Intermediário e a Mentoria?", "A Mentoria inclui sessões ao vivo com o QCK, análise individual de VOD e um plano de evolução personalizado."],
            ["Tenho acesso vitalício?", "Sim. Uma vez dentro, acesso vitalício ao curso, comunidade e atualizações."],
            ["Existe garantia?", "7 dias de garantia incondicional. Se não gostar, devolvemos 100% do valor."],
          ].map(([q, a]) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }),
      },
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
