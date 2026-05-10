import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wheat,
  Soup,
  UtensilsCrossed,
  Cookie,
  Wine,
  Coffee,
  ExternalLink,
  Navigation,
  CalendarCheck,
  Grape
} from "lucide-react";
import { dishes } from "../data/dishes";
import { wineries } from "../data/wineries";
import Section from "./Section";
import { useT, type DictKey } from "../lib/dict";
import { useLocalizeDish, useLocalizeWinery } from "../data/i18n";
import { navUrl } from "../lib/nav";
import type { DishCategory } from "../data/types";

type RegionFilter = "north" | "south" | "tuscany";

const REGION_TABS: { id: RegionFilter; key: DictKey }[] = [
  { id: "north", key: "food_filter_north" },
  { id: "south", key: "food_filter_south" },
  { id: "tuscany", key: "food_filter_tuscany" }
];

const CATEGORY_META: Record<
  DishCategory,
  { Icon: typeof Soup; key: DictKey; tone: string }
> = {
  pasta: { Icon: Wheat, key: "food_dish_pasta", tone: "text-terracotta-600" },
  starter: { Icon: Soup, key: "food_dish_starter", tone: "text-olive-600" },
  main: { Icon: UtensilsCrossed, key: "food_dish_main", tone: "text-sienna-600" },
  dessert: { Icon: Cookie, key: "food_dish_dessert", tone: "text-gold-500" },
  drink: { Icon: Coffee, key: "food_dish_drink", tone: "text-ink-700" },
  snack: { Icon: Cookie, key: "food_dish_snack", tone: "text-gold-500" }
};

export default function FoodAndWineSection() {
  const t = useT();
  const localizeDish = useLocalizeDish();
  const localizeWinery = useLocalizeWinery();
  const [region, setRegion] = useState<RegionFilter>("north");

  const visibleDishes = useMemo(() => {
    // For "north" / "south" we surface dishes flagged for that region
    // *plus* the "tuscany" all-rounders, since they're served everywhere.
    // For "tuscany", show only the all-rounders.
    if (region === "tuscany") return dishes.filter(d => d.region === "tuscany");
    return dishes.filter(d => d.region === region || d.region === "tuscany");
  }, [region]);

  const visibleWineries = useMemo(
    () => wineries.filter(w => region === "tuscany" || w.region === region),
    [region]
  );

  return (
    <Section
      id="food"
      eyebrow={t("food_eyebrow")}
      title={t("food_title")}
      kicker={t("food_kicker")}
      toned
    >
      {/* Region selector — same shape as the Services tabs for visual harmony */}
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide mb-6 sm:mb-8">
        <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
          {REGION_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setRegion(tab.id)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap min-h-11 ${
                region === tab.id
                  ? "bg-ink-900 text-cream-50"
                  : "bg-cream-50 border border-cream-300 text-ink-800 hover:border-terracotta-500/40"
              }`}
            >
              {t(tab.key)}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={region}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="grid gap-8 lg:grid-cols-[1.4fr_1fr]"
        >
          {/* ============== DISHES ============== */}
          <div>
            <SubSectionHeader
              Icon={UtensilsCrossed}
              label={t("food_dishes_label")}
              count={visibleDishes.length}
            />
            <ul className="mt-5 grid sm:grid-cols-2 gap-4">
              {visibleDishes.map(rawDish => {
                const dish = localizeDish(rawDish);
                const meta = CATEGORY_META[dish.category];
                const Icon = meta.Icon;
                return (
                  <li
                    key={dish.id}
                    className="card-paper p-4 sm:p-5 flex flex-col"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`shrink-0 w-9 h-9 rounded-full bg-cream-100 flex items-center justify-center ${meta.tone}`}
                      >
                        <Icon size={16} strokeWidth={1.7} />
                      </span>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-ink-700/55 font-medium">
                        {t(meta.key)}
                      </div>
                    </div>
                    <h4 className="mt-3 font-serif text-[20px] sm:text-[22px] text-ink-900 leading-tight">
                      {dish.name}
                    </h4>
                    {dish.italianName && (
                      <div className="mt-0.5 font-serif italic text-terracotta-700/85 text-[13.5px]">
                        {dish.italianName}
                      </div>
                    )}
                    <p className="mt-2.5 text-[13.5px] sm:text-[14.5px] text-ink-700/85 leading-relaxed">
                      {dish.description}
                    </p>
                    {dish.tryIt && (
                      <div className="mt-3 pt-3 border-t border-cream-300/70 text-[12px] text-ink-700/75">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-olive-700 font-medium me-1.5">
                          {t("food_try_it")}
                        </span>
                        {dish.tryIt}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ============== WINERIES ============== */}
          <div>
            <SubSectionHeader
              Icon={Wine}
              label={t("food_wineries_label")}
              count={visibleWineries.length}
            />
            <ul className="mt-5 space-y-4">
              {visibleWineries.map(rawW => {
                const w = localizeWinery(rawW);
                return (
                  <li
                    key={w.id}
                    className="card-paper p-4 sm:p-5 border-s-4 border-terracotta-500/45"
                  >
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 w-9 h-9 rounded-full bg-terracotta-500/10 text-terracotta-700 flex items-center justify-center">
                        <Grape size={16} strokeWidth={1.7} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-serif text-[19px] sm:text-[20px] text-ink-900 leading-tight">
                          {w.name}
                        </h4>
                        <div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-olive-700 font-medium">
                          {t("food_appellation")} · {w.appellation}
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-[13.5px] sm:text-[14px] text-ink-700/85 leading-relaxed">
                      {w.description}
                    </p>
                    {w.address && (
                      <div className="mt-2 text-[12px] text-ink-700/55">
                        {w.address}
                      </div>
                    )}
                    {w.bookingNote && (
                      <div className="mt-3 text-[12px] text-terracotta-700 bg-terracotta-500/10 border border-terracotta-500/25 rounded-lg px-3 py-2 leading-snug flex items-start gap-2">
                        <CalendarCheck
                          size={13}
                          className="mt-[1px] shrink-0"
                        />
                        <span>{w.bookingNote}</span>
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-cream-300/70 flex flex-wrap gap-x-4 gap-y-1.5">
                      {w.website && (
                        <a
                          href={w.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="icon-link"
                        >
                          <ExternalLink size={12} /> {t("website")}
                        </a>
                      )}
                      {w.coords && (
                        <a
                          href={navUrl(w.coords)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="icon-link"
                        >
                          <Navigation size={12} /> {t("navigate")}
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
              {visibleWineries.length === 0 && (
                <li className="text-center text-ink-700/60 py-10">—</li>
              )}
            </ul>
          </div>
        </motion.div>
      </AnimatePresence>
    </Section>
  );
}

function SubSectionHeader({
  Icon,
  label,
  count
}: {
  Icon: typeof UtensilsCrossed;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-baseline gap-3 border-b border-cream-300/70 pb-3">
      <span className="shrink-0 w-8 h-8 rounded-full bg-terracotta-500/10 text-terracotta-700 flex items-center justify-center self-center">
        <Icon size={15} strokeWidth={1.8} />
      </span>
      <h3 className="font-serif text-[22px] sm:text-2xl text-ink-900 leading-tight">
        {label}
      </h3>
      <span className="ms-auto text-[11px] uppercase tracking-[0.22em] text-ink-700/55 font-medium">
        {count}
      </span>
    </div>
  );
}
