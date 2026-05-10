import { Camera } from "lucide-react";
import type { ImageCredit } from "../data/types";

interface Props {
  credit?: ImageCredit;
  /** "light" sits on a dark photo background. "dark" sits on a cream surface. */
  variant?: "light" | "dark";
  className?: string;
}

export default function PhotoCredit({ credit, variant = "light", className }: Props) {
  if (!credit) return null;

  const baseClass =
    variant === "light"
      ? "text-cream-50/85 hover:text-cream-50"
      : "text-ink-700/65 hover:text-ink-900";

  const inner = (
    <span className="inline-flex items-center gap-1.5">
      <Camera size={9} className="opacity-70" />
      <span className="font-serif italic normal-case tracking-normal">
        {credit.author}
      </span>
      <span aria-hidden className="opacity-60">·</span>
      <span className="opacity-90">{credit.license}</span>
    </span>
  );

  return (
    <span
      className={`inline-flex items-center text-[9px] sm:text-[10px] uppercase tracking-[0.16em] font-medium transition-colors ${baseClass} ${className ?? ""}`}
    >
      {credit.source ? (
        <a
          href={credit.source}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline"
          aria-label={`Photo credit: ${credit.author}, ${credit.license}. Open source.`}
        >
          {inner}
        </a>
      ) : (
        inner
      )}
    </span>
  );
}
