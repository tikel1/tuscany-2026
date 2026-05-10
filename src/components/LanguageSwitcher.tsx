import { Languages } from "lucide-react";
import { useLang, type Lang } from "../lib/i18n";

interface Props {
  /** "navbar" — sits in the desktop/mobile top bar.
   *  "minimal" — tiny pill (used inside footer / mobile bottom nav).  */
  variant?: "navbar" | "minimal";
  /** Tints the inactive label cream (when sitting on a dark hero). */
  onDark?: boolean;
}

const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "he", label: "עב" }
];

export default function LanguageSwitcher({ variant = "navbar", onDark = false }: Props) {
  const { lang, setLang } = useLang();

  const baseColor = onDark
    ? "text-cream-50/85 hover:text-cream-50"
    : "text-ink-700 hover:text-terracotta-600";

  if (variant === "minimal") {
    return (
      <div
        className={`inline-flex items-center gap-0.5 rounded-full bg-cream-50/80 ring-1 ring-cream-300/70 p-0.5 text-[11px] font-medium ${baseColor}`}
        role="group"
        aria-label="Language"
      >
        {LANGS.map(l => (
          <button
            key={l.id}
            type="button"
            onClick={() => setLang(l.id)}
            className={`px-2.5 py-1 rounded-full transition-colors ${
              lang === l.id
                ? "bg-ink-900 text-cream-50"
                : "text-ink-700 hover:bg-cream-100"
            }`}
            aria-pressed={lang === l.id}
          >
            {l.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full ${
        onDark ? "bg-cream-50/15 ring-1 ring-cream-50/25" : "bg-cream-100/80 ring-1 ring-cream-300/70"
      } px-1 py-1 text-[11px] font-semibold backdrop-blur`}
      role="group"
      aria-label="Language"
    >
      <Languages
        size={13}
        className={`mx-1 ${onDark ? "text-cream-50/70" : "text-ink-700/55"}`}
        aria-hidden
      />
      {LANGS.map(l => (
        <button
          key={l.id}
          type="button"
          onClick={() => setLang(l.id)}
          className={`px-2 py-0.5 rounded-full transition-colors min-h-7 ${
            lang === l.id
              ? "bg-terracotta-500 text-cream-50 shadow-sm"
              : onDark
              ? "text-cream-50/85 hover:text-cream-50"
              : "text-ink-700 hover:text-terracotta-600"
          }`}
          aria-pressed={lang === l.id}
          title={l.id === "en" ? "English" : "עברית"}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
