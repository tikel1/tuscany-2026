import { useState } from "react";
import type { Region } from "../data/types";

interface Props {
  src?: string;
  alt: string;
  region?: Region;
  className?: string;
}

const palette: Record<Region, [string, string]> = {
  north: ["#6B7A4B", "#8A9A6B"],
  south: ["#C45A3D", "#D87154"],
  transit: ["#8B4513", "#B8862C"]
};

export default function PoiImage({ src, alt, region = "north", className }: Props) {
  const [failed, setFailed] = useState(false);
  const [from, to] = palette[region];

  if (!src || failed) {
    const initials = alt
      .replace(/[^A-Za-z0-9 \-]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0])
      .join("")
      .toUpperCase();

    return (
      <div
        className={`w-full h-full flex items-center justify-center relative overflow-hidden ${className ?? ""}`}
        style={{
          background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`
        }}
        aria-label={alt}
      >
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
          }}
        />
        <div
          className="absolute -bottom-8 -right-6 font-serif text-[10rem] leading-none opacity-20 text-cream-50 select-none"
          aria-hidden
        >
          {initials || "T"}
        </div>
        <div className="relative text-cream-50 font-serif text-2xl px-6 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          {alt}
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`w-full h-full object-cover transition-transform duration-700 hover:scale-105 ${className ?? ""}`}
      onError={() => setFailed(true)}
    />
  );
}
