import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Film, Loader2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Material = { name: string; path?: string; url?: string; bucket?: string };
type LessonRow = {
  id: string;
  title: string;
  slug: string;
  video_path: string | null;
  video_url: string | null;
  materials: Material[] | null;
};

function slugifyFile(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.\-_]+/g, "-")
    .toLowerCase();
}

export function LessonMediaManager() {
  const qc = useQueryClient();
  const [lessonId, setLessonId] = useState<string>("");
  const [busy, setBusy] = useState<null | "video" | "pdf">(null);
  const [pct, setPct] = useState(0);
  const videoInput = useRef<HTMLInputElement>(null);
  const pdfInput = useRef<HTMLInputElement>(null);

  const { data: lessons = [] } = useQuery({
    queryKey: ["admin-lesson-media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, slug, video_path, video_url, materials")
        .order("position");
      if (error) throw error;
      return (data ?? []) as unknown as LessonRow[];
    },
  });

  const lesson = useMemo(() => lessons.find((l) => l.id === lessonId), [lessons, lessonId]);
  const materials = (lesson?.materials ?? []) as Material[];

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-lesson-media"] });
    await qc.invalidateQueries({ queryKey: ["lessons"] });
    await qc.invalidateQueries({ queryKey: ["admin", "lessons"] });
  }

  async function uploadVideo(file: File) {
    if (!lesson) return;
    setBusy("video");
    setPct(0);
    try {
      const path = `${lesson.slug}/${Date.now()}-${slugifyFile(file.name)}`;
      const { error } = await supabase.storage.from("course-videos").upload(path, file, {
        contentType: file.type || "video/mp4",
        upsert: false,
      });
      if (error) throw error;
      if (lesson.video_path) await supabase.storage.from("course-videos").remove([lesson.video_path]);
      const { error: upErr } = await supabase.from("lessons").update({ video_path: path }).eq("id", lesson.id);
      if (upErr) throw upErr;
      await refresh();
      toast.success("Vídeo enviado e vinculado à aula.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no envio do vídeo.");
    } finally {
      setBusy(null);
      setPct(0);
      if (videoInput.current) videoInput.current.value = "";
    }
  }

  async function uploadPdf(file: File) {
    if (!lesson) return;
    setBusy("pdf");
    try {
      const path = `${lesson.slug}/${Date.now()}-${slugifyFile(file.name)}`;
      const { error } = await supabase.storage.from("course-materials").upload(path, file, {
        contentType: file.type || "application/pdf",
        upsert: false,
      });
      if (error) throw error;
      const next: Material[] = [...materials, { name: file.name, path, bucket: "course-materials" }];
      const { error: upErr } = await supabase.from("lessons").update({ materials: next }).eq("id", lesson.id);
      if (upErr) throw upErr;
      await refresh();
      toast.success("Material adicionado.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no envio do material.");
    } finally {
      setBusy(null);
      if (pdfInput.current) pdfInput.current.value = "";
    }
  }

  async function removeMaterial(index: number) {
    if (!lesson) return;
    const target = materials[index];
    try {
      if (target.path) await supabase.storage.from(target.bucket ?? "course-materials").remove([target.path]);
      const next = materials.filter((_, i) => i !== index);
      const { error } = await supabase.from("lessons").update({ materials: next }).eq("id", lesson.id);
      if (error) throw error;
      await refresh();
      toast.success("Material removido.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao remover.");
    }
  }

  async function removeVideo() {
    if (!lesson?.video_path) return;
    try {
      await supabase.storage.from("course-videos").remove([lesson.video_path]);
      const { error } = await supabase.from("lessons").update({ video_path: null }).eq("id", lesson.id);
      if (error) throw error;
      await refresh();
      toast.success("Vídeo removido.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao remover o vídeo.");
    }
  }

  return (
    <section className="mb-8 rounded-3xl glass-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Mídia da aula</div>
          <h2 className="mt-1 font-display text-lg font-bold">Upload de vídeos e materiais</h2>
          <p className="mt-1 text-xs text-white/45">
            Arquivos ficam em armazenamento privado; alunos recebem links assinados temporários conforme o plano.
          </p>
        </div>
        <select
          value={lessonId}
          onChange={(e) => setLessonId(e.target.value)}
          className="min-w-[240px] rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-[#00F5FF]/50"
        >
          <option value="">Selecione uma aula…</option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id} className="bg-[#111]">
              {l.title}
            </option>
          ))}
        </select>
      </div>

      {lesson && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Film className="h-4 w-4 text-[#7B2EFF]" /> Vídeo da aula
            </div>
            <div className="mt-3 truncate text-xs text-white/45">
              {lesson.video_path ?? lesson.video_url ?? "Nenhum vídeo vinculado."}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => videoInput.current?.click()}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2.5 text-xs transition hover:bg-white/10 disabled:opacity-50"
              >
                {busy === "video" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                {busy === "video" ? `Enviando… ${pct || ""}` : "Enviar vídeo (MP4)"}
              </button>
              {lesson.video_path && (
                <button onClick={removeVideo} className="inline-flex items-center gap-2 rounded-full border border-red-500/25 px-4 py-2.5 text-xs text-red-300 transition hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" /> Remover
                </button>
              )}
            </div>
            <input ref={videoInput} type="file" accept="video/mp4,video/webm,video/quicktime" hidden
              onChange={(e) => e.target.files?.[0] && uploadVideo(e.target.files[0])} />
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-[#00AEEF]" /> Materiais (PDF)
            </div>
            <div className="mt-3 space-y-2">
              {materials.length === 0 && <div className="text-xs text-white/45">Nenhum material anexado.</div>}
              {materials.map((m, i) => (
                <div key={`${m.name}-${i}`} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-xs">
                  <FileText className="h-3.5 w-3.5 text-white/45" />
                  <span className="flex-1 truncate">{m.name}</span>
                  <button onClick={() => removeMaterial(i)} className="text-red-300/70 transition hover:text-red-300">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => pdfInput.current?.click()}
              disabled={busy !== null}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2.5 text-xs transition hover:bg-white/10 disabled:opacity-50"
            >
              {busy === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              Enviar PDF
            </button>
            <input ref={pdfInput} type="file" accept="application/pdf" hidden
              onChange={(e) => e.target.files?.[0] && uploadPdf(e.target.files[0])} />
          </div>
        </div>
      )}
    </section>
  );
}
