import { useState } from "react";
import { Home, Mountain, Waves, Castle, TreePine, Anchor, Camera } from "lucide-react";
import type { Region, Category, AttractionTag } from "../data/types";

interface Props {
  src?: string;
  alt: string;
  region?: Region;
  category?: Category;
  tags?: AttractionTag[];
  className?: string;
}

const palette: Record<Region, [string, string]> = {
  north: ["#6B7A4B", "#8A9A6B"],
  south: ["#C45A3D", "#D87154"],
  transit: ["#8B4513", "#B8862C"]
};

function pickIcon(category?: Category, tags?: AttractionTag[]) {
  if (category === "stay") return Home;
  if (tags?.includes("water")) return Waves;
  if (tags?.includes("cave") || tags?.includes("village") || tags?.includes("culture")) return Castle;
  if (tags?.includes("nature")) return TreePine;
  if (tags?.includes("view")) return Mountain;
  if (tags?.includes("extreme")) return Anchor;
  return Camera;
}

export default function PoiImage({ src, alt, region = "north", category, tags, className }: Props) {
  const [failed, setFailed] = useState(false);
  const [from, to] = palette[region];
  const Icon = pickIcon(category, tags);

  if (!src || failed) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center relative overflow-hidden ${className ?? ""}`}
        style={{
          background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`
        }}
        aria-label={alt}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
          }}
        />
        <svg
          className="absolute inset-x-0 bottom-0 w-full h-1/2 opacity-25"
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0,160 Q60,100 120,130 T240,120 T400,140 L400,200 L0,200 Z"
            fill="rgba(255,255,255,0.5)"
          />
          <path
            d="M0,180 Q80,140 160,160 T320,150 T400,170 L400,200 L0,200 Z"
            fill="rgba(255,255,255,0.4)"
          />
        </svg>
        <div className="relative flex flex-col items-center gap-2 px-5 text-center text-cream-50">
          <div className="p-2 rounded-full bg-cream-50/15 backdrop-blur-[2px]">
            <Icon size={22} strokeWidth={1.6} />
          </div>
          <div className="font-serif text-lg sm:text-xl leading-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)]">
            {alt}
          </div>
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
