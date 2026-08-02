import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminShell";
import { CrudTable, type Field } from "@/components/admin/CrudTable";

const postFields: Field[] = [
  { key: "kind", label: "Tipo", type: "select", options: [{ value: "post", label: "Post" }, { value: "achievement", label: "Conquista" }, { value: "evolution", label: "Evolução" }, { value: "certificate", label: "Certificado" }], defaultValue: "post" },
  { key: "body", label: "Conteúdo", type: "textarea", required: true },
  { key: "user_id", label: "Autor (ID)", hideInTable: true },
  { key: "image_url", label: "Imagem (URL)", hideInTable: true },
  { key: "created_at", label: "Publicado em", type: "datetime", hideInForm: true },
];

const commentFields: Field[] = [
  { key: "body", label: "Comentário", type: "textarea", required: true },
  { key: "post_id", label: "Post (ID)", hideInTable: true },
  { key: "user_id", label: "Autor (ID)", hideInTable: true },
  { key: "created_at", label: "Enviado em", type: "datetime", hideInForm: true },
];

export const Route = createFileRoute("/_authenticated/admin/comunidade")({
  head: () => ({
    meta: [
      { title: "Comunidade · Console Admin — Projeto Radiante" },
      { name: "description", content: "Modere publicações e comentários da comunidade do Projeto Radiante." },
      { property: "og:title", content: "Comunidade — Console Admin" },
      { property: "og:description", content: "Modere publicações e comentários dos alunos." },
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
      <AdminHeader title="Comunidade" subtitle="Modere publicações e comentários dos alunos." />
      <CrudTable table="community_posts" title="Publicações" fields={postFields} canCreate={false} />
      <div className="mt-8">
        <h2 className="mb-4 font-display text-xl font-semibold">Comentários</h2>
        <CrudTable table="post_comments" title="Comentários" fields={commentFields} canCreate={false} />
      </div>
    </>
  );
}
