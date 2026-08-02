import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminShell";
import { CrudTable, type Field } from "@/components/admin/CrudTable";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";

const roleFields: Field[] = [
  { key: "user_id", label: "Usuário (ID)", required: true },
  { key: "role", label: "Papel", type: "select", options: [{ value: "admin", label: "Administrador" }, { value: "moderator", label: "Moderador" }, { value: "user", label: "Aluno" }], defaultValue: "admin" },
];

const planFields: Field[] = [
  { key: "name", label: "Plano", required: true },
  { key: "tier", label: "Tier", type: "select", options: [{ value: "basico", label: "Básico" }, { value: "intermediario", label: "Intermediário" }, { value: "mentoria", label: "Mentoria" }] },
  { key: "price_cents", label: "Preço (centavos)", type: "number" },
  { key: "active", label: "Ativo", type: "boolean", defaultValue: true },
];

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações · Console Admin — Projeto Radiante" },
      { name: "description", content: "Identidade do projeto, redes sociais, valores dos planos e permissões." },
      { property: "og:title", content: "Configurações — Console Admin" },
      { property: "og:description", content: "Identidade do projeto, redes sociais, valores e permissões." },
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
      <AdminHeader title="Configurações" subtitle="Identidade do projeto, redes sociais, valores dos planos e permissões." />
      <SiteSettingsForm />
      <div className="mt-8">
        <h2 className="mb-4 font-display text-xl font-semibold">Valores dos planos</h2>
        <CrudTable table="plans" title="Planos" fields={planFields} orderBy="position" ascending canCreate={false} canDelete={false} />
      </div>
      <div className="mt-8">
        <h2 className="mb-4 font-display text-xl font-semibold">Permissões</h2>
        <CrudTable table="user_roles" title="Permissões" fields={roleFields} orderBy="created_at" />
      </div>
    </>
  );
}
