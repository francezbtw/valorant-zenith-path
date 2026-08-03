export type MentorshipStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "scheduled"
  | "done"
  | "canceled";

export const MENTORSHIP_STATUS: Record<MentorshipStatus, { label: string; accent: string }> = {
  requested: { label: "Pendente", accent: "#E8C05A" },
  approved: { label: "Aprovada", accent: "#6F4BFF" },
  scheduled: { label: "Agendada", accent: "#00AEEF" },
  done: { label: "Concluída", accent: "#3BD16F" },
  rejected: { label: "Rejeitada", accent: "#FF4655" },
  canceled: { label: "Cancelada", accent: "#8A8A8A" },
};

export const MENTORSHIP_STATUS_ORDER: MentorshipStatus[] = [
  "requested",
  "approved",
  "scheduled",
  "done",
  "rejected",
  "canceled",
];

export type Attachment = {
  name: string;
  path: string;
  type: "image" | "pdf" | "video" | "file";
  size?: number;
};

export function attachmentKind(mime: string, name: string): Attachment["type"] {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf" || name.toLowerCase().endsWith(".pdf")) return "pdf";
  return "file";
}

export const MENTORSHIP_BUCKET = "mentorship-files";

export function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
