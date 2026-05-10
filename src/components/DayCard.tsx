import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Car, ChevronDown, Sun } from "lucide-react";
import type { Day } from "../data/types";
import { getAttraction } from "../data/attractions";
import { useMapFocus } from "../lib/mapContext";
import { formatDate } from "../lib/nav";
import { getTripState } from "../lib/tripState";
import PoiImage from "./PoiImage";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const tagLabel: Record<string, string> = {
  water: "Water",
  extreme: "Adrenaline",
  nature: "Nature",
  culture: "Culture",
  family: "Family",
  food: "Food",
  view: "View",
  cave: "Cave",
  village: "Village"
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

  // Find lead photo from first attraction with an image
  const leadAttraction = day.activities
    .map(a => (a.attractionId ? getAttraction(a.attractionId) : undefined))
    .find(a => !!a);

  const [open, setOpen] = useState(isToday);

  const accent =
    day.region === "south"
      ? "bg-gold-500"
      : day.region === "north"
      ? "bg-olive-500"
      : "bg-terracotta-500";

  return (
    <article
      className={`relative group rounded-2xl overflow-hidden transition-all duration-500 ${
        isToday
          ? "bg-gradient-to-br from-terracotta-500/8 via-cream-50 to-cream-50 ring-1 ring-terracotta-500/40 shadow-[0_18px_40px_-18px_rgba(196,90,61,0.45)]"
          : "bg-cream-50 ring-1 ring-cream-300/60 hover:ring-terracotta-500/25 hover:shadow-[0_18px_40px_-22px_rgba(58,28,15,0.18)]"
      }`}
    >
      {/* Left accent stripe */}
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${accent}`} aria-hidden />

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full text-left grid md:grid-cols-[1fr_320px]"
        aria-expanded={open}
      >
        {/* Left: chapter header */}
        <div className="px-5 sm:px-7 py-6 sm:py-8 min-w-0">
          <div className="flex items-baseline gap-3">
            <div
              className={`font-serif text-2xl leading-none ${
                isToday ? "text-terracotta-700" : "text-terracotta-600"
              }`}
              aria-hidden
            >
              {ROMAN[day.dayNumber]}
            </div>
            <div className="h-px flex-1 bg-cream-300/80 max-w-12" />
            <div className="text-[10px] uppercase tracking-[0.24em] text-ink-700/70 font-medium">
              Chapter {String(day.dayNumber).padStart(2, "0")}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-ink-700/65">
            <span>{day.weekday}</span>
            <span aria-hidden>·</span>
            <span>{formatDate(day.date)}</span>
            <span aria-hidden>·</span>
            <span>{regionLabel[day.region]}</span>
            {day.base && (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1 normal-case tracking-normal text-ink-700/80">
                  <MapPin size={11} className="opacity-70" /> {day.base}
                </span>
              </>
            )}
          </div>

          <h3
            className={`mt-3 font-serif leading-[1.05] text-3xl sm:text-4xl ${
              isToday ? "text-terracotta-700" : "text-ink-900"
            }`}
          >
            {day.title}
          </h3>
          {day.subtitle && (
            <p className="mt-2 font-serif italic text-ink-700/85 text-base sm:text-lg">
              {day.subtitle}
            </p>
          )}

          {isToday && (
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-500 text-cream-50 text-[10px] uppercase tracking-[0.22em] font-medium">
              <Sun size={11} /> Today
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink-700/55 md:hidden">
            <ChevronDown
              size={14}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
            {open ? "hide the day" : "see the day"}
          </div>

          {!open && (
            <p className="mt-3 text-sm text-ink-700/70 line-clamp-1 md:hidden">
              {day.activities[0]?.time} · {day.activities[0]?.title}
              {day.activities.length > 1 && ` · +${day.activities.length - 1} more`}
            </p>
          )}
        </div>

        {/* Right: lead photo (desktop) */}
        <div className="hidden md:block relative bg-cream-200">
          <div className="absolute inset-0">
            <PoiImage
              src={leadAttraction?.image}
              alt={leadAttraction?.name ?? day.title}
              region={day.region === "transit" ? "north" : day.region}
              category={leadAttraction?.category}
              tags={leadAttraction?.tags}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-l from-cream-50/0 via-cream-50/0 to-cream-50/30" />
        </div>
      </button>

      {/* Mobile lead photo (always visible, slim) */}
      {leadAttraction?.image && (
        <div className="md:hidden h-44 -mt-2 mx-5 mb-2 rounded-xl overflow-hidden ring-1 ring-cream-300/60">
          <PoiImage
            src={leadAttraction.image}
            alt={leadAttraction.name}
            region={day.region === "transit" ? "north" : day.region}
            category={leadAttraction.category}
            tags={leadAttraction.tags}
          />
        </div>
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-7 pb-6 sm:pb-8">
              {/* Ornament divider */}
              <div className="my-2 flex items-center gap-2 text-cream-400">
                <div className="h-px flex-1 bg-cream-300/70" />
                <span className="font-serif text-xs italic">the day</span>
                <div className="h-px flex-1 bg-cream-300/70" />
              </div>

              <ol className="mt-3 space-y-5">
                {day.activities.map((a, i) => {
                  const att = a.attractionId ? getAttraction(a.attractionId) : undefined;
                  return (
                    <li key={i} className="grid grid-cols-[60px_1fr] sm:grid-cols-[80px_1fr] gap-3 sm:gap-5 group/act">
                      <div className="text-right">
                        <div
                          className={`font-serif text-lg sm:text-xl leading-none ${
                            isToday ? "text-terracotta-700" : "text-terracotta-600"
                          }`}
                        >
                          {a.time ?? "—"}
                        </div>
                        <div className="text-[9px] uppercase tracking-[0.22em] text-ink-700/45 font-medium mt-1">
                          stop {String(i + 1).padStart(2, "0")}
                        </div>
                      </div>
                      <div className="min-w-0 border-l border-cream-300/70 pl-4 sm:pl-5 -ml-2 sm:-ml-3">
                        <div className="font-serif text-lg sm:text-xl text-ink-900 leading-snug">
                          {a.title}
                        </div>
                        <p className="text-[14px] text-ink-700/85 mt-1 leading-relaxed">
                          {a.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.16em] text-ink-700/55">
                          {a.tag && <span>· {tagLabel[a.tag] ?? a.tag}</span>}
                          {att && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                focusOn(att.id);
                              }}
                              className="inline-flex items-center gap-1 text-terracotta-600 hover:text-terracotta-700 active:text-terracotta-800"
                            >
                              <MapPin size={11} /> on the map
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>

              {day.driveNotes && (
                <div className="mt-6 pt-5 border-t border-cream-300/60 flex items-start gap-3">
                  <Car size={14} className="text-olive-500 mt-1 shrink-0" />
                  <p className="font-serif italic text-sm text-ink-700/80 leading-relaxed">
                    {day.driveNotes}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
