import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const VIDEO_BUCKET = "course-videos";
const MATERIAL_BUCKET = "course-materials";
const SIGNED_TTL = 60 * 60 * 4; // 4h

type MaterialRef = { name: string; url?: string; path?: string; bucket?: string };

/**
 * Returns playable/downloadable signed URLs for a lesson.
 * Access is enforced by RLS: the lesson row is read with the caller's own
 * client, so a student without the required plan simply gets no row.
 */
export const getLessonMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { lessonId: string }) => {
    if (!input?.lessonId || typeof input.lessonId !== "string") {
      throw new Error("lessonId inválido");
    }
    return { lessonId: input.lessonId };
  })
  .handler(async ({ data, context }) => {
    const { data: lesson, error } = await context.supabase
      .from("lessons")
      .select("id, video_url, video_path, materials")
      .eq("id", data.lessonId)
      .maybeSingle();

    if (error) throw error;
    if (!lesson) throw new Error("Aula indisponível no seu plano.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let videoUrl: string | null = lesson.video_url ?? null;
    if (lesson.video_path) {
      const signed = await supabaseAdmin.storage
        .from(VIDEO_BUCKET)
        .createSignedUrl(lesson.video_path, SIGNED_TTL);
      if (signed.data?.signedUrl) videoUrl = signed.data.signedUrl;
    }

    const rawMaterials = (Array.isArray(lesson.materials) ? lesson.materials : []) as MaterialRef[];
    const materials = await Promise.all(
      rawMaterials.map(async (m) => {
        if (m.path) {
          const signed = await supabaseAdmin.storage
            .from(m.bucket ?? MATERIAL_BUCKET)
            .createSignedUrl(m.path, SIGNED_TTL, { download: m.name });
          return { name: m.name, url: signed.data?.signedUrl ?? null };
        }
        return { name: m.name, url: m.url ?? null };
      }),
    );

    return { videoUrl, materials: materials.filter((m) => m.url) as { name: string; url: string }[] };
  });
