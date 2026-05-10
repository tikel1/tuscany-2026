import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
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
  Info,
  Activity,
  Backpack,
  StickyNote,
  Quote,
  Volume2
} from "lucide-react";
import { itinerary } from "../data/itinerary";
import { getAttraction } from "../data/attractions";
import type {
  Day,
  DayActivity,
  Difficulty,
  ImageCredit,
  POI,
  Tip
} from "../data/types";
import { navUrl } from "../lib/nav";
import { getTripState } from "../lib/tripState";
import { activityIcon } from "../lib/activityIcon";
import { tipsForDay } from "../lib/tipsForDay";
import { navigateChapter, navigateHome, rememberChapter } from "../lib/route";
import { useT, localizeShortDate, localizeWeekday, type DictKey } from "../lib/dict";
import { useLang } from "../lib/i18n";
import { useLocalizeDay, useLocalizePoi, useLocalizeTip } from "../data/i18n";
import PoiImage from "./PoiImage";
import PhotoCredit from "./PhotoCredit";
import MiniMap from "./MiniMap";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

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

const REGION_KEY: Record<string, DictKey> = {
  north: "region_north_long",
  south: "region_south_long",
  transit: "region_transit_long"
};

interface ResolvedLead {
  src?: string;
  alt: string;
  credit?: ImageCredit;
  category?: POI["category"];
  tags?: POI["tags"];
}

interface ChapterSlide {
  src: string;
  alt: string;
  /** Place name shown over the photo in italics (the attraction's name) */
  place?: string;
  credit?: ImageCredit;
  category?: POI["category"];
  tags?: POI["tags"];
}

/** Single fallback (used when no slides exist) — keeps the placeholder
 *  gradient looking like the original day. */
