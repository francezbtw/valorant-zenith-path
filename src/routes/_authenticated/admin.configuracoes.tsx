import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminShell";
import { CrudTable, type Field } from "@/components/admin/CrudTable";

const fields: Field[] = [
  { key: "user_id", label: "Usuário (ID)", required: true },
  { key: "role", label: "Papel", type: "select", options: [{ value: "admin", label: "Administrador" }, { value: "moderator", label: "Moderador" }, { value: "user", label: "Aluno" }], defaultValue: "admin" },
];

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações · Console Admin — Projeto Radiante" },
      { name: "description", content: "Papéis de acesso e permissões administrativas." },
      { property: "og:title", content: "Configurações — Console Admin" },
      { property: "og:description", content: "Papéis de acesso e permissões administrativas." },
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
      <AdminHeader title="Configurações" subtitle="Papéis de acesso e permissões administrativas." />
      <CrudTable table="user_roles" title="Configurações" fields={fields} orderBy={"created_at"} />
    </>
  );
}
