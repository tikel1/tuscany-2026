import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Car,
  Sun,
  ChevronDown,
  ExternalLink,
  Navigation,
  Plus,
  X
} from "lucide-react";
import { useState } from "react";
import type { Day, ImageCredit, POI } from "../data/types";
import { getAttraction } from "../data/attractions";
import { useMapFocus } from "../lib/mapContext";
import { formatDate, navUrl } from "../lib/nav";
import { getTripState } from "../lib/tripState";
import { activityIcon } from "../lib/activityIcon";
import PoiImage from "./PoiImage";
import PhotoCredit from "./PhotoCredit";

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
  north: "North Tuscany",
  south: "South Tuscany",
  transit: "Transit"
};

interface ResolvedLead {
  src?: string;
  alt: string;
  credit?: ImageCredit;
  category?: POI["category"];
  tags?: POI["tags"];
}

function resolveLead(day: Day): ResolvedLead {
  const fromActivity = day.activities
    .map(a => (a.attractionId ? getAttraction(a.attractionId) : undefined))
    .find(a => !!a?.image);
  if (fromActivity?.image) {
    return {
      src: fromActivity.image,
      alt: fromActivity.name,
      credit: fromActivity.imageCredit,
      category: fromActivity.category,
      tags: fromActivity.tags
    };
  }
  if (day.leadImage) {
    return {
      src: day.leadImage,
      alt: day.title,
      credit: day.leadImageCredit
    };
  }
  // Last resort: any activity attraction (with no image) — for icon hint
  const anyAtt = day.activities
    .map(a => (a.attractionId ? getAttraction(a.attractionId) : undefined))
    .find(a => !!a);
  return {
    src: undefined,
    alt: day.title,
    category: anyAtt?.category,
    tags: anyAtt?.tags
  };
}

