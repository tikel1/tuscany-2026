import { MapPin, Car } from "lucide-react";
import type { Day } from "../data/types";
import { getAttraction } from "../data/attractions";
import { useMapFocus } from "../lib/mapContext";
import { formatDate } from "../lib/nav";

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

const regionLabel: Record<string, string> = {
  north: "North",
  south: "South",
  transit: "Transit"
};

export default function DayCard({ day }: { day: Day }) {
  const { focusOn } = useMapFocus();

  return (
    <article className="card-paper card-paper-hover overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 shrink-0 md:border-r border-cream-300/70 px-5 py-5 md:py-6 bg-gradient-to-br from-cream-100/80 to-cream-50">
          <div className="flex md:block items-baseline gap-3">
            <div className="font-serif text-5xl md:text-6xl text-terracotta-600 leading-none">
              {String(day.dayNumber).padStart(2, "0")}
            </div>
            <div className="md:mt-3">
              <div className="text-xs uppercase tracking-[0.2em] text-ink-700/70">
                {day.weekday}
              </div>
              <div className="text-sm font-medium text-ink-900">
                {formatDate(day.date)}
              </div>
            </div>
          </div>
          <div className="mt-3 md:mt-4 flex flex-wrap gap-1.5">
            <span className={`pill ${day.region === "south" ? "pill-gold" : day.region === "north" ? "pill-olive" : "pill-ink"}`}>
              {regionLabel[day.region]}
            </span>
            {day.base && (
              <span className="pill pill-ink">
                <MapPin size={11} /> {day.base}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 px-5 py-5 md:py-6">
          <h3 className="font-serif text-2xl text-ink-900 leading-snug">
            {day.title}
          </h3>
          {day.subtitle && (
            <p className="text-sm text-ink-700/80 mt-1 italic">{day.subtitle}</p>
          )}

          <div className="mt-4 space-y-3">
            {day.activities.map((a, i) => {
              const att = a.attractionId ? getAttraction(a.attractionId) : undefined;
              return (
                <div key={i} className="flex gap-3">
                  <div className="w-20 shrink-0 text-xs font-medium text-terracotta-600 pt-0.5">
                    {a.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink-900">{a.title}</span>
                      {a.tag && (
                        <span className={tagColor[a.tag] ?? "pill-ink"}>
                          {a.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-ink-700/85 mt-0.5 leading-relaxed">
                      {a.description}
                    </p>
                    {att && (
                      <button
                        onClick={() => focusOn(att.id)}
                        className="mt-1.5 icon-link"
                      >
                        <MapPin size={12} /> Show on map
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {day.driveNotes && (
            <div className="mt-5 inline-flex items-center gap-1.5 text-xs text-ink-700/70 bg-cream-100/80 border border-cream-300/60 rounded-full px-3 py-1.5">
              <Car size={12} className="text-olive-500" />
              {day.driveNotes}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
