import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminShell";
import { CrudTable, type Field } from "@/components/admin/CrudTable";
import { LessonMediaManager } from "@/components/admin/LessonMedia";
import { ReorderList } from "@/components/admin/ReorderList";

const fields: Field[] = [
  { key: "title", label: "Título", required: true },
  { key: "slug", label: "Slug", required: true },
  { key: "module_id", label: "ID do módulo", required: true },
  { key: "description", label: "Descrição", type: "textarea", hideInTable: true },
  { key: "thumbnail_url", label: "Thumbnail (URL)", hideInTable: true },
  { key: "video_url", label: "Vídeo (URL externa)", hideInTable: true },
  { key: "video_path", label: "Vídeo (arquivo enviado)", type: "readonly", hideInTable: true },
  { key: "duration_seconds", label: "Tempo (s)", type: "number" },
  { key: "min_tier", label: "Liberar a partir do plano", type: "select", options: [{ value: "basico", label: "Básico" }, { value: "intermediario", label: "Intermediário" }, { value: "mentoria", label: "Mentoria" }] },
  { key: "release_at", label: "Liberar em (data)", type: "datetime" },
  { key: "materials", label: "Materiais / PDFs (JSON)", type: "json", hideInTable: true, defaultValue: "[]" },
  { key: "exercises", label: "Exercícios (JSON)", type: "json", hideInTable: true, defaultValue: "[]" },
  { key: "position", label: "Ordem", type: "number" },
  { key: "published", label: "Publicado", type: "boolean", defaultValue: true },
];


export const Route = createFileRoute("/_authenticated/admin/aulas")({
  head: () => ({
    meta: [
      { title: "Aulas · Console Admin — Projeto Radiante" },
      { name: "description", content: "Gerencie vídeos, materiais e ordem das aulas." },
      { property: "og:title", content: "Aulas — Console Admin" },
      { property: "og:description", content: "Gerencie vídeos, materiais e ordem das aulas." },
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
      <AdminHeader title="Aulas" subtitle="Gerencie vídeos, materiais, liberação por plano/data e ordem das aulas." />
      <LessonMediaManager />
      <ReorderList table="lessons" parentKey="module_id" label="Ordem das aulas" />
      <CrudTable table="lessons" title="Aulas" fields={fields} orderBy={"position"} />
    </>
  );
}