export default function DayCard({ day }: { day: Day }) {
  const { focusOn } = useMapFocus();
  const tripState = getTripState();
  const isToday =
    tripState.phase === "during" && tripState.today.dayNumber === day.dayNumber;

  const lead = resolveLead(day);

  const [showAll, setShowAll] = useState(false);
  const previewActivities = day.activities.slice(0, 2);
  const restActivities = day.activities.slice(2);
  const hasMore = restActivities.length > 0;

  const accentText =
    day.region === "south"
      ? "text-gold-400"
      : day.region === "transit"
      ? "text-terracotta-300"
      : "text-olive-300";

  return (
    <motion.article
      id={`day-${day.dayNumber}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`group relative scroll-mt-32 rounded-3xl overflow-hidden bg-cream-50 ${
        isToday
          ? "ring-2 ring-terracotta-500 shadow-[0_30px_60px_-30px_rgba(196,90,61,0.55)]"
          : "ring-1 ring-cream-300/70 shadow-[0_18px_40px_-22px_rgba(58,28,15,0.18)] hover:shadow-[0_28px_60px_-26px_rgba(58,28,15,0.3)]"
      } transition-shadow duration-500`}
    >
      {/* Hero photo */}
      <div className="relative aspect-[21/10] sm:aspect-[21/9] overflow-hidden bg-ink-900">
        <div className="absolute inset-0 transition-transform duration-[1500ms] ease-out group-hover:scale-[1.04]">
          <PoiImage
            src={lead.src}
            alt={lead.alt}
            region={day.region === "transit" ? "north" : day.region}
            category={lead.category}
            tags={lead.tags}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/55 to-ink-900/15" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink-900/40 to-transparent" />

        {/* Photo credit (bottom-right of image) */}
        {lead.credit && (
          <div className="absolute bottom-2 right-3 px-2 py-1 rounded-full bg-ink-900/55 backdrop-blur-sm">
            <PhotoCredit credit={lead.credit} variant="light" />
          </div>
        )}

        {/* Top: chapter mark */}
        <div className="absolute top-4 sm:top-6 left-5 sm:left-8 right-5 sm:right-8 flex items-start justify-between gap-3 text-cream-50">
          <div className="flex items-baseline gap-3">
            <div className="font-serif text-3xl sm:text-4xl leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
              {ROMAN[day.dayNumber]}
            </div>
            <div className="h-px w-10 sm:w-16 bg-cream-50/40 mb-1.5" />
            <div className={`text-[10px] uppercase tracking-[0.28em] font-medium ${accentText}`}>
              Chapter {String(day.dayNumber).padStart(2, "0")}
            </div>
          </div>
          {isToday && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-terracotta-500 text-cream-50 text-[10px] uppercase tracking-[0.22em] font-bold shadow-[0_4px_18px_rgba(196,90,61,0.5)]">
              <Sun size={11} /> Today
            </div>
          )}
        </div>

        {/* Bottom: title + meta */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 text-cream-50 pr-32 sm:pr-44">
          <div className="flex items-center gap-3 text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-cream-50/85 font-medium flex-wrap">
            <span>{day.weekday}</span>
            <span aria-hidden>·</span>
            <span>{formatDate(day.date)}</span>
            <span aria-hidden>·</span>
            <span>{regionLabel[day.region]}</span>
            {day.base && (
              <>
                <span aria-hidden className="hidden sm:inline">·</span>
                <span className="hidden sm:inline-flex items-center gap-1 normal-case tracking-normal text-cream-50/85">
                  <MapPin size={11} className="opacity-70" /> {day.base}
                </span>
              </>
            )}
          </div>
          <h3 className="mt-2 font-serif text-3xl sm:text-5xl leading-[1.04] tracking-tight max-w-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            {day.title}
          </h3>
          {day.subtitle && (
            <p className="mt-2 font-serif italic text-cream-50/85 text-base sm:text-lg max-w-xl">
              {day.subtitle}
            </p>
          )}
          {day.base && (
            <div className="sm:hidden mt-3 inline-flex items-center gap-1 text-xs text-cream-50/85">
              <MapPin size={11} className="opacity-70" /> {day.base}
            </div>
          )}
        </div>
      </div>

      {/* Activity body */}
      <div className="px-5 sm:px-10 py-7 sm:py-10">
        <ol className="space-y-6 sm:space-y-8">
          {previewActivities.map((a, i) => (
            <ActivityRow
              key={i}
              activity={a}
              index={i}
              isToday={isToday}
              focusOn={focusOn}
            />
          ))}
          {showAll &&
            restActivities.map((a, i) => (
              <motion.div
                key={i + 2}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <ActivityRow
                  activity={a}
                  index={i + 2}
                  isToday={isToday}
                  focusOn={focusOn}
                />
              </motion.div>
            ))}
        </ol>

        {hasMore && (
          <div className="mt-7 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll(s => !s)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cream-100 hover:bg-terracotta-500/10 text-ink-700 hover:text-terracotta-700 text-[11px] uppercase tracking-[0.2em] font-medium transition-colors"
            >
              {showAll ? "Show less" : `Show ${restActivities.length} more`}
              <ChevronDown
                size={13}
                className={`transition-transform ${showAll ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        )}

        {day.driveNotes && (
          <div className="mt-8 sm:mt-10 pt-6 border-t border-cream-300/60 flex items-start gap-3">
            <span className="shrink-0 w-9 h-9 rounded-full bg-olive-500/10 text-olive-700 flex items-center justify-center">
              <Car size={15} />
            </span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-olive-700/80 font-medium">
                On the road
              </div>
              <p className="mt-0.5 font-serif italic text-ink-700/85 text-[15px] leading-relaxed">
                {day.driveNotes}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
}

function ActivityRow({
  activity,
  index,
  isToday,
  focusOn
}: {
  activity: Day["activities"][number];
  index: number;
  isToday: boolean;
  focusOn: (id: string) => void;
}) {
  const Icon = activityIcon(activity);
  const att = activity.attractionId ? getAttraction(activity.attractionId) : undefined;
  const [open, setOpen] = useState(false);

  // Only attractions with bonus content (or any place we want to highlight) show "Read more"
  const hasMoreInfo = !!att;

  return (
    <li className="grid grid-cols-[44px_1fr] sm:grid-cols-[60px_1fr] gap-4 sm:gap-6">
      <div className="relative">
        <div
          className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${
            isToday
              ? "bg-terracotta-500 text-cream-50"
              : "bg-cream-100 text-terracotta-600 ring-1 ring-cream-300/80"
          }`}
        >
          <Icon size={18} className="sm:w-5 sm:h-5" strokeWidth={1.6} />
        </div>
        {activity.time && (
          <div className="absolute -bottom-5 left-0 right-0 text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-ink-700/55 font-medium text-center">
            {activity.time.length > 12 ? activity.time.slice(0, 12) + "…" : activity.time}
          </div>
        )}
      </div>

      <div className="min-w-0 pt-1">
        <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
          <span className="text-[9px] uppercase tracking-[0.22em] text-ink-700/45 font-medium">
            {String(index + 1).padStart(2, "0")}
          </span>
          {activity.tag && (
            <span className="text-[9px] uppercase tracking-[0.22em] text-terracotta-600/85 font-medium">
              · {tagLabel[activity.tag] ?? activity.tag}
            </span>
          )}
        </div>
        <h4 className="mt-1 font-serif text-xl sm:text-[24px] text-ink-900 leading-snug">
          {activity.title}
        </h4>
        {activity.description && (
          <p className="mt-2 text-[14px] sm:text-[15px] text-ink-700/85 leading-relaxed">
            {activity.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          {hasMoreInfo && (
            <button
              onClick={() => setOpen(o => !o)}
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] font-medium text-terracotta-600 hover:text-terracotta-700 transition-colors"
              aria-expanded={open}
            >
              {open ? <X size={12} /> : <Plus size={12} />}
              {open ? "Hide details" : "More about this place"}
            </button>
          )}
          {att && !open && (
            <button
              onClick={() => focusOn(att.id)}
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] font-medium text-ink-700/65 hover:text-terracotta-700"
            >
              <MapPin size={12} /> On the map
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {open && att && (
            <motion.div
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mt-4 rounded-2xl bg-cream-100/80 ring-1 ring-cream-300/70 overflow-hidden grid sm:grid-cols-[180px_1fr]">
                {/* Thumbnail */}
                <div className="relative aspect-[4/3] sm:aspect-auto bg-cream-200 overflow-hidden">
                  <PoiImage
                    src={att.image}
                    alt={att.name}
                    region={att.region}
                    category={att.category}
                    tags={att.tags}
                  />
                  {att.image && att.imageCredit && (
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-ink-900/50 backdrop-blur-sm">
                      <PhotoCredit credit={att.imageCredit} variant="light" />
                    </div>
                  )}
                </div>
                {/* Body */}
                <div className="p-4 sm:p-5 flex flex-col">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-ink-700/55 font-medium">
                    About this place
                  </div>
                  <h5 className="mt-1 font-serif text-lg text-ink-900 leading-tight">
                    {att.name}
                  </h5>
                  <p className="mt-2 text-[13px] sm:text-[14px] text-ink-700/85 leading-relaxed">
                    {att.description}
                  </p>
                  {(att.openingNote || att.bookingNote) && (
                    <div className="mt-3 text-xs text-terracotta-700 bg-terracotta-500/10 border border-terracotta-500/25 rounded-lg px-3 py-2 leading-snug">
                      {att.openingNote || att.bookingNote}
                    </div>
                  )}
                  <div className="mt-auto pt-4 flex flex-wrap gap-x-4 gap-y-2">
                    {att.website && (
                      <a
                        href={att.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="icon-link"
                      >
                        <ExternalLink size={12} /> Website
                      </a>
                    )}
                    <a
                      href={navUrl(att.coords)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-link"
                    >
                      <Navigation size={12} /> Navigate
                    </a>
                    <button onClick={() => focusOn(att.id)} className="icon-link">
                      <MapPin size={12} /> Show on the map
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </li>
  );
}
