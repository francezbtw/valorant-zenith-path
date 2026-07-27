import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminShell";
import { CrudTable, type Field } from "@/components/admin/CrudTable";

const fields: Field[] = [
  { key: "code", label: "Código", required: true },
  { key: "discount_type", label: "Tipo", type: "select", options: [{ value: "percent", label: "Percentual" }, { value: "fixed", label: "Valor fixo" }], defaultValue: "percent" },
  { key: "discount_value", label: "Valor", type: "number" },
  { key: "max_uses", label: "Usos máximos", type: "number" },
  { key: "uses", label: "Usos", type: "number", hideInForm: true },
  { key: "expires_at", label: "Expira em", type: "datetime" },
  { key: "active", label: "Ativo", type: "boolean", defaultValue: true },
];

export const Route = createFileRoute("/_authenticated/admin/cupons")({
  head: () => ({
    meta: [
      { title: "Cupons · Console Admin — Projeto Radiante" },
      { name: "description", content: "Descontos e campanhas promocionais." },
      { property: "og:title", content: "Cupons — Console Admin" },
      { property: "og:description", content: "Descontos e campanhas promocionais." },
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
      <AdminHeader title="Cupons" subtitle="Descontos e campanhas promocionais." />
      <CrudTable table="coupons" title="Cupons" fields={fields} orderBy={"created_at"} />
    </>
  );
}
