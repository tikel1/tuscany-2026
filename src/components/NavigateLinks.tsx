import { Navigation } from "lucide-react";
import { googleMapsNavUrl, wazeNavUrl } from "../lib/nav";
import { useT } from "../lib/dict";

interface Props {
  coords: [number, number];
  /** Icon size in px. Defaults to 12, the body-link size. */
  size?: number;
  className?: string;
}

/* "Navigate" used to be a single link to Google Maps. Most of the trip
 * happens in the car, so we now offer Maps + Waze as a tiny side-by-
 * side pair — both deep-link straight into active navigation mode (no
 * preview step). On mobile, tapping either launches the corresponding
 * app if installed; on desktop, both fall back to their web UIs. */
export default function NavigateLinks({ coords, size = 12, className }: Props) {
  const t = useT();

  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <a
        href={googleMapsNavUrl(coords)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("navigate_google_aria")}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-700 hover:text-terracotta-600 transition-colors"
      >
        <Navigation size={size} />
        <span>{t("navigate_google")}</span>
      </a>
      <span className="text-ink-700/30 text-xs leading-none" aria-hidden>
        ·
      </span>
      <a
        href={wazeNavUrl(coords)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("navigate_waze_aria")}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-700 hover:text-[#33CCFF] transition-colors"
      >
        {/* Waze app icon — a small abstract glyph that reads as a
            speech bubble / pin (the brand-mark shape). */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 11a9 9 0 1 1 16.5 5l1 4-4-1A9 9 0 0 1 3 11z" />
          <circle cx="9" cy="11" r="0.8" fill="currentColor" />
          <circle cx="15" cy="11" r="0.8" fill="currentColor" />
        </svg>
        <span>{t("navigate_waze")}</span>
      </a>
    </span>
  );
}
