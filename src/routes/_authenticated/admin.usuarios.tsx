import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminShell";
import { CrudTable, type Field } from "@/components/admin/CrudTable";
import { RolesManager } from "@/components/admin/RolesManager";

const profileFields: Field[] = [
  { key: "full_name", label: "Nome" },
  { key: "email", label: "E-mail" },
  { key: "riot_id", label: "Riot ID" },
  { key: "current_rank", label: "Elo" },
  { key: "avatar_url", label: "Avatar (URL)", hideInTable: true },
];

const roleFields: Field[] = [
  { key: "user_id", label: "Usuário (ID)", required: true },
  {
    key: "role",
    label: "Papel",
    type: "select",
    options: [
      { value: "admin", label: "Administrador" },
      { value: "moderator", label: "Moderador" },
      { value: "user", label: "Aluno" },
    ],
    defaultValue: "user",
  },
];

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuários · Console Admin — Projeto Radiante" },
      { name: "description", content: "Gerencie usuários, dados de perfil e papéis de acesso da plataforma." },
      { property: "og:title", content: "Usuários — Console Admin" },
      { property: "og:description", content: "Gerencie usuários e papéis de acesso." },
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
      <AdminHeader title="Usuários" subtitle="Perfis da plataforma e papéis de acesso." />
      <CrudTable table="profiles" title="Usuários" fields={profileFields} canCreate={false} orderBy="created_at" />
      <div className="mt-8">
        <h2 className="mb-4 font-display text-xl font-semibold">Papéis de acesso</h2>
        <CrudTable table="user_roles" title="Papéis" fields={roleFields} orderBy="created_at" />
      </div>
    </>
  );
}
