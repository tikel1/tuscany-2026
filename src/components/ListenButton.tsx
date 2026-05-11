import { Play, Pause, Loader2 } from "lucide-react";
import { useT } from "../lib/dict";
import { useLang } from "../lib/i18n";
import { resolveAudioUrl, resolveAttractionListenUrls } from "../lib/audioUrl";
import { usePageAudio } from "../lib/usePageAudio";

type Variant = "default" | "compact";

interface Props {
  /** Attraction id — maps to public/audio/attractions/<id>.mp3 */
  attractionId?: string;
  /** Path under public/audio/ without .mp3, e.g. `italian-words/day-01-0` */
  audioAssetPath?: string;
  /** Label used for the tooltip + a11y; falls back to the dict copy. */
  label?: string;
  variant?: Variant;
}

export default function ListenButton({
  attractionId,
  audioAssetPath,
  label,
  variant = "default"
}: Props) {
  const t = useT();
  const { lang } = useLang();

  let primary: string | null = null;
  let fallback: string | null = null;
  if (audioAssetPath) {
    primary = resolveAudioUrl({ audioAssetPath });
  } else if (attractionId) {
    const r = resolveAttractionListenUrls(attractionId, lang);
    primary = r.primary;
    fallback = r.fallback;
  }

  const { state, toggle } = usePageAudio(
    primary,
    fallback ? { fallbackUrl: fallback } : undefined
  );

  if (!primary) {
    return null;
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
