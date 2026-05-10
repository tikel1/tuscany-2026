import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  MapPin,
  Plus,
  X,
  Lightbulb,
  Activity
} from "lucide-react";
import type { Difficulty, POI } from "../data/types";
import { useMapFocus } from "../lib/mapContext";
import NavigateLinks from "./NavigateLinks";
import { useT, type DictKey } from "../lib/dict";
import { useLocalizePoi } from "../data/i18n";
import PoiImage from "./PoiImage";

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

/** Tone for the difficulty pill — green for easy, amber for moderate,
 *  terracotta for challenging. */
const DIFFICULTY_STYLE: Record<
  Difficulty,
  { dotClass: string; textClass: string; bgClass: string; key: DictKey }
> = {
  easy: {
    dotClass: "bg-olive-500",
    textClass: "text-olive-700",
    bgClass: "bg-olive-500/12",
    key: "difficulty_easy"
  },
  moderate: {
    dotClass: "bg-gold-500",
    textClass: "text-sienna-600",
    bgClass: "bg-gold-400/15",
    key: "difficulty_moderate"
  },
  challenging: {
    dotClass: "bg-terracotta-500",
    textClass: "text-terracotta-700",
    bgClass: "bg-terracotta-500/12",
    key: "difficulty_challenging"
  }
};

