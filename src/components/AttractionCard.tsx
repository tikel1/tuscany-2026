import { ExternalLink, MapPin, Navigation } from "lucide-react";
import type { POI } from "../data/types";
import { useMapFocus } from "../lib/mapContext";
import { navUrl } from "../lib/nav";
import PoiImage from "./PoiImage";

const tagColor: Record<string, string> = {
  water: "pill-olive",
  extreme: "pill-terracotta",
  nature: "pill-olive",
  culture: "pill-gold",
  family: "pill-ink",
  food: "pill-terracotta",
  view: "pill-gold",
  cave: "pill-ink",
  village: "pill-gold"
};

export default function AttractionCard({ poi }: { poi: POI }) {
  const { focusOn } = useMapFocus();

  return (
    <article className="card-paper card-paper-hover overflow-hidden flex flex-col h-full">
      <div className="aspect-[4/3] overflow-hidden bg-cream-200">
        <PoiImage
          src={poi.image}
          alt={poi.name}
          region={poi.region}
          category={poi.category}
          tags={poi.tags}
        />
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-xl text-ink-900 leading-tight">
            {poi.name}
          </h3>
          <span className={`shrink-0 ${poi.region === "south" ? "pill-gold" : "pill-olive"}`}>
            {poi.region === "south" ? "South" : "North"}
          </span>
        </div>

        {poi.tags && poi.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {poi.tags.map(t => (
              <span key={t} className={tagColor[t] ?? "pill-ink"}>
                {t}
              </span>
            ))}
          </div>
        )}

        <p className="mt-3 text-sm text-ink-700/85 leading-relaxed flex-1">
          {poi.description}
        </p>

        {(poi.openingNote || poi.bookingNote) && (
          <div className="mt-3 text-xs text-terracotta-600 bg-terracotta-500/8 border border-terracotta-500/20 rounded-lg px-3 py-2">
            {poi.openingNote || poi.bookingNote}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-cream-300/60 flex flex-wrap items-center gap-x-4 gap-y-2">
          {poi.website && (
            <a
              href={poi.website}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-link"
            >
              <ExternalLink size={13} /> Website
            </a>
          )}
          <a
            href={navUrl(poi.coords)}
            target="_blank"
            rel="noopener noreferrer"
            className="icon-link"
          >
            <Navigation size={13} /> Navigate
          </a>
          <button onClick={() => focusOn(poi.id)} className="icon-link">
            <MapPin size={13} /> Show on map
          </button>
        </div>
      </div>
    </article>
  );
}