function resolveLead(day: Day, getPoi: (p: POI) => POI): ResolvedLead {
  const fromActivity = day.activities
    .map(a => (a.attractionId ? getAttraction(a.attractionId) : undefined))
    .find(a => !!a?.image);
  if (fromActivity?.image) {
    const local = getPoi(fromActivity);
    return {
      src: fromActivity.image,
      alt: local.name,
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

/** Build the ordered list of carousel slides for this day:
 *  every attraction with a photo (in itinerary order), plus the day's
 *  explicit leadImage if it isn't already in the set. Deduplicated by src. */
function resolveSlides(day: Day, getPoi: (p: POI) => POI): ChapterSlide[] {
  const slides: ChapterSlide[] = [];
  const seen = new Set<string>();
  for (const a of day.activities) {
    if (!a.attractionId) continue;
    const att = getAttraction(a.attractionId);
    if (!att?.image || seen.has(att.image)) continue;
    const local = getPoi(att);
    seen.add(att.image);
    slides.push({
      src: att.image,
      alt: local.name,
      place: local.name,
      credit: att.imageCredit,
      category: att.category,
      tags: att.tags
    });
  }
  if (day.leadImage && !seen.has(day.leadImage)) {
    slides.push({
      src: day.leadImage,
      alt: day.title,
      credit: day.leadImageCredit
    });
  }
  return slides;
}

const SLIDE_DURATION_MS = 6500;

const DIFFICULTY_DETAIL_STYLE: Record<
  Difficulty,
  { dot: string; text: string; bg: string; key: DictKey }
> = {
  easy: {
    dot: "bg-olive-500",
    text: "text-olive-700",
    bg: "bg-olive-500/12",
    key: "difficulty_easy"
  },
  moderate: {
    dot: "bg-gold-500",
    text: "text-sienna-600",
    bg: "bg-gold-400/15",
    key: "difficulty_moderate"
  },
  challenging: {
    dot: "bg-terracotta-500",
    text: "text-terracotta-700",
    bg: "bg-terracotta-500/12",
    key: "difficulty_challenging"
  }
};

const SEVERITY_STYLES: Record<
  Tip["severity"],
  { Icon: typeof Info; ring: string; bg: string; text: string; labelKey: DictKey }
> = {
  critical: {
    Icon: AlertOctagon,
    ring: "ring-terracotta-500/40",
    bg: "bg-terracotta-500/10",
    text: "text-terracotta-700",
    labelKey: "severity_critical"
  },
  warning: {
    Icon: AlertTriangle,
    ring: "ring-gold-500/45",
    bg: "bg-gold-500/10",
    text: "text-gold-700",
    labelKey: "severity_warning"
  },
  info: {
    Icon: Lightbulb,
    ring: "ring-olive-500/40",
    bg: "bg-olive-500/10",
    text: "text-olive-700",
    labelKey: "severity_info"
  }
};

export default function ChapterDetailPage({ dayNumber }: { dayNumber: number }) {
  const t = useT();
  const { lang } = useLang();
  const isRTL = lang === "he";
  const localizeDay = useLocalizeDay();
  const localizePoi = useLocalizePoi();
  const localizeTip = useLocalizeTip();

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
          <div className="font-serif text-2xl text-ink-900">{lang === "he" ? "פרק לא נמצא" : "Chapter not found"}</div>
          <button
            type="button"
            onClick={() => navigateHome({ scrollToTrip: true })}
            className="mt-4 inline-flex items-center gap-2 text-terracotta-600 hover:text-terracotta-700"
          >
            {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />} {t("back_to_plan")}
          </button>
        </div>
      </div>
    );
  }

  const localDay = localizeDay(day);
  const tripState = getTripState();
  const isToday =
    tripState.phase === "during" && tripState.today.dayNumber === day.dayNumber;
  const lead = resolveLead(localDay, localizePoi);
  const slides = useMemo(
    () => resolveSlides(day, localizePoi),
    [day, localizePoi]
  );
  const [slideIdx, setSlideIdx] = useState(0);

  // Reset to the first slide whenever we land on a new chapter
  useEffect(() => {
    setSlideIdx(0);
  }, [day.dayNumber]);

  // Auto-advance the hero carousel (only if we have more than one slide)
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setSlideIdx(i => (i + 1) % slides.length);
    }, SLIDE_DURATION_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  // Lazy-preload the upcoming slide so the crossfade is seamless
  useEffect(() => {
    if (slides.length <= 1) return;
    const next = slides[(slideIdx + 1) % slides.length];
    if (next?.src) {
      const img = new Image();
      img.src = next.src;
    }
  }, [slideIdx, slides]);

  const currentSlide = slides[slideIdx];
  const tips = tipsForDay(day.dayNumber).map(localizeTip);

  // POIs visited this day, in order, localized
  const dayPois: POI[] = day.activities
    .map(a => (a.attractionId ? getAttraction(a.attractionId) : undefined))
    .filter((p): p is POI => !!p)
    .map(localizePoi);

  /* Lookup table for the per-day pack list: when a gear item references a
     specific attraction (`for: "canyon-park"`) we need its localized name
     for the small chip and a way to scroll to that activity row. */
  const attractionNameById = new Map<string, string>(
    dayPois.map(p => [p.id, p.name])
  );
  const scrollToActivity = (attractionId: string) => {
    const el = document.getElementById(`activity-${attractionId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const accent =
    day.region === "south"
      ? "text-gold-400"
      : day.region === "transit"
      ? "text-terracotta-300"
      : "text-olive-300";

  const prevDay = day.dayNumber > 1 ? itinerary[day.dayNumber - 2] : null;
  const nextDay =
    day.dayNumber < itinerary.length ? itinerary[day.dayNumber] : null;
  const localPrevDay = prevDay ? localizeDay(prevDay) : null;
  const localNextDay = nextDay ? localizeDay(nextDay) : null;

  return (
    <div className="min-h-screen bg-cream-100/40">
      {/* Sticky back bar */}
      <div className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-cream-300/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigateHome({ scrollToTrip: true })}
            className="inline-flex items-center gap-2 text-ink-800 hover:text-terracotta-600 transition-colors min-h-11 -ms-2 px-2 rounded-full"
          >
            {isRTL ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            <span className="text-sm font-medium">{t("back_to_plan")}</span>
          </button>
          <div className="hidden sm:block text-[11px] uppercase tracking-[0.22em] text-ink-700/55 font-medium">
            {t("plan_chapter_x_of_y", {
              x: String(day.dayNumber).padStart(2, "0"),
              y: String(itinerary.length).padStart(2, "0")
            })}
          </div>
        </div>
      </div>

      <article>
        {/* Hero — crossfading carousel of every photo from the day */}
        <header className="relative aspect-[16/10] sm:aspect-[21/9] max-h-[70vh] overflow-hidden bg-ink-900">
          {slides.length === 0 ? (
            // No photos for this day — show the styled placeholder
            <motion.div
              initial={{ scale: 1.06 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <PoiImage
                src={lead.src}
                alt={lead.alt}
                region={localDay.region === "transit" ? "north" : localDay.region}
                category={lead.category}
                tags={lead.tags}
              />
            </motion.div>
          ) : (
            <AnimatePresence mode="sync">
              <motion.div
                key={currentSlide.src}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1 }}
                transition={{
                  opacity: { duration: 1.4, ease: "easeInOut" },
                  scale: { duration: SLIDE_DURATION_MS / 1000 + 1.4, ease: "linear" }
                }}
                className="absolute inset-0 will-change-transform"
              >
                <PoiImage
                  src={currentSlide.src}
                  alt={currentSlide.alt}
                  region={localDay.region === "transit" ? "north" : localDay.region}
                  category={currentSlide.category}
                  tags={currentSlide.tags}
                />
              </motion.div>
            </AnimatePresence>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/55 to-ink-900/15" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink-900/40 to-transparent" />

          {/* Carousel progress dashes — top-right of the hero */}
          {slides.length > 1 && (
            <div
              className="absolute end-4 sm:end-8 top-3 sm:top-5 z-10 flex gap-1 pointer-events-none"
              aria-hidden
            >
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`block h-px transition-all duration-500 ${
                    i === slideIdx ? "w-5 bg-cream-50/90" : "w-2 bg-cream-50/30"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Per-slide place name + photo credit, crossfading with the image */}
          {currentSlide && (currentSlide.place || currentSlide.credit) && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`meta-${currentSlide.src}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.45 }}
                className="absolute bottom-3 end-3 z-10 flex flex-col items-end gap-1"
                dir="ltr"
              >
                {currentSlide.place && (
                  <div className="font-serif italic text-cream-50/95 text-[11px] sm:text-xs px-2 py-0.5 rounded-full bg-ink-900/55 backdrop-blur-sm">
                    {currentSlide.place}
                  </div>
                )}
                {currentSlide.credit && (
                  <div className="px-2 py-1 rounded-full bg-ink-900/55 backdrop-blur-sm">
                    <PhotoCredit credit={currentSlide.credit} variant="light" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          <div className="absolute inset-x-0 bottom-0 px-4 sm:px-10 pb-6 sm:pb-12 text-cream-50">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-baseline gap-3 sm:gap-4">
                <div className="font-serif text-3xl sm:text-5xl leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
                  {ROMAN[day.dayNumber]}
                </div>
                <div className="hidden sm:block h-px w-16 bg-cream-50/40 mb-2" />
                <div className={`text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-medium ${accent}`}>
                  {t("plan_chapter_x_of_y", { x: String(day.dayNumber).padStart(2, "0"), y: String(itinerary.length).padStart(2, "0") })}
                </div>
                {isToday && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-terracotta-500 text-cream-50 text-[9px] uppercase tracking-[0.22em] font-bold shadow-[0_4px_18px_rgba(196,90,61,0.5)]">
                    <Sun size={10} /> {t("today")}
                  </span>
                )}
              </div>

              <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[12px] uppercase tracking-[0.22em] text-cream-50/85 font-medium flex-wrap">
                <span>{localizeWeekday(day.weekday, lang)}</span>
                <span aria-hidden>·</span>
                <span>{localizeShortDate(day.date, lang)}</span>
                <span aria-hidden>·</span>
                <span>{t(REGION_KEY[day.region])}</span>
                {localDay.base && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="inline-flex items-center gap-1 normal-case tracking-normal text-cream-50/85">
                      <MapPin size={11} className="opacity-70" /> {localDay.base}
                    </span>
                  </>
                )}
              </div>

              <h1 className="mt-2 sm:mt-3 font-serif text-3xl sm:text-6xl leading-[1.05] tracking-tight max-w-3xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                {localDay.title}
              </h1>
              {localDay.subtitle && (
                <p className="mt-2 sm:mt-3 font-serif italic text-cream-50/85 text-base sm:text-xl max-w-2xl">
                  {localDay.subtitle}
                </p>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 sm:space-y-16">
          {/* Italian word of the day — opens the chapter with a small
              magazine flashcard, picked to fit the day's mood (water words
              on water days, "arrivederci" on the flight home, etc.). */}
          {localDay.wordOfTheDay && (
            <section>
              <article
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cream-50 via-cream-100 to-gold-400/10 ring-1 ring-cream-300/70 shadow-[0_18px_50px_-30px_rgba(151,109,76,0.45)]"
              >
                {/* Decorative oversized quote glyph in the corner */}
                <Quote
                  size={140}
                  strokeWidth={1}
                  className="absolute -top-6 end-0 text-terracotta-500/8 pointer-events-none rtl:scale-x-[-1]"
                  aria-hidden
                />

                <div className="relative px-5 sm:px-8 py-6 sm:py-8">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-terracotta-600/85 font-medium">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta-500" />
                    {t("word_eyebrow")}
                  </div>

                  <div className="mt-4 sm:mt-5 flex items-baseline flex-wrap gap-x-4 gap-y-2">
                    <h2 className="font-serif italic text-4xl sm:text-6xl text-ink-900 leading-none">
                      {localDay.wordOfTheDay.word}
                    </h2>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream-50 ring-1 ring-cream-300/80 text-ink-700/75">
                      <Volume2 size={11} strokeWidth={2} className="opacity-70" />
                      <span className="text-[12px] sm:text-[13px] font-medium tracking-wide">
                        {localDay.wordOfTheDay.pronounce}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-[15px] sm:text-[17px] text-ink-700/90 leading-snug">
                    <span className="text-[10px] uppercase tracking-[0.24em] text-ink-700/55 font-medium me-2">
                      {t("word_meaning_label")}
                    </span>
                    {localDay.wordOfTheDay.meaning}
                  </p>

                  {localDay.wordOfTheDay.example && (
                    <div className="mt-5 pt-5 border-t border-cream-300/60">
                      <div className="text-[10px] uppercase tracking-[0.24em] text-ink-700/55 font-medium">
                        {t("word_use_label")}
                      </div>
                      <p className="mt-1.5 font-serif italic text-[16px] sm:text-[18px] text-ink-900 leading-snug">
                        “{localDay.wordOfTheDay.example}”
                      </p>
                      {localDay.wordOfTheDay.exampleMeaning && (
                        <p className="mt-1 text-[13px] sm:text-[14px] text-ink-700/70 leading-snug">
                          {localDay.wordOfTheDay.exampleMeaning}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </article>
            </section>
          )}

          {/* Activities */}
          <section>
            <SectionLabel eyebrow={t("todays_plan")} title={t("hour_by_hour")} />
            <ol className="mt-6 sm:mt-8 space-y-5 sm:space-y-8">
              {localDay.activities.map((a, i) => (
                <ActivityRow key={i} activity={a} index={i} isToday={isToday} />
              ))}
            </ol>

            {localDay.driveNotes && (
              <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-cream-300/60 flex items-start gap-3">
                <span className="shrink-0 w-10 h-10 rounded-full bg-olive-500/10 text-olive-700 flex items-center justify-center">
                  <Car size={16} />
                </span>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-olive-700/80 font-medium">
                    {t("on_the_road")}
                  </div>
                  <p className="mt-0.5 font-serif italic text-ink-700/85 text-[15px] sm:text-base leading-relaxed">
                    {localDay.driveNotes}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Mini map */}
          {dayPois.length > 0 && (
            <section>
              <SectionLabel eyebrow={t("on_the_map")} title={t("the_days_stops")} />
              <p className="mt-2 mb-5 sm:mb-6 font-serif italic text-ink-700/70 text-[14.5px] sm:text-base">
                {t("ordered_visit")}
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
                        <Navigation size={11} /> {t("navigate")}
                      </a>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Day pack — what to bring, sitting between the plan and the
              day-notes. Items can reference a specific stop with a small
              chip the reader can tap to scroll back up to that activity. */}
          {localDay.gear && localDay.gear.length > 0 && (
            <section>
              <SectionLabel eyebrow={t("gear_eyebrow")} title={t("gear_title")} />
              <p className="mt-2 mb-5 sm:mb-6 font-serif italic text-ink-700/70 text-[14.5px] sm:text-base">
                {t("gear_kicker")}
              </p>
              <ul className="grid sm:grid-cols-2 gap-2.5">
                {localDay.gear.map((g, i) => {
                  const forName = g.for ? attractionNameById.get(g.for) : undefined;
                  return (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-cream-50 ring-1 ring-cream-300/70"
                    >
                      <span
                        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                          g.for
                            ? "bg-terracotta-500/12 text-terracotta-600"
                            : "bg-olive-500/12 text-olive-700"
                        }`}
                      >
                        <Backpack size={14} strokeWidth={1.8} />
                      </span>
                      <div className="min-w-0 pt-0.5 flex-1">
                        <div className="text-[13.5px] sm:text-[14.5px] text-ink-700/90 leading-snug">
                          {g.item}
                        </div>
                        {g.for && forName && (
                          <button
                            type="button"
                            onClick={() => scrollToActivity(g.for!)}
                            className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-terracotta-500/10 text-terracotta-700 text-[10px] uppercase tracking-[0.16em] font-medium hover:bg-terracotta-500/18 transition-colors"
                            title={forName}
                          >
                            <Activity size={9} strokeWidth={2.2} />
                            <span className="normal-case tracking-normal text-[11px] font-normal">
                              {t("gear_for_label")} {forName}
                            </span>
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Day notes — money, timing, mood */}
          {localDay.dayTips && localDay.dayTips.length > 0 && (
            <section>
              <SectionLabel eyebrow={t("daytips_eyebrow")} title={t("daytips_title")} />
              <p className="mt-2 mb-5 sm:mb-6 font-serif italic text-ink-700/70 text-[14.5px] sm:text-base">
                {t("daytips_kicker")}
              </p>
              <ul className="space-y-2.5">
                {localDay.dayTips.map((line, i) => (
                  <li
                    key={i}
                    className="relative ps-10 pe-4 py-3 rounded-xl bg-cream-50 ring-1 ring-cream-300/70"
                  >
                    <span className="absolute start-3 top-3 w-7 h-7 rounded-full bg-gold-400/15 text-sienna-600 flex items-center justify-center">
                      <StickyNote size={13} strokeWidth={1.8} />
                    </span>
                    <p className="text-[13.5px] sm:text-[14.5px] text-ink-700/90 leading-relaxed">
                      {line}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Tips */}
          {tips.length > 0 && (
            <section>
              <SectionLabel eyebrow={t("things_to_know")} title={t("tips_for_chapter")} />
              <ul className="mt-6 sm:mt-8 space-y-3.5">
                {tips.map(tip => {
                  const s = SEVERITY_STYLES[tip.severity];
                  const Icon = s.Icon;
                  return (
                    <li
                      key={tip.id}
                      className={`relative ps-12 sm:ps-14 pe-4 sm:pe-5 py-4 sm:py-5 rounded-2xl bg-cream-50 ring-1 ${s.ring}`}
                    >
                      <span
                        className={`absolute start-3 sm:start-4 top-4 sm:top-5 w-7 h-7 rounded-full ${s.bg} ${s.text} flex items-center justify-center`}
                      >
                        <Icon size={14} />
                      </span>
                      <div
                        className={`text-[10px] uppercase tracking-[0.22em] font-medium ${s.text}`}
                      >
                        {t(s.labelKey)}
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
            {prevDay && localPrevDay ? (
              <button
                type="button"
                onClick={() => navigateChapter(prevDay.dayNumber)}
                className="group flex items-center gap-3 sm:gap-4 text-start p-3 sm:p-5 rounded-2xl ring-1 ring-cream-300/70 hover:ring-terracotta-500/60 hover:bg-cream-100/60 transition-all"
              >
                <span className="shrink-0 w-10 h-10 rounded-full bg-cream-100 text-ink-800 flex items-center justify-center group-hover:bg-terracotta-500 group-hover:text-cream-50 transition-colors">
                  {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </span>
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-ink-700/55 font-medium">
                    {t("previous")} · {ROMAN[prevDay.dayNumber]}
                  </div>
                  <div className="mt-0.5 font-serif text-[14px] sm:text-base text-ink-900 leading-tight line-clamp-2">
                    {localPrevDay.title}
                  </div>
                </div>
              </button>
            ) : (
              <div />
            )}
            {nextDay && localNextDay ? (
              <button
                type="button"
                onClick={() => navigateChapter(nextDay.dayNumber)}
                className="group flex items-center gap-3 sm:gap-4 text-end p-3 sm:p-5 rounded-2xl ring-1 ring-cream-300/70 hover:ring-terracotta-500/60 hover:bg-cream-100/60 transition-all justify-end"
              >
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-ink-700/55 font-medium">
                    {t("next")} · {ROMAN[nextDay.dayNumber]}
                  </div>
                  <div className="mt-0.5 font-serif text-[14px] sm:text-base text-ink-900 leading-tight line-clamp-2">
                    {localNextDay.title}
                  </div>
                </div>
                <span className="shrink-0 w-10 h-10 rounded-full bg-cream-100 text-ink-800 flex items-center justify-center group-hover:bg-terracotta-500 group-hover:text-cream-50 transition-colors">
                  {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
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
  const t = useT();
  const localizePoi = useLocalizePoi();
  const Icon = activityIcon(activity);
  const rawAtt = activity.attractionId ? getAttraction(activity.attractionId) : undefined;
  const att = rawAtt ? localizePoi(rawAtt) : undefined;
  const [open, setOpen] = useState(false);
  const hasMoreInfo = !!att;

  return (
    <li
      id={activity.attractionId ? `activity-${activity.attractionId}` : undefined}
      className="grid grid-cols-[40px_1fr] sm:grid-cols-[64px_1fr] gap-3 sm:gap-6 scroll-mt-24"
    >
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
              · {t(TAG_KEY[activity.tag] ?? "tag_view")}
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
            {open ? t("hide_details") : t("more_about_place")}
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-ink-700/55 font-medium">
                      {t("about_this_place")}
                    </div>
                    {att.difficulty && (
                      <div
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.18em] font-medium ${DIFFICULTY_DETAIL_STYLE[att.difficulty].bg} ${DIFFICULTY_DETAIL_STYLE[att.difficulty].text}`}
                      >
                        <Activity size={10} strokeWidth={2.2} />
                        {t(DIFFICULTY_DETAIL_STYLE[att.difficulty].key)}
                      </div>
                    )}
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
                  {att.tips && att.tips.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-cream-300/70">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-olive-700 font-medium">
                        <Lightbulb size={11} strokeWidth={1.9} />
                        {t("insider_tips_label")}
                      </div>
                      <ul className="mt-2 space-y-1">
                        {att.tips.map((tip, i) => (
                          <li
                            key={i}
                            className="text-[12.5px] leading-snug text-ink-700/85 flex gap-2"
                          >
                            <span
                              className="shrink-0 mt-[6px] w-1 h-1 rounded-full bg-terracotta-500/70"
                              aria-hidden
                            />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
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
                        <ExternalLink size={12} /> {t("website")}
                      </a>
                    )}
                    <a
                      href={navUrl(att.coords)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-link"
                    >
                      <Navigation size={12} /> {t("navigate")}
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
