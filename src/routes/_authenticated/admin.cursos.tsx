import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminShell";
import { CrudTable, type Field } from "@/components/admin/CrudTable";

const fields: Field[] = [
  { key: "title", label: "Título", required: true },
  { key: "slug", label: "Slug", required: true },
  { key: "description", label: "Descrição", type: "textarea", hideInTable: true },
  { key: "cover_url", label: "Capa (URL)", hideInTable: true },
  { key: "min_tier", label: "Plano mínimo", type: "select", options: [{ value: "basico", label: "Básico" }, { value: "intermediario", label: "Intermediário" }, { value: "mentoria", label: "Mentoria" }], defaultValue: "basico" },
  { key: "position", label: "Posição", type: "number" },
  { key: "published", label: "Publicado", type: "boolean", defaultValue: true },
];

export const Route = createFileRoute("/_authenticated/admin/cursos")({
  head: () => ({
    meta: [
      { title: "Cursos · Console Admin — Projeto Radiante" },
      { name: "description", content: "Crie e edite os cursos da plataforma." },
      { property: "og:title", content: "Cursos — Console Admin" },
      { property: "og:description", content: "Crie e edite os cursos da plataforma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <AdminHeader title="Cursos" subtitle="Crie e edite os cursos da plataforma." />
      <CrudTable table="courses" title="Cursos" fields={fields} orderBy={"position"} />
    </>
  );
}
