import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Settings = {
  id: string;
  project_name: string;
  logo_url: string | null;
  banner_url: string | null;
  support_email: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  twitter_url: string | null;
  tiktok_url: string | null;
  discord_url: string | null;
};

const FIELDS: { key: keyof Settings; label: string; placeholder?: string }[] = [
  { key: "project_name", label: "Nome do projeto" },
  { key: "support_email", label: "E-mail de suporte", placeholder: "suporte@..." },
  { key: "logo_url", label: "Logo (URL)" },
  { key: "banner_url", label: "Banner (URL)" },
  { key: "instagram_url", label: "Instagram" },
  { key: "youtube_url", label: "YouTube" },
  { key: "twitter_url", label: "X / Twitter" },
  { key: "tiktok_url", label: "TikTok" },
  { key: "discord_url", label: "Discord" },
];

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data as Settings | null;
    },
  });
}

export function SiteSettingsForm() {
  const qc = useQueryClient();
  const { data, isLoading } = useSiteSettings();
  const [values, setValues] = useState<Partial<Settings>>({});

  useEffect(() => {
    if (data) setValues(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!data?.id) throw new Error("Configurações não encontradas.");
      const { id: _id, ...rest } = values as Settings;
      const { error } = await supabase.from("site_settings").update(rest).eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Configurações salvas.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Não foi possível salvar."),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl glass-card py-16 text-white/50">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
      className="rounded-2xl glass-card p-4 sm:p-6"
    >
      <h2 className="font-display text-lg font-semibold">Configurações gerais</h2>
      <p className="mt-1 text-xs text-white/45">Identidade da marca, redes sociais e canal de suporte.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">{f.label}</span>
            <input
              value={(values[f.key] as string) ?? ""}
              placeholder={f.placeholder}
              onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none transition placeholder:text-white/25 focus:border-[#7B2EFF]/60"
            />
          </label>
        ))}
      </div>

      {(values.logo_url || values.banner_url) && (
        <div className="mt-6 flex flex-wrap items-center gap-6">
          {values.logo_url && <img src={values.logo_url} alt="Logo do projeto" className="h-12 w-auto rounded-lg" loading="lazy" />}
          {values.banner_url && <img src={values.banner_url} alt="Banner do projeto" className="h-20 w-auto rounded-lg" loading="lazy" />}
        </div>
      )}

      <button
        type="submit"
        disabled={save.isPending}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7B2EFF] to-[#00AEEF] px-5 py-2.5 text-sm font-semibold shadow-[0_0_30px_-8px_rgba(123,46,255,0.9)] transition hover:opacity-90 disabled:opacity-60"
      >
        {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Salvar configurações
      </button>
    </form>
  );
}
