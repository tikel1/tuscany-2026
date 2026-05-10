import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { itinerary } from "../data/itinerary";
import { getAttraction } from "../data/attractions";
import { getTripState } from "../lib/tripState";
import PoiImage from "./PoiImage";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export default function TripStrip() {
  const tripState = getTripState();
  const todayNumber =
    tripState.phase === "during" ? tripState.today.dayNumber : null;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Highlight the current chapter as the user scrolls through the itinerary
  useEffect(() => {
    const onScroll = () => {
      const fromTop = window.scrollY + window.innerHeight * 0.35;
      let active: number | null = null;
      for (const day of itinerary) {
        const el = document.getElementById(`day-${day.dayNumber}`);
        if (el && el.offsetTop <= fromTop) active = day.dayNumber;
      }
      setActiveIdx(active);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scroll = (dir: "left" | "right") => {
    const sc = scrollerRef.current;
    if (!sc) return;
    sc.scrollBy({ left: dir === "left" ? -360 : 360, behavior: "smooth" });
  };

  const jumpTo = (n: number) => {
    document
      .getElementById(`day-${n}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative">
      {/* Edge fades */}
      <div className="pointer-events-none hidden sm:block absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-cream-100 to-transparent z-10" />
      <div className="pointer-events-none hidden sm:block absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-cream-100 to-transparent z-10" />

      {/* Scroll buttons (desktop) */}
      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="Scroll chapters left"
        className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full items-center justify-center bg-cream-50 ring-1 ring-cream-300 shadow-md hover:bg-terracotta-500 hover:text-cream-50 hover:ring-terracotta-500 transition"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={() => scroll("right")}
        aria-label="Scroll chapters right"
        className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full items-center justify-center bg-cream-50 ring-1 ring-cream-300 shadow-md hover:bg-terracotta-500 hover:text-cream-50 hover:ring-terracotta-500 transition"
      >
        <ChevronRight size={18} />
      </button>

      <div
        ref={scrollerRef}
        className="-mx-4 sm:mx-0 px-4 sm:px-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
      >
        <ol className="flex gap-3 sm:gap-4 min-w-max sm:min-w-0">
          {itinerary.map((day, i) => {
            const lead = day.activities
              .map(a => (a.attractionId ? getAttraction(a.attractionId) : undefined))
              .find(a => !!a);
            const isToday = day.dayNumber === todayNumber;
            const isActive = activeIdx === day.dayNumber;
            const region = day.region;

            const accentText =
              region === "south"
                ? "text-gold-400"
                : region === "transit"
                ? "text-terracotta-300"
                : "text-olive-300";

            return (
              <li
                key={day.dayNumber}
                className="snap-center shrink-0"
              >
                <motion.button
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => jumpTo(day.dayNumber)}
                  className={`relative w-[44vw] max-w-[180px] sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden text-left bg-ink-900 group transition-shadow ${
                    isToday
                      ? "ring-2 ring-terracotta-500 shadow-[0_18px_36px_-14px_rgba(196,90,61,0.6)]"
                      : isActive
                      ? "ring-2 ring-terracotta-500/60 shadow-[0_14px_28px_-14px_rgba(196,90,61,0.4)]"
                      : "ring-1 ring-cream-300/0 shadow-[0_8px_22px_-12px_rgba(58,28,15,0.25)] hover:shadow-[0_18px_36px_-14px_rgba(58,28,15,0.45)]"
                  }`}
                >
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.06]">
                    <PoiImage
                      src={lead?.image}
                      alt={day.title}
                      region={region === "transit" ? "north" : region}
                      category={lead?.category}
                      tags={lead?.tags}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/40 to-ink-900/15" />

                  {/* Chapter mark */}
                  <div className="absolute top-2.5 left-3 right-3 flex items-start justify-between text-cream-50">
                    <div>
                      <div className={`text-[9px] uppercase tracking-[0.28em] font-medium ${accentText}`}>
                        Chapter
                      </div>
                      <div className="font-serif text-2xl leading-none mt-0.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                        {ROMAN[day.dayNumber]}
                      </div>
                    </div>
                    {isToday && (
                      <span className="px-1.5 py-0.5 rounded-full bg-terracotta-500 text-cream-50 text-[8px] uppercase tracking-[0.2em] font-bold">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Title at bottom */}
                  <div className="absolute bottom-0 inset-x-0 p-3 text-cream-50">
                    <div className="text-[9px] uppercase tracking-[0.22em] opacity-90">
                      {day.weekday.slice(0, 3)} · {day.date.slice(8)} Aug
                    </div>
                    <div className="font-serif text-[13px] sm:text-sm leading-tight mt-0.5 line-clamp-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                      {day.title}
                    </div>
                  </div>
                </motion.button>

                {/* Connecting tick — visual rhythm */}
                {i < itinerary.length - 1 && (
                  <span className="hidden sm:block absolute" aria-hidden />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
