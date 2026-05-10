import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Car, ChevronDown, Sun } from "lucide-react";
import type { Day } from "../data/types";
import { getAttraction } from "../data/attractions";
import { useMapFocus } from "../lib/mapContext";
import { formatDate } from "../lib/nav";
import { getTripState } from "../lib/tripState";

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
  const tripState = getTripState();
  const isToday =
    tripState.phase === "during" && tripState.today.dayNumber === day.dayNumber;

  const [open, setOpen] = useState(isToday); // default open if it's today

  return (
    <article
      className={`card-paper card-paper-hover overflow-hidden ${
        isToday ? "ring-2 ring-terracotta-500/40 shadow-[0_8px_32px_-8px_rgba(196,90,61,0.35)]" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full text-left flex flex-col md:flex-row min-h-16"
        aria-expanded={open}
      >
        <div className="md:w-48 shrink-0 md:border-r border-cream-300/70 px-4 sm:px-5 py-4 md:py-6 bg-gradient-to-br from-cream-100/80 to-cream-50">
          <div className="flex md:block items-center gap-3">
            <div className={`font-serif text-4xl md:text-6xl leading-none ${isToday ? "text-terracotta-700" : "text-terracotta-600"}`}>
              {String(day.dayNumber).padStart(2, "0")}
            </div>
            <div className="md:mt-3 flex-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink-700/70">
                {day.weekday}
              </div>
              <div className="text-sm font-medium text-ink-900">
                {formatDate(day.date)}
              </div>
            </div>
            <ChevronDown
              size={18}
              className={`md:hidden text-ink-700/60 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </div>
          <div className="mt-2 md:mt-4 flex flex-wrap gap-1.5">
            {isToday && (
              <span className="pill bg-terracotta-500 text-cream-50">
                <Sun size={10} /> Today
              </span>
            )}
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

        <div className="flex-1 px-4 sm:px-5 py-4 md:py-6 min-w-0">
          <h3 className="font-serif text-xl sm:text-2xl text-ink-900 leading-snug">
            {day.title}
          </h3>
          {day.subtitle && (
            <p className="text-sm text-ink-700/80 mt-1 italic">{day.subtitle}</p>
          )}

          {/* Collapse on mobile, always show on desktop */}
          <AnimatePresence initial={false}>
            {(open || typeof window === "undefined") && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="md:!h-auto md:!opacity-100 md:overflow-visible overflow-hidden"
              >
                <div className="mt-4 space-y-3">
                  {day.activities.map((a, i) => {
                    const att = a.attractionId ? getAttraction(a.attractionId) : undefined;
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="w-16 sm:w-20 shrink-0 text-xs font-semibold text-terracotta-600 pt-0.5">
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
                              onClick={(e) => {
                                e.stopPropagation();
                                focusOn(att.id);
                              }}
                              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-terracotta-600 hover:text-terracotta-700 active:text-terracotta-800 min-h-9"
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Always-visible mobile teaser when collapsed */}
          {!open && (
            <p className="text-sm text-ink-700/70 mt-2 line-clamp-1 md:hidden">
              {day.activities[0]?.time} · {day.activities[0]?.title}
              {day.activities.length > 1 && ` · +${day.activities.length - 1} more`}
            </p>
          )}
        </div>
      </button>
    </article>
  );
}
