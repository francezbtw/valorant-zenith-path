import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminShell";
import { CrudTable, type Field } from "@/components/admin/CrudTable";

const fields: Field[] = [
  { key: "user_id", label: "Aluno (ID)", required: true },
  { key: "plan", label: "Plano", type: "select", options: [{ value: "basico", label: "Básico" }, { value: "intermediario", label: "Intermediário" }, { value: "mentoria", label: "Mentoria" }] },
  { key: "amount_cents", label: "Valor (centavos)", type: "number" },
  { key: "status", label: "Status", type: "select", options: [{ value: "pending", label: "Pendente" }, { value: "paid", label: "Pago" }, { value: "refunded", label: "Reembolsado" }, { value: "failed", label: "Falhou" }], defaultValue: "pending" },
  { key: "provider", label: "Provedor", hideInTable: true },
  { key: "provider_ref", label: "Referência", hideInTable: true },
  { key: "paid_at", label: "Pago em", type: "datetime" },
];

export const Route = createFileRoute("/_authenticated/admin/pagamentos")({
  head: () => ({
    meta: [
      { title: "Pagamentos · Console Admin — Projeto Radiante" },
      { name: "description", content: "Histórico de cobranças e status." },
      { property: "og:title", content: "Pagamentos — Console Admin" },
      { property: "og:description", content: "Histórico de cobranças e status." },
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
      <AdminHeader title="Pagamentos" subtitle="Histórico de cobranças e status." />
      <CrudTable table="payments" title="Pagamentos" fields={fields} orderBy={"created_at"} />
    </>
  );
}
