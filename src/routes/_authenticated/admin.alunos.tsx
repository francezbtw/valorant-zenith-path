import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminShell";
import { CrudTable, type Field } from "@/components/admin/CrudTable";

const profileFields: Field[] = [
  { key: "full_name", label: "Nome" },
  { key: "email", label: "E-mail" },
  { key: "riot_id", label: "Riot ID" },
  { key: "current_rank", label: "Elo" },
];

const enrollmentFields: Field[] = [
  { key: "user_id", label: "Aluno (ID)", required: true },
  { key: "plan", label: "Plano", type: "select", options: [{ value: "basico", label: "Básico" }, { value: "intermediario", label: "Intermediário" }, { value: "mentoria", label: "Mentoria" }], defaultValue: "basico" },
  { key: "status", label: "Status", type: "select", options: [{ value: "active", label: "Ativa" }, { value: "canceled", label: "Cancelada" }], defaultValue: "active" },
  { key: "provider", label: "Provedor", hideInTable: true },
  { key: "expires_at", label: "Expira em", type: "datetime" },
];

export const Route = createFileRoute("/_authenticated/admin/alunos")({
  head: () => ({
    meta: [
      { title: "Alunos · Console Admin — Projeto Radiante" },
      { name: "description", content: "Gerencie os alunos e as matrículas do Projeto Radiante." },
      { property: "og:title", content: "Alunos — Console Admin" },
      { property: "og:description", content: "Perfis cadastrados e liberação de planos." },
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
      <AdminHeader title="Alunos" subtitle="Perfis cadastrados e liberação de planos." />
      <CrudTable table="profiles" title="Alunos" fields={profileFields} canCreate={false} canDelete={false} />
      <div className="mt-8">
        <h2 className="mb-4 font-display text-xl font-semibold">Matrículas</h2>
        <CrudTable table="enrollments" title="Matrículas" fields={enrollmentFields} />
      </div>
    </>
  );
}
