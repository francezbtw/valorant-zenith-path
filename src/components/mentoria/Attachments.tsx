import { FileText, ImageIcon, Video, Paperclip, Download } from "lucide-react";
import { useAttachmentUrls } from "@/hooks/use-mentorship";
import type { Attachment } from "@/lib/mentorship";
import { Skeleton } from "@/components/ui/skeleton";

const ICON = { image: ImageIcon, pdf: FileText, video: Video, file: Paperclip } as const;

export function AttachmentGrid({ attachments }: { attachments: Attachment[] }) {
  const { data, isLoading } = useAttachmentUrls(attachments);

  if (!attachments.length) return null;
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {attachments.map((a) => (
          <Skeleton key={a.path} className="h-28 w-full rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {(data ?? []).map((a) => {
        const Icon = ICON[a.type] ?? Paperclip;
        return (
          <div
            key={a.path}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-white/25"
          >
            {a.type === "image" && a.url && (
              <img src={a.url} alt={a.name} loading="lazy" className="h-40 w-full object-cover" />
            )}
            {a.type === "video" && a.url && (
              <video src={a.url} controls className="h-40 w-full bg-black object-contain" />
            )}
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-[#00F5FF]" />
                <span className="truncate text-sm text-white/70">{a.name}</span>
              </div>
              {a.url && (
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                  aria-label={`Abrir ${a.name}`}
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
