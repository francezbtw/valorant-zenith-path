import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminShell";
import { CrudTable, type Field } from "@/components/admin/CrudTable";

const fields: Field[] = [
  { key: "name", label: "Nome", required: true },
  { key: "slug", label: "Slug", required: true },
  { key: "tier", label: "Tier", type: "select", options: [{ value: "basico", label: "Básico" }, { value: "intermediario", label: "Intermediário" }, { value: "mentoria", label: "Mentoria" }], defaultValue: "basico" },
  { key: "tagline", label: "Chamada", hideInTable: true },
  { key: "description", label: "Descrição", type: "textarea", hideInTable: true },
  { key: "price_cents", label: "Preço (centavos)", type: "number" },
  { key: "promo_price_cents", label: "Preço promocional (centavos)", type: "number", hideInTable: true },
  { key: "promo_ends_at", label: "Promoção até", type: "datetime", hideInTable: true },
  { key: "seats_limit", label: "Vagas (limite)", type: "number" },
  { key: "seats_taken", label: "Vagas ocupadas", type: "number", hideInForm: true },
  { key: "enrollment_opens_at", label: "Inscrições abrem em", type: "datetime", hideInTable: true },
  { key: "enrollment_closes_at", label: "Inscrições fecham em", type: "datetime", hideInTable: true },
  { key: "features", label: "Benefícios (JSON)", type: "json", hideInTable: true, defaultValue: "[]" },
  { key: "checkout_url", label: "Checkout (URL)", hideInTable: true },
  { key: "highlight", label: "Destaque", type: "boolean" },
  { key: "active", label: "Ativo", type: "boolean", defaultValue: true },
  { key: "position", label: "Posição", type: "number" },
];

export const Route = createFileRoute("/_authenticated/admin/planos")({
  head: () => ({
    meta: [
      { title: "Planos · Console Admin — Projeto Radiante" },
      { name: "description", content: "Preços, benefícios e destaque dos planos." },
      { property: "og:title", content: "Planos — Console Admin" },
      { property: "og:description", content: "Preços, benefícios e destaque dos planos." },
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
      <AdminHeader title="Planos" subtitle="Preços, benefícios e destaque dos planos." />
      <CrudTable table="plans" title="Planos" fields={fields} orderBy={"position"} />
    </>
  );
}
