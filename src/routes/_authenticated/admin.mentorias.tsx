import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminShell";
import { CrudTable, type Field } from "@/components/admin/CrudTable";

const fields: Field[] = [
  { key: "title", label: "Título", required: true },
  { key: "user_id", label: "Aluno (ID)", required: true },
  { key: "mentor_name", label: "Mentor", defaultValue: "QCK" },
  { key: "scheduled_at", label: "Agendada para", type: "datetime" },
  { key: "duration_minutes", label: "Duração (min)", type: "number", defaultValue: 60 },
  { key: "status", label: "Status", type: "select", options: [{ value: "scheduled", label: "Agendada" }, { value: "done", label: "Concluída" }, { value: "canceled", label: "Cancelada" }], defaultValue: "scheduled" },
  { key: "meeting_url", label: "Link da reunião", hideInTable: true },
  { key: "notes", label: "Notas", type: "textarea", hideInTable: true },
];

export const Route = createFileRoute("/_authenticated/admin/mentorias")({
  head: () => ({
    meta: [
      { title: "Mentorias · Console Admin — Projeto Radiante" },
      { name: "description", content: "Agende e acompanhe sessões 1:1." },
      { property: "og:title", content: "Mentorias — Console Admin" },
      { property: "og:description", content: "Agende e acompanhe sessões 1:1." },
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
      <AdminHeader title="Mentorias" subtitle="Agende e acompanhe sessões 1:1." />
      <CrudTable table="mentorships" title="Mentorias" fields={fields} orderBy={"created_at"} />
    </>
  );
}