export default function AttractionCard({ poi: rawPoi }: { poi: POI }) {
  const t = useT();
  const localizePoi = useLocalizePoi();
  const poi = localizePoi(rawPoi);
  const { focusOn } = useMapFocus();
  const [open, setOpen] = useState(false);

  const isSouth = poi.region === "south";
  const regionLabel = isSouth ? t("region_south_short") : t("region_north_short");
  const regionLong = isSouth ? t("region_south_long") : t("region_north_long");
  const firstTag = poi.tags?.[0];

  return (
    <article
      className="group relative overflow-hidden rounded-2xl bg-ink-900 shadow-[0_2px_10px_rgba(58,28,15,0.08)] hover:shadow-[0_18px_40px_rgba(58,28,15,0.18)] transition-shadow duration-500"
      onMouseLeave={() => setOpen(false)}
    >
      {/* Photo, 4:5 portrait */}
      <div className="aspect-[4/5] overflow-hidden">
        <div className="w-full h-full transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]">
          <PoiImage
            src={poi.image}
            alt={poi.name}
            region={poi.region}
            category={poi.category}
            tags={poi.tags}
          />
        </div>
      </div>

      {/* Top corner: region badge */}
      <div className="absolute top-3 start-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink-900/55 backdrop-blur-md text-cream-50 text-[10px] uppercase tracking-[0.18em] font-medium">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isSouth ? "bg-gold-500" : "bg-olive-500"
          }`}
        />
        {regionLabel}
      </div>

      {/* Top corner: first tag + difficulty pill (stacked) */}
      <div className="absolute top-3 end-3 flex flex-col items-end gap-1.5">
        {firstTag && (
          <div className="px-2.5 py-1 rounded-full bg-cream-50/90 text-ink-900 text-[10px] uppercase tracking-[0.16em] font-medium">
            {t(TAG_KEY[firstTag] ?? "tag_view")}
          </div>
        )}
        {poi.difficulty && (
          <div
            className={`px-2.5 py-1 rounded-full bg-cream-50/90 ${DIFFICULTY_STYLE[poi.difficulty].textClass} text-[10px] uppercase tracking-[0.16em] font-medium flex items-center gap-1.5`}
            title={t("difficulty_label")}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_STYLE[poi.difficulty].dotClass}`}
              aria-hidden
            />
            {t(DIFFICULTY_STYLE[poi.difficulty].key)}
          </div>
        )}
      </div>

      {/* Bottom gradient + title (always visible) */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none">
        <div className="h-40 bg-gradient-to-t from-ink-900/95 via-ink-900/60 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 px-4 sm:px-5 pb-4 sm:pb-5 text-cream-50">
        <h3 className="font-serif text-2xl sm:text-[26px] leading-[1.05] drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
          {poi.name}
        </h3>
        {poi.shortDescription && (
          <p className="mt-1.5 text-[13px] text-cream-50/85 leading-snug line-clamp-2">
            {poi.shortDescription}
          </p>
        )}

        {/* Toggle (mobile + always-visible affordance) */}
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] font-medium text-cream-50/90 hover:text-cream-50 transition"
            aria-expanded={open}
          >
            {open ? (
              <>
                <X size={13} /> {t("hide_details")}
              </>
            ) : (
              <>
                <Plus size={13} /> {t("read_more")}
              </>
            )}
          </button>
          <button
            onClick={() => focusOn(poi.id)}
            className="text-[11px] uppercase tracking-[0.16em] font-medium text-cream-50/85 hover:text-cream-50 transition flex items-center gap-1.5"
            aria-label={`${t("show_on_map")}: ${poi.name}`}
          >
            <MapPin size={13} /> {t("on_the_map_short")}
          </button>
        </div>
      </div>

      {/* Reveal panel: slides up on hover/tap */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="reveal"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="absolute inset-0 bg-cream-50 text-ink-900 flex flex-col"
          >
            <div className="px-5 pt-5 pb-4 border-b border-cream-300/70">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-ink-700/60 font-medium">
                    {regionLong}
                  </div>
                  <h3 className="mt-1 font-serif text-2xl text-ink-900 leading-tight">
                    {poi.name}
                  </h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="shrink-0 p-1.5 rounded-full hover:bg-cream-200 transition"
                  aria-label={t("hide_details")}
                >
                  <X size={18} />
                </button>
              </div>
              {poi.tags && poi.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {poi.tags.map(tg => (
                    <span
                      key={tg}
                      className="text-[10px] uppercase tracking-[0.16em] text-ink-700/70"
                    >
                      · {t(TAG_KEY[tg] ?? "tag_view")}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 py-4 overflow-y-auto flex-1">
              {poi.difficulty && (
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3 text-[10px] uppercase tracking-[0.18em] font-medium ${DIFFICULTY_STYLE[poi.difficulty].bgClass} ${DIFFICULTY_STYLE[poi.difficulty].textClass}`}
                >
                  <Activity size={11} strokeWidth={2} />
                  <span>{t("difficulty_label")}</span>
                  <span className="opacity-60" aria-hidden>·</span>
                  <span>{t(DIFFICULTY_STYLE[poi.difficulty].key)}</span>
                </div>
              )}
              <p className="text-[14px] leading-relaxed text-ink-700/90">
                {poi.description}
              </p>
              {(poi.openingNote || poi.bookingNote) && (
                <div className="mt-4 text-xs text-terracotta-700 bg-terracotta-500/10 border border-terracotta-500/25 rounded-lg px-3 py-2 leading-snug">
                  {poi.openingNote || poi.bookingNote}
                </div>
              )}
              {poi.tips && poi.tips.length > 0 && (
                <div className="mt-5 pt-4 border-t border-cream-300/70">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-olive-700 font-medium">
                    <Lightbulb size={12} strokeWidth={1.9} />
                    {t("insider_tips_label")}
                  </div>
                  <ul className="mt-2.5 space-y-1.5">
                    {poi.tips.map((tip, i) => (
                      <li
                        key={i}
                        className="text-[13px] leading-snug text-ink-700/85 flex gap-2"
                      >
                        <span
                          className="shrink-0 mt-[6px] w-1.5 h-1.5 rounded-full bg-terracotta-500/70"
                          aria-hidden
                        />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-cream-300/70 flex flex-wrap items-center gap-x-4 gap-y-2 bg-cream-100/80">
              {poi.website && (
                <a href={poi.website} target="_blank" rel="noopener noreferrer" className="icon-link">
                  <ExternalLink size={13} /> {t("website")}
                </a>
              )}
              <NavigateLinks coords={poi.coords} size={13} />
              <button onClick={() => focusOn(poi.id)} className="icon-link">
                <MapPin size={13} /> {t("on_the_map_short")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
