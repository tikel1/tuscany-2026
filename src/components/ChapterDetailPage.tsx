import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Car,
  Sun,
  ExternalLink,
  Navigation,
  Plus,
  X,
  Lightbulb,
  AlertTriangle,
  AlertOctagon,
  Info
} from "lucide-react";
import { itinerary } from "../data/itinerary";
import { getAttraction } from "../data/attractions";
import type { Day, DayActivity, ImageCredit, POI, Tip } from "../data/types";
import { formatDate, navUrl } from "../lib/nav";
import { getTripState } from "../lib/tripState";
import { activityIcon } from "../lib/activityIcon";
import { tipsForDay } from "../lib/tipsForDay";
import { navigateChapter, navigateHome, rememberChapter } from "../lib/route";
import PoiImage from "./PoiImage";
import PhotoCredit from "./PhotoCredit";
import MiniMap from "./MiniMap";

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

const SEVERITY_STYLES: Record<
  Tip["severity"],
  { Icon: typeof Info; ring: string; bg: string; text: string; label: string }
> = {
  critical: {
    Icon: AlertOctagon,
    ring: "ring-terracotta-500/40",
    bg: "bg-terracotta-500/10",
    text: "text-terracotta-700",
    label: "Critical"
  },
  warning: {
    Icon: AlertTriangle,
    ring: "ring-gold-500/45",
    bg: "bg-gold-500/10",
    text: "text-gold-700",
    label: "Heads up"
  },
  info: {
    Icon: Lightbulb,
    ring: "ring-olive-500/40",
    bg: "bg-olive-500/10",
    text: "text-olive-700",
    label: "Good to know"
  }
};

