import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminShell";
import { CrudTable, type Field } from "@/components/admin/CrudTable";
import { ReorderList } from "@/components/admin/ReorderList";

const fields: Field[] = [
  { key: "title", label: "Título", required: true },
  { key: "slug", label: "Slug", required: true },
  { key: "description", label: "Descrição", type: "textarea", hideInTable: true },
  { key: "course_id", label: "ID do curso", hideInTable: true },
  { key: "tier", label: "Plano mínimo", type: "select", options: [{ value: "basico", label: "Básico" }, { value: "intermediario", label: "Intermediário" }, { value: "mentoria", label: "Mentoria" }], defaultValue: "basico" },
  { key: "cover_color", label: "Cor", hideInTable: true, defaultValue: "#7B2EFF" },
  { key: "position", label: "Posição", type: "number" },
  { key: "published", label: "Publicado", type: "boolean", defaultValue: true },
];

export const Route = createFileRoute("/_authenticated/admin/modulos")({
  head: () => ({
    meta: [
      { title: "Módulos · Console Admin — Projeto Radiante" },
      { name: "description", content: "Organize os módulos de cada curso." },
      { property: "og:title", content: "Módulos — Console Admin" },
      { property: "og:description", content: "Organize os módulos de cada curso." },
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
      <AdminHeader title="Módulos" subtitle="Organize os módulos de cada curso." />
      <ReorderList table="modules" parentKey="course_id" label="Ordem dos módulos" />
      <CrudTable table="modules" title="Módulos" fields={fields} orderBy={"position"} />
    </>
  );
}
