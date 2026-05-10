import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { attractions } from "../data/attractions";
import AttractionCard from "./AttractionCard";
import Section from "./Section";
import type { AttractionTag, Region } from "../data/types";
import { useT, type DictKey } from "../lib/dict";

type RegionFilter = "all" | Extract<Region, "north" | "south">;

const REGION_TABS: { id: RegionFilter; key: DictKey; count: number }[] = [
  { id: "all", key: "attr_filter_all", count: attractions.length },
  { id: "north", key: "attr_filter_north", count: attractions.filter(a => a.region === "north").length },
  { id: "south", key: "attr_filter_south", count: attractions.filter(a => a.region === "south").length }
];

const ALL_TAGS: AttractionTag[] = [
  "water", "extreme", "nature", "culture", "family", "view", "cave", "village"
];

const TAG_KEY: Record<string, DictKey> = {
  water: "tag_water",
  extreme: "tag_extreme",
  nature: "tag_nature",
  culture: "tag_culture",
  family: "tag_family",
  food: "tag_food",
  view: "tag_view",
  cave: "tag_cave",
  village: "tag_village"
};

export default function AttractionsGrid() {
  const t = useT();
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
      eyebrow={t("attr_eyebrow")}
      title={t("attr_title")}
      kicker={t("attr_kicker")}
      toned
    >
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide mb-3">
        <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
          {REGION_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setRegion(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap min-h-10 ${
                region === tab.id
                  ? "bg-ink-900 text-cream-50"
                  : "bg-cream-50 border border-cream-300 text-ink-800 hover:border-terracotta-500/40"
              }`}
            >
              {t(tab.key)}
              <span className={`ms-2 text-xs ${region === tab.id ? "text-cream-200" : "text-ink-700/60"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide mb-6 sm:mb-8">
        <div className="flex items-center gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
          <button
            onClick={() => setTag(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap min-h-9 ${
              !tag
                ? "bg-terracotta-500 text-cream-50"
                : "bg-cream-50 border border-cream-300 text-ink-700 hover:border-terracotta-500/40"
            }`}
          >
            {t("attr_filter_all")}
          </button>
          {ALL_TAGS.map(at => (
            <button
              key={at}
              onClick={() => setTag(tag === at ? null : at)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap min-h-9 ${
                tag === at
                  ? "bg-terracotta-500 text-cream-50"
                  : "bg-cream-50 border border-cream-300 text-ink-700 hover:border-terracotta-500/40"
              }`}
            >
              {t(TAG_KEY[at] ?? "tag_view")}
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
          {t("attr_filter_all")} — 0
        </div>
      )}
    </Section>
  );
}
