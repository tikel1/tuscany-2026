import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { attractions } from "../data/attractions";
import AttractionCard from "./AttractionCard";
import Section from "./Section";
import type { AttractionTag, Region } from "../data/types";

type RegionFilter = "all" | Extract<Region, "north" | "south">;

const REGION_TABS: { id: RegionFilter; label: string; count: number }[] = [
  { id: "all", label: "All", count: attractions.length },
  { id: "north", label: "North", count: attractions.filter(a => a.region === "north").length },
  { id: "south", label: "South", count: attractions.filter(a => a.region === "south").length }
];

const ALL_TAGS: AttractionTag[] = [
  "water", "extreme", "nature", "culture", "family", "view", "cave", "village"
];

export default function AttractionsGrid() {
  const [region, setRegion] = useState<RegionFilter>("all");
  const [tag, setTag] = useState<AttractionTag | null>(null);

  const filtered = useMemo(
    () =>
      attractions.filter(a => {
        if (region !== "all" && a.region !== region) return false;
        if (tag && !(a.tags ?? []).includes(tag)) return false;
        return true;
      }),
    [region, tag]
  );

  return (
    <Section
      id="attractions"
      eyebrow="The places"
      title="Postcards from Tuscany"
      kicker="Tap a card to read its short story."
      intro="Hand-picked, region-tagged, opening-hours-checked. Hover (or tap) any card for the description, the official site, and a one-tap pin on the map."
      toned
    >
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide mb-3">
        <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
          {REGION_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setRegion(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap min-h-10 ${
                region === t.id
                  ? "bg-ink-900 text-cream-50"
                  : "bg-cream-50 border border-cream-300 text-ink-800 hover:border-terracotta-500/40"
              }`}
            >
              {t.label}
              <span className={`ml-2 text-xs ${region === t.id ? "text-cream-200" : "text-ink-700/60"}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide mb-6 sm:mb-8">
        <div className="flex items-center gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
          <span className="hidden sm:inline text-xs uppercase tracking-[0.2em] text-ink-700/60 mr-1">
            Filter
          </span>
          <button
            onClick={() => setTag(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap min-h-9 ${
              !tag
                ? "bg-terracotta-500 text-cream-50"
                : "bg-cream-50 border border-cream-300 text-ink-700 hover:border-terracotta-500/40"
            }`}
          >
            any
          </button>
          {ALL_TAGS.map(t => (
            <button
              key={t}
              onClick={() => setTag(tag === t ? null : t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap min-h-9 ${
                tag === t
                  ? "bg-terracotta-500 text-cream-50"
                  : "bg-cream-50 border border-cream-300 text-ink-700 hover:border-terracotta-500/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filtered.map(a => (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <AttractionCard poi={a} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-ink-700/70">
          No attractions match these filters.
        </div>
      )}
    </Section>
  );
}
