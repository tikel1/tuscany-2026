import { ExternalLink, Navigation, MapPin, AlertTriangle, Check } from "lucide-react";
import { stays } from "../data/stays";
import Section from "./Section";
import { useMapFocus } from "../lib/mapContext";
import { navUrl, formatDate } from "../lib/nav";
import PoiImage from "./PoiImage";
import PhotoCredit from "./PhotoCredit";

export default function StaysSection() {
  const { focusOn } = useMapFocus();

  return (
    <Section
      id="stays"
      eyebrow="Home base"
      title="Where we sleep"
      kicker="Two homes for ten nights."
      intro="A hill-perched home in Larciano for the active north, then a country tenuta near Manciano for the slower, watery south."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {stays.map(s => (
          <article key={s.id} className="card-paper card-paper-hover overflow-hidden flex flex-col">
            <div className="relative aspect-[16/10] overflow-hidden bg-cream-200">
              <PoiImage
                src={s.image}
                alt={s.name}
                region={s.region}
                category={s.category}
              />
              {s.image && s.imageCredit && (
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-ink-900/55 backdrop-blur-sm">
                  <PhotoCredit credit={s.imageCredit} variant="light" />
                </div>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-serif text-2xl text-ink-900 leading-tight">{s.name}</h3>
                <span className={`shrink-0 ${s.region === "south" ? "pill-gold" : s.region === "north" ? "pill-olive" : "pill-ink"}`}>
                  {s.nights} {s.nights === 1 ? "night" : "nights"}
                </span>
              </div>
              <div className="mt-1 text-sm text-terracotta-600 font-medium">
                {formatDate(s.checkIn)} → {formatDate(s.checkOut)}
              </div>
              {s.address && (
                <div className="mt-1 text-xs text-ink-700/70 flex items-center gap-1">
                  <MapPin size={11} /> {s.address}
                </div>
              )}

              <p className="mt-3 text-sm text-ink-700/85 leading-relaxed">
                {s.description}
              </p>

              {s.highlights.length > 0 && (
                <ul className="mt-4 space-y-1.5">
                  {s.highlights.map((h, i) => (
                    <li key={i} className="flex gap-2 text-sm text-ink-800">
                      <Check size={14} className="text-olive-500 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}

              {s.warnings && s.warnings.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {s.warnings.map((w, i) => (
                    <li key={i} className="flex gap-2 text-sm text-terracotta-700">
                      <AlertTriangle size={14} className="text-terracotta-500 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 pt-4 border-t border-cream-300/60 flex flex-wrap gap-x-4 gap-y-2">
                {s.bookingLink && (
                  <a href={s.bookingLink} target="_blank" rel="noopener noreferrer" className="icon-link">
                    <ExternalLink size={13} /> Booking
                  </a>
                )}
                <a href={navUrl(s.coords)} target="_blank" rel="noopener noreferrer" className="icon-link">
                  <Navigation size={13} /> Navigate
                </a>
                <button onClick={() => focusOn(s.id)} className="icon-link">
                  <MapPin size={13} /> Show on map
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
