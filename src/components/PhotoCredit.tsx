import type { ImageCredit } from "../data/types";

interface Props {
  credit?: ImageCredit;
  /** "light" sits on a dark photo background. "dark" sits on a cream surface. */
  variant?: "light" | "dark";
  className?: string;
}

/* Minimal attribution glyph for CC photos — renders as `© BY-SA` (or
 * just `©` when no license id is present) and links to the source. The
 * full author + license read out in the aria-label / hover title, so
 * screen readers and curious viewers still get the full credit while
 * the on-image footprint stays as small as possible. */
export default function PhotoCredit({
  credit,
  variant = "light",
  className
}: Props) {
  if (!credit) return null;

  const tone =
    variant === "light"
      ? "text-cream-50/85 hover:text-cream-50"
      : "text-ink-700/65 hover:text-ink-900";

  // "CC BY-SA 4.0" → "BY-SA 4.0", "Public Domain" → "PD"
  const shortLicense = credit.license
    .replace(/^CC\s+/i, "")
    .replace(/^Public Domain$/i, "PD");

  const ariaLabel = `${credit.author} · ${credit.license}`;

  const inner = (
    <span
      data-compact-ui
      title={ariaLabel}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-0.5 text-[9px] leading-none font-medium tracking-wide transition-colors ${tone} ${className ?? ""}`}
    >
      <span aria-hidden>©</span>
      {shortLicense && <span>{shortLicense}</span>}
    </span>
  );

  if (credit.source) {
    return (
      <a
        href={credit.source}
        target="_blank"
        rel="noopener noreferrer"
        className="leading-none"
      >
        {inner}
      </a>
    );
  }
  return inner;
}