export default function ChapterDetailPage({ dayNumber }: { dayNumber: number }) {
  const day = useMemo(
    () => itinerary.find(d => d.dayNumber === dayNumber),
    [dayNumber]
  );

  // Scroll to top + remember this chapter so going Back to the plan re-opens it
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    rememberChapter(dayNumber);
  }, [dayNumber]);

  if (!day) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="font-serif text-2xl text-ink-900">Chapter not found</div>
          <button
            type="button"
            onClick={() => navigateHome({ scrollToTrip: true })}
            className="mt-4 inline-flex items-center gap-2 text-terracotta-600 hover:text-terracotta-700"
          >
            <ArrowLeft size={16} /> Back to the plan
          </button>
        </div>
      </div>
    );
  }

  const tripState = getTripState();
  const isToday =
    tripState.phase === "during" && tripState.today.dayNumber === day.dayNumber;
  const lead = resolveLead(day);
  const tips = tipsForDay(day.dayNumber);

  // POIs visited this day, in order
  const dayPois: POI[] = day.activities
    .map(a => (a.attractionId ? getAttraction(a.attractionId) : undefined))
    .filter((p): p is POI => !!p);

  const accent =
    day.region === "south"
      ? "text-gold-400"
      : day.region === "transit"
      ? "text-terracotta-300"
      : "text-olive-300";

  const prevDay = day.dayNumber > 1 ? itinerary[day.dayNumber - 2] : null;
  const nextDay =
    day.dayNumber < itinerary.length ? itinerary[day.dayNumber] : null;

  return (
    <div className="min-h-screen bg-cream-100/40">
      {/* Sticky back bar */}
      <div className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-cream-300/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigateHome({ scrollToTrip: true })}
            className="inline-flex items-center gap-2 text-ink-800 hover:text-terracotta-600 transition-colors min-h-11 -ml-2 px-2 rounded-full"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">
              <span className="hidden sm:inline">Back to </span>the plan
            </span>
          </button>
          <div className="hidden sm:block text-[11px] uppercase tracking-[0.22em] text-ink-700/55 font-medium">
            Chapter {String(day.dayNumber).padStart(2, "0")} / {String(itinerary.length).padStart(2, "0")}
          </div>
        </div>
      </div>

      <article>
        {/* Hero */}
        <header className="relative aspect-[16/10] sm:aspect-[21/9] max-h-[70vh] overflow-hidden bg-ink-900">
          <motion.div
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <PoiImage
              src={lead.src}
              alt={lead.alt}
              region={day.region === "transit" ? "north" : day.region}
              category={lead.category}
              tags={lead.tags}
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/55 to-ink-900/15" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink-900/40 to-transparent" />

          {lead.credit && (
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-ink-900/55 backdrop-blur-sm">
              <PhotoCredit credit={lead.credit} variant="light" />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 px-4 sm:px-10 pb-6 sm:pb-12 text-cream-50">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-baseline gap-3 sm:gap-4">
                <div className="font-serif text-3xl sm:text-5xl leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
                  {ROMAN[day.dayNumber]}
                </div>
                <div className="hidden sm:block h-px w-16 bg-cream-50/40 mb-2" />
                <div className={`text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-medium ${accent}`}>
                  Chapter {String(day.dayNumber).padStart(2, "0")}
                </div>
                {isToday && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-terracotta-500 text-cream-50 text-[9px] uppercase tracking-[0.22em] font-bold shadow-[0_4px_18px_rgba(196,90,61,0.5)]">
                    <Sun size={10} /> Today
                  </span>
                )}
              </div>

              <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[12px] uppercase tracking-[0.22em] text-cream-50/85 font-medium flex-wrap">
                <span>{day.weekday}</span>
                <span aria-hidden>·</span>
                <span>{formatDate(day.date)}</span>
                <span aria-hidden>·</span>
                <span>{regionLabel[day.region]}</span>
                {day.base && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="inline-flex items-center gap-1 normal-case tracking-normal text-cream-50/85">
                      <MapPin size={11} className="opacity-70" /> {day.base}
                    </span>
                  </>
                )}
              </div>

              <h1 className="mt-2 sm:mt-3 font-serif text-3xl sm:text-6xl leading-[1.05] tracking-tight max-w-3xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                {day.title}
              </h1>
              {day.subtitle && (
                <p className="mt-2 sm:mt-3 font-serif italic text-cream-50/85 text-base sm:text-xl max-w-2xl">
                  {day.subtitle}
                </p>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 sm:space-y-16">
          {/* Activities */}
          <section>
            <SectionLabel eyebrow="Today's plan" title="Hour by hour" />
            <ol className="mt-6 sm:mt-8 space-y-5 sm:space-y-8">
              {day.activities.map((a, i) => (
                <ActivityRow key={i} activity={a} index={i} isToday={isToday} />
              ))}
            </ol>

            {day.driveNotes && (
              <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-cream-300/60 flex items-start gap-3">
                <span className="shrink-0 w-10 h-10 rounded-full bg-olive-500/10 text-olive-700 flex items-center justify-center">
                  <Car size={16} />
                </span>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-olive-700/80 font-medium">
                    On the road
                  </div>
                  <p className="mt-0.5 font-serif italic text-ink-700/85 text-[15px] sm:text-base leading-relaxed">
                    {day.driveNotes}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Mini map */}
          {dayPois.length > 0 && (
            <section>
              <SectionLabel eyebrow="On the map" title="The day's stops" />
              <p className="mt-2 mb-5 sm:mb-6 font-serif italic text-ink-700/70 text-[14.5px] sm:text-base">
                Numbered in the order you'll visit them.
              </p>
              <MiniMap pois={dayPois} />
              <ol className="mt-4 grid sm:grid-cols-2 gap-2.5">
                {dayPois.map((p, i) => (
                  <li
                    key={p.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-cream-50 ring-1 ring-cream-300/70"
                  >
                    <span className="shrink-0 w-7 h-7 rounded-full bg-terracotta-500 text-cream-50 flex items-center justify-center text-xs font-semibold">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-serif text-[15px] text-ink-900 leading-tight">
                        {p.name}
                      </div>
                      {p.address && (
                        <div className="text-[12px] text-ink-700/60 mt-0.5 leading-snug">
                          {p.address}
                        </div>
                      )}
                      <a
                        href={navUrl(p.coords)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-terracotta-600 hover:text-terracotta-700 mt-1.5 font-medium"
                      >
                        <Navigation size={11} /> Navigate
                      </a>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Tips */}
          {tips.length > 0 && (
            <section>
              <SectionLabel eyebrow="Things to know" title="Tips for this chapter" />
              <ul className="mt-6 sm:mt-8 space-y-3.5">
                {tips.map(tip => {
                  const s = SEVERITY_STYLES[tip.severity];
                  const Icon = s.Icon;
                  return (
                    <li
                      key={tip.id}
                      className={`relative pl-12 sm:pl-14 pr-4 sm:pr-5 py-4 sm:py-5 rounded-2xl bg-cream-50 ring-1 ${s.ring}`}
                    >
                      <span
                        className={`absolute left-3 sm:left-4 top-4 sm:top-5 w-7 h-7 rounded-full ${s.bg} ${s.text} flex items-center justify-center`}
                      >
                        <Icon size={14} />
                      </span>
                      <div
                        className={`text-[10px] uppercase tracking-[0.22em] font-medium ${s.text}`}
                      >
                        {s.label}
                      </div>
                      <h4 className="mt-0.5 font-serif text-[16px] sm:text-lg text-ink-900 leading-snug">
                        {tip.title}
                      </h4>
                      <p className="mt-1.5 text-[13.5px] sm:text-[14.5px] text-ink-700/85 leading-relaxed">
                        {tip.body}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        {/* Prev / Next chapter nav */}
        <nav className="border-t border-cream-300/60 bg-cream-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-2 gap-3 sm:gap-6">
            {prevDay ? (
              <button
                type="button"
                onClick={() => navigateChapter(prevDay.dayNumber)}
                className="group flex items-center gap-3 sm:gap-4 text-left p-3 sm:p-5 rounded-2xl ring-1 ring-cream-300/70 hover:ring-terracotta-500/60 hover:bg-cream-100/60 transition-all"
              >
                <span className="shrink-0 w-10 h-10 rounded-full bg-cream-100 text-ink-800 flex items-center justify-center group-hover:bg-terracotta-500 group-hover:text-cream-50 transition-colors">
                  <ChevronLeft size={18} />
                </span>
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-ink-700/55 font-medium">
                    Previous · {ROMAN[prevDay.dayNumber]}
                  </div>
                  <div className="mt-0.5 font-serif text-[14px] sm:text-base text-ink-900 leading-tight line-clamp-2">
                    {prevDay.title}
                  </div>
                </div>
              </button>
            ) : (
              <div />
            )}
            {nextDay ? (
              <button
                type="button"
                onClick={() => navigateChapter(nextDay.dayNumber)}
                className="group flex items-center gap-3 sm:gap-4 text-right p-3 sm:p-5 rounded-2xl ring-1 ring-cream-300/70 hover:ring-terracotta-500/60 hover:bg-cream-100/60 transition-all justify-end"
              >
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-ink-700/55 font-medium">
                    Next · {ROMAN[nextDay.dayNumber]}
                  </div>
                  <div className="mt-0.5 font-serif text-[14px] sm:text-base text-ink-900 leading-tight line-clamp-2">
                    {nextDay.title}
                  </div>
                </div>
                <span className="shrink-0 w-10 h-10 rounded-full bg-cream-100 text-ink-800 flex items-center justify-center group-hover:bg-terracotta-500 group-hover:text-cream-50 transition-colors">
                  <ChevronRight size={18} />
                </span>
              </button>
            ) : (
              <div />
            )}
          </div>
        </nav>
      </article>
    </div>
  );
}

function SectionLabel({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.32em] text-terracotta-600/85 font-medium">
        {eyebrow}
      </div>
      <h2 className="mt-1 font-serif text-2xl sm:text-3xl text-ink-900 leading-tight">
        {title}
      </h2>
    </div>
  );
}

function ActivityRow({
  activity,
  index,
  isToday
}: {
  activity: DayActivity;
  index: number;
  isToday: boolean;
}) {
  const Icon = activityIcon(activity);
  const att = activity.attractionId ? getAttraction(activity.attractionId) : undefined;
  const [open, setOpen] = useState(false);
  const hasMoreInfo = !!att;

  return (
    <li className="grid grid-cols-[40px_1fr] sm:grid-cols-[64px_1fr] gap-3 sm:gap-6">
      <div className="relative">
        <div
          className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${
            isToday
              ? "bg-terracotta-500 text-cream-50"
              : "bg-cream-100 text-terracotta-600 ring-1 ring-cream-300/80"
          }`}
        >
          <Icon size={16} className="sm:w-5 sm:h-5" strokeWidth={1.7} />
        </div>
        {activity.time && (
          <div className="absolute -bottom-4 sm:-bottom-5 left-0 right-0 text-[8px] sm:text-[10px] uppercase tracking-[0.16em] sm:tracking-[0.18em] text-ink-700/55 font-medium text-center">
            {activity.time.length > 10 ? activity.time.slice(0, 10) + "…" : activity.time}
          </div>
        )}
      </div>

      <div className="min-w-0 pt-0.5 sm:pt-1">
        <div className="flex items-baseline flex-wrap gap-x-2.5 gap-y-1">
          <span className="text-[9px] uppercase tracking-[0.22em] text-ink-700/45 font-medium">
            {String(index + 1).padStart(2, "0")}
          </span>
          {activity.tag && (
            <span className="text-[9px] uppercase tracking-[0.22em] text-terracotta-600/85 font-medium">
              · {tagLabel[activity.tag] ?? activity.tag}
            </span>
          )}
        </div>
        <h4 className="mt-1 font-serif text-[18px] sm:text-[24px] text-ink-900 leading-snug">
          {activity.title}
        </h4>
        {activity.description && (
          <p className="mt-1.5 sm:mt-2 text-[14px] sm:text-[15.5px] text-ink-700/85 leading-relaxed">
            {activity.description}
          </p>
        )}

        {hasMoreInfo && (
          <button
            onClick={() => setOpen(o => !o)}
            className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] font-medium text-terracotta-600 hover:text-terracotta-700 transition-colors"
            aria-expanded={open}
          >
            {open ? <X size={12} /> : <Plus size={12} />}
            {open ? "Hide details" : "More about this place"}
          </button>
        )}

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
              <div className="mt-4 rounded-2xl bg-cream-100/80 ring-1 ring-cream-300/70 overflow-hidden grid sm:grid-cols-[200px_1fr]">
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
                <div className="p-4 sm:p-5 flex flex-col">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-ink-700/55 font-medium">
                    About this place
                  </div>
                  <h5 className="mt-1 font-serif text-lg text-ink-900 leading-tight">
                    {att.name}
                  </h5>
                  <p className="mt-2 text-[13.5px] sm:text-[14.5px] text-ink-700/85 leading-relaxed">
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
