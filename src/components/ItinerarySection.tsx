import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { itinerary } from "../data/itinerary";
import DayCard from "./DayCard";
import Section from "./Section";

type Filter = "all" | "north" | "south";

const TABS: { id: Filter; label: string; sub: string }[] = [
  { id: "all", label: "All 10 days", sub: "17 – 26 Aug" },
  { id: "north", label: "North", sub: "17 – 21 Aug · Larciano" },
  { id: "south", label: "South", sub: "21 – 26 Aug · Cortevecchia" }
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
    <Section
      id="trip"
      eyebrow="The plan"
      title="Ten days, two regions"
      kicker="A summer read in chapters."
      intro="Cool mornings in the wooded north, long afternoons in the watery south. Each chapter links to the day's attractions and the moves between bases."
    >
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide mb-6 sm:mb-8">
        <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap min-h-11 ${
                tab === t.id
                  ? "bg-ink-900 text-cream-50 shadow-sm"
                  : "bg-cream-50 border border-cream-300 text-ink-800 hover:border-terracotta-500/40 hover:text-terracotta-600"
              }`}
            >
              <span>{t.label}</span>
              <span className={`ml-2 text-xs ${tab === t.id ? "text-cream-200" : "text-ink-700/60"}`}>
                · {t.sub}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="grid gap-5 sm:gap-7"
        >
          {days.map(d => (
            <DayCard key={d.dayNumber} day={d} />
          ))}
        </motion.div>
      </AnimatePresence>
    </Section>
  );
}
