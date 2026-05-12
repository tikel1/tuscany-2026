import { Navigation } from "lucide-react";
import { googleMapsPlaceUrl, wazePlaceUrl, type NavTarget } from "../lib/nav";
import { useT } from "../lib/dict";

interface Props {
  /** Place name — used to build the search URL so each app opens the
   *  actual place's listing instead of just dropping a coord pin. */
  name: string;
  /** Lat, lon. Used by both apps as a fallback when the search needs it. */
  coords: [number, number];
  /** Optional street address. Sharpens the search; not required. */
  address?: string;
  /** Icon size in px. Defaults to 12, the body-link size. */
  size?: number;
  className?: string;
}

/* "Navigate" used to be a single link to Google Maps. Most of the trip
 * happens in the car, so we offer Maps + Waze as a tiny side-by-side
 * pair. We deep-link to the **place's listing** in each app (not into
 * active navigation) so the user can review it — hours, photos,
 * address — and tap Directions / Go themselves. */
export default function NavigateLinks({ name, coords, address, size = 12, className }: Props) {
  const t = useT();
  const target: NavTarget = { name, coords, address };

  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <a
        href={googleMapsPlaceUrl(target)}
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
        href={wazePlaceUrl(target)}
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
