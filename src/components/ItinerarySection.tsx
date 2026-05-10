import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { itinerary } from "../data/itinerary";
import DayCard from "./DayCard";
import TripStrip from "./TripStrip";

type Filter = "all" | "north" | "south";

const TABS: { id: Filter; label: string; sub: string }[] = [
  { id: "all", label: "All ten chapters", sub: "17 — 26 Aug" },
  { id: "north", label: "North", sub: "17 — 21 Aug · Larciano" },
  { id: "south", label: "South", sub: "21 — 26 Aug · Cortevecchia" }
];

export default function ItinerarySection() {
  const [tab, setTab] = useState<Filter>("all");

  const days = itinerary.filter(d => {
    if (tab === "all") return true;
    if (tab === "north") return d.region === "north" || d.dayNumber === 5;
    if (tab === "south") return d.region === "south" || d.dayNumber === 10;
    return true;
  });

  return (
    <section
      id="trip"
      className="relative scroll-mt-20 bg-gradient-to-b from-cream-100/80 via-cream-100/50 to-cream-100/80 pt-8 sm:pt-10 pb-20 sm:pb-28 overflow-hidden"
    >
      {/* Decorative oversized FEATURE word in the background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-2 sm:top-2 right-0 left-0 text-center font-serif italic select-none whitespace-nowrap text-[18vw] sm:text-[12rem] leading-none text-terracotta-500/[0.05]"
      >
        Tuscany
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Big chapter ribbon — first thing in the section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
        >
          <TripStrip />
        </motion.div>

        {/* Region tabs */}
        <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide mt-6 sm:mt-8">
          <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap sm:justify-center">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap min-h-11 ${
                  tab === t.id
                    ? "bg-ink-900 text-cream-50 shadow-[0_4px_18px_rgba(58,28,15,0.25)]"
                    : "bg-cream-50 border border-cream-300 text-ink-800 hover:border-terracotta-500/40 hover:text-terracotta-600"
                }`}
              >
                <span>{t.label}</span>
                <span
                  className={`ml-2 text-xs ${
                    tab === t.id ? "text-cream-200" : "text-ink-700/60"
                  }`}
                >
                  · {t.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sticky compact chapter navigation — pinned while scrolling chapters */}
        <div className="mt-8 sm:mt-10 sticky top-14 sm:top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 bg-cream-100/85 backdrop-blur-md border-y border-cream-300/60">
          <div className="max-w-6xl mx-auto">
            <TripStrip compact />
          </div>
        </div>

        {/* Chapter cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-6 sm:mt-8 grid gap-7 sm:gap-10"
          >
            {days.map(d => (
              <DayCard key={d.dayNumber} day={d} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
