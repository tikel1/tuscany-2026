import { useEffect, useRef, useState } from "react";
import { Play, Pause, Loader2 } from "lucide-react";
import { useT } from "../lib/dict";

/* ------------------------------------------------------------------ */
/* Audio bus: a tiny singleton that guarantees only ONE clip plays at  */
/* a time across the whole page. Without it, tapping "Listen" on a    */
/* second card would layer voices on top of each other. The bus keeps */
/* a reference to the current <audio> element and pauses it whenever  */
/* a different one starts.                                             */
/* ------------------------------------------------------------------ */

let currentAudio: HTMLAudioElement | null = null;

function claimPlayback(audio: HTMLAudioElement) {
  if (currentAudio && currentAudio !== audio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  currentAudio = audio;
}

function releasePlayback(audio: HTMLAudioElement) {
  if (currentAudio === audio) currentAudio = null;
}

/* ------------------------------------------------------------------ */
/* Public component                                                    */
/* ------------------------------------------------------------------ */

type Variant = "default" | "compact";

interface Props {
  /** Attraction id — maps to public/audio/attractions/<id>.mp3 */
  attractionId: string;
  /** Label used for the tooltip + a11y; falls back to the dict copy. */
  label?: string;
  variant?: Variant;
}

/** Build the audio URL relative to the deployed base. We deliberately
 *  use BASE_URL so the same code works on `/` (dev) and on
 *  `/tuscany-2026/` (GitHub Pages). */
function audioUrl(id: string): string {
  const base = import.meta.env.BASE_URL || "/";
  // BASE_URL always ends in `/` per Vite contract.
  return `${base}audio/attractions/${id}.mp3`;
}

export default function ListenButton({ attractionId, label, variant = "default" }: Props) {
  const t = useT();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "playing" | "error">("idle");

  // Lazy-init the Audio element on first interaction. Creating it
  // upfront would trigger a HEAD request for the MP3 even if the user
  // never taps Listen — wasteful for a page with many cards.
  function ensureAudio(): HTMLAudioElement {
    if (!audioRef.current) {
      const a = new Audio(audioUrl(attractionId));
      a.preload = "none";
      a.addEventListener("playing", () => setState("playing"));
      a.addEventListener("waiting", () => setState("loading"));
      a.addEventListener("pause", () => setState(s => (s === "loading" ? s : "idle")));
      a.addEventListener("ended", () => {
        setState("idle");
        releasePlayback(a);
      });
      a.addEventListener("error", () => {
        setState("error");
        releasePlayback(a);
      });
      audioRef.current = a;
    }
    return audioRef.current;
  }

  useEffect(() => {
    return () => {
      // Belt-and-braces: stop our audio when the host card unmounts.
      const a = audioRef.current;
      if (a) {
        a.pause();
        releasePlayback(a);
      }
    };
  }, []);

  function toggle(e: React.MouseEvent) {
    // The card's reveal-panel listens for clicks at the article root.
    // Don't let the toggle bubble up into "close the card" handlers.
    e.stopPropagation();
    const a = ensureAudio();
    if (state === "playing" || state === "loading") {
      a.pause();
      setState("idle");
      releasePlayback(a);
      return;
    }
    setState("loading");
    claimPlayback(a);
    a.play().catch(() => setState("error"));
  }

  const aria =
    label ?? (state === "playing" ? t("listen_pause") : t("listen_play"));

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={aria}
        title={aria}
        className={`inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
          state === "playing"
            ? "bg-terracotta-500 text-cream-50"
            : "bg-cream-200 text-ink-700 hover:bg-terracotta-500 hover:text-cream-50"
        }`}
      >
        {state === "loading" ? (
          <Loader2 size={13} className="animate-spin" />
        ) : state === "playing" ? (
          <Pause size={13} strokeWidth={2.2} />
        ) : (
          <Play size={13} strokeWidth={2.2} />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={aria}
      title={aria}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.16em] font-medium transition-colors ${
        state === "playing"
          ? "bg-terracotta-500 text-cream-50"
          : state === "error"
            ? "bg-cream-200 text-ink-700/60"
            : "bg-cream-200 text-ink-800 hover:bg-terracotta-500 hover:text-cream-50"
      }`}
      disabled={state === "error"}
    >
      {state === "loading" ? (
        <Loader2 size={13} className="animate-spin" />
      ) : state === "playing" ? (
        <Pause size={13} strokeWidth={2.2} />
      ) : (
        <Play size={13} strokeWidth={2.2} />
      )}
      <span>
        {state === "playing"
          ? t("listen_pause")
          : state === "error"
            ? t("listen_unavailable")
            : t("listen_play")}
      </span>
    </button>
  );
}
