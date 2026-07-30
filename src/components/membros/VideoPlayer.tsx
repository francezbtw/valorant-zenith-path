import { useCallback, useEffect, useRef, useState } from "react";
import {
  Maximize2, Minimize2, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX, Loader2,
} from "lucide-react";

function fmt(t: number) {
  if (!Number.isFinite(t)) return "0:00";
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

export function VideoPlayer({
  src,
  poster,
  startAt = 0,
  onProgress,
  onCompleted,
}: {
  src: string | null;
  poster?: string;
  startAt?: number;
  /** called ~every 5s with the current position */
  onProgress?: (seconds: number, ratio: number) => void;
  /** called once when the student watches ≥ 92% */
  onCompleted?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lastSaved = useRef(0);
  const completedRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [showUi, setShowUi] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nudgeUi = useCallback(() => {
    setShowUi(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowUi(false), 2600);
  }, []);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  }, []);

  const seekBy = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(v.currentTime + delta, 0), v.duration || 0);
    nudgeUi();
  }, [nudgeUi]);

  useEffect(() => {
    completedRef.current = false;
    lastSaved.current = 0;
  }, [src]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!wrapRef.current?.contains(document.activeElement) && document.activeElement !== document.body) return;
      if (e.key === " " || e.key === "k") { e.preventDefault(); toggle(); }
      else if (e.key === "ArrowRight") seekBy(10);
      else if (e.key === "ArrowLeft") seekBy(-10);
      else if (e.key === "f") void toggleFullscreen();
      else if (e.key === "m") setMuted((m) => !m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, seekBy]);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  async function toggleFullscreen() {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await wrapRef.current?.requestFullscreen?.();
  }

  const handleTime = () => {
    const v = videoRef.current;
    if (!v) return;
    setTime(v.currentTime);
    const ratio = v.duration ? v.currentTime / v.duration : 0;
    if (v.currentTime - lastSaved.current >= 5) {
      lastSaved.current = v.currentTime;
      onProgress?.(Math.floor(v.currentTime), ratio);
    }
    if (!completedRef.current && ratio >= 0.92) {
      completedRef.current = true;
      onCompleted?.();
    }
  };

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      onMouseMove={nudgeUi}
      onMouseLeave={() => playing && setShowUi(false)}
      className="group relative w-full overflow-hidden rounded-[1.1rem] border border-white/10 bg-black outline-none"
    >
      <div className="aspect-video w-full">
        {src ? (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            playsInline
            preload="metadata"
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            className="h-full w-full"
            onClick={toggle}
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              setDuration(v.duration);
              if (startAt > 0 && startAt < v.duration - 15) v.currentTime = startAt;
            }}
            onPlay={() => { setPlaying(true); nudgeUi(); }}
            onPause={() => { setPlaying(false); setShowUi(true); }}
            onWaiting={() => setWaiting(true)}
            onPlaying={() => setWaiting(false)}
            onTimeUpdate={handleTime}
            onEnded={() => { setPlaying(false); onCompleted?.(); }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-white/40">
            Vídeo em processamento
          </div>
        )}
      </div>

      {waiting && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <Loader2 className="h-9 w-9 animate-spin text-white/70" />
        </div>
      )}

      {src && !playing && (
        <button
          onClick={toggle}
          aria-label="Reproduzir"
          className="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/60 via-black/10 to-transparent"
        >
          <span className="grid h-20 w-20 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur-xl transition hover:scale-105 hover:border-[#00F5FF]/60"
            style={{ boxShadow: "0 0 60px rgba(123,46,255,0.45)" }}>
            <Play className="ml-1 h-8 w-8 text-white" />
          </span>
        </button>
      )}

      {src && (
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-3 pt-10 transition-opacity duration-300 ${
            showUi || !playing ? "opacity-100" : "opacity-0"
          }`}
        >
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={time}
            aria-label="Progresso do vídeo"
            onChange={(e) => {
              const v = videoRef.current;
              if (v) { v.currentTime = Number(e.target.value); setTime(Number(e.target.value)); }
            }}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#00F5FF]"
            style={{
              backgroundImage: `linear-gradient(90deg, #7B2EFF, #00F5FF ${((time / (duration || 1)) * 100).toFixed(1)}%, transparent ${((time / (duration || 1)) * 100).toFixed(1)}%)`,
            }}
          />

          <div className="mt-2.5 flex items-center gap-3 text-white/85">
            <button onClick={toggle} aria-label={playing ? "Pausar" : "Reproduzir"} className="transition hover:text-[#00F5FF]">
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button onClick={() => seekBy(-10)} aria-label="Voltar 10s" className="transition hover:text-[#00F5FF]">
              <RotateCcw className="h-4.5 w-4.5" />
            </button>
            <button onClick={() => seekBy(10)} aria-label="Avançar 10s" className="transition hover:text-[#00F5FF]">
              <RotateCw className="h-4.5 w-4.5" />
            </button>

            <div className="group/vol flex items-center gap-2">
              <button
                onClick={() => { const v = videoRef.current; if (v) { v.muted = !v.muted; setMuted(v.muted); } }}
                aria-label={muted ? "Ativar som" : "Silenciar"}
                className="transition hover:text-[#00F5FF]"
              >
                {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <input
                type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
                aria-label="Volume"
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const v = videoRef.current;
                  setVolume(val); setMuted(val === 0);
                  if (v) { v.volume = val; v.muted = val === 0; }
                }}
                className="h-1 w-0 cursor-pointer appearance-none rounded-full bg-white/20 accent-[#00F5FF] transition-all duration-300 group-hover/vol:w-20"
              />
            </div>

            <span className="ml-1 font-mono text-[11px] tabular-nums text-white/60">
              {fmt(time)} <span className="text-white/25">/</span> {fmt(duration)}
            </span>

            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={() => {
                  const rates = [1, 1.25, 1.5, 1.75, 2, 0.75];
                  const nextRate = rates[(rates.indexOf(rate) + 1) % rates.length];
                  setRate(nextRate);
                  if (videoRef.current) videoRef.current.playbackRate = nextRate;
                }}
                className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-medium transition hover:border-[#00F5FF]/60 hover:text-[#00F5FF]"
              >
                {rate}x
              </button>
              <button onClick={() => void toggleFullscreen()} aria-label="Tela cheia" className="transition hover:text-[#00F5FF]">
                {fullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
