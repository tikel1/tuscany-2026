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
      eyebrow="The plan, day by day"
      title="The Itinerary"
      intro="Ten days split between the cool, active north and the wild, watery south. Each day links to the relevant attractions on the map."
    >
      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
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

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="grid gap-4"
        >
          {days.map(d => (
            <DayCard key={d.dayNumber} day={d} />
          ))}
        </motion.div>
      </AnimatePresence>
    </Section>
  );
}
