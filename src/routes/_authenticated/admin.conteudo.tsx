import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminShell";
import { CrudTable, type Field } from "@/components/admin/CrudTable";

const fields: Field[] = [
  { key: "title", label: "Título", required: true },
  { key: "body", label: "Texto", type: "textarea", hideInTable: true, required: true },
  { key: "min_tier", label: "Plano mínimo", type: "select", options: [{ value: "basico", label: "Básico" }, { value: "intermediario", label: "Intermediário" }, { value: "mentoria", label: "Mentoria" }], defaultValue: "basico" },
  { key: "published", label: "Publicado", type: "boolean", defaultValue: true },
];

export const Route = createFileRoute("/_authenticated/admin/conteudo")({
  head: () => ({
    meta: [
      { title: "Conteúdo · Console Admin — Projeto Radiante" },
      { name: "description", content: "Avisos e comunicados exibidos aos alunos." },
      { property: "og:title", content: "Conteúdo — Console Admin" },
      { property: "og:description", content: "Avisos e comunicados exibidos aos alunos." },
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
      <AdminHeader title="Conteúdo" subtitle="Avisos e comunicados exibidos aos alunos." />
      <CrudTable table="announcements" title="Conteúdo" fields={fields} orderBy={"created_at"} />
    </>
  );
}
