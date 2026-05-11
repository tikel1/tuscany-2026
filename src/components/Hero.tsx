import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { getTripState, TRIP_START } from "../lib/tripState";
import type { TripState } from "../lib/tripState";
import { formatDate } from "../lib/nav";
import { useT } from "../lib/dict";
import { useLang } from "../lib/i18n";
import { useLocalizeDay, useLocalizePoi } from "../data/i18n";
import { getAttraction } from "../data/attractions";
import type { Day, POI } from "../data/types";
import LiveCountdown from "./LiveCountdown";
import WeatherStrip from "./WeatherStrip";
import { useCarouselSwipe } from "../lib/useCarouselSwipe";

interface HeroPhoto {
  src: string;
  /** Place name shown at the bottom-left in italics */
  place: string;
  /** Tiny attribution shown next to the place — photographer + license */
  credit: string;
  /** Wikimedia Commons / Unsplash file page so curious viewers can verify */
  source: string;
  /** If set, the photo shows a place we'll actually visit on this day of
   *  the trip — used to render a "(Day N)" chip next to the place name. */
  dayNumber?: number;
}

// All photos are CC-licensed beauty shots of places we'll actually visit
// (or the iconic Tuscan landscapes that surround them). Hosted locally
// at public/images/hero/ — fetched once via scripts/fetch-hero-images.mjs.
const HERO_PHOTOS: HeroPhoto[] = [
  {
    src: "./images/hero/cypresses-sunset.jpg",
    place: "Cipressi di San Quirico d'Orcia",
    credit: "Wikimedia Commons · CC BY-SA",
    source:
      "https://commons.wikimedia.org/wiki/File:Cipressi_di_S.Quirico_d'Orcia_al_tramonto.jpg"
  },
  {
    src: "./images/hero/saturnia-falls.jpg",
    place: "Saturnia · Cascate del Mulino",
    credit: "Raimond Spekking · CC BY-SA",
    source:
      "https://commons.wikimedia.org/wiki/File:Terme_di_Saturnia_-_Cascate_del_Mulino-0518.jpg",
    dayNumber: 9
  },
  {
    src: "./images/hero/pitigliano-panorama.jpg",
    place: "Pitigliano · viewpoint at golden hour",
    credit: "Wikimedia · Featured Picture · CC BY-SA",
    source:
      "https://commons.wikimedia.org/wiki/File:01665_ITA_Tuscany_Pitigliano_S_from_viewpoint_V-P.jpg",
    dayNumber: 8
  },
  {
    src: "./images/hero/val-dorcia-hills.jpg",
    place: "Endless hills of Pienza · Val d'Orcia",
    credit: "Wikimedia · Featured Picture · CC BY-SA",
    source:
      "https://commons.wikimedia.org/wiki/File:Endless_hills_of_Pienza1.jpg"
  },
  {
    src: "./images/hero/maremma-aerial.jpg",
    place: "Parco della Maremma · Torre di Collelungo",
    credit: "Wikimedia Commons · CC BY-SA",
    source:
      "https://commons.wikimedia.org/wiki/File:Toscana_-_Maremma_Regional_Park_-_aerial_photo_with_Torre_di_Collelungo.jpg",
    dayNumber: 8
  },
  {
    src: "./images/cala-del-gesso.jpg",
    place: "Cala del Gesso · Argentario",
    credit: "Cristina Gottardi (Unsplash) · CC0",
    source: "https://unsplash.com/photos/7_APbY7Afsg",
    dayNumber: 6
  },
  {
    src: "./images/hero/sorano-blue-hour.jpg",
    place: "Sorano · blue hour",
    credit: "Wikimedia · Featured Picture · CC BY-SA",
    source:
      "https://commons.wikimedia.org/wiki/File:01844b_ITA_Tuscany_Sorano_blue_hour_3_to_1_V-P.jpg"
  },
  {
    src: "./images/hero/val-dorcia-lonely-tree.jpg",
    place: "Tuscan landscape · the lonely tree",
    credit: "Wikimedia · Featured Picture · CC BY-SA",
    source:
      "https://commons.wikimedia.org/wiki/File:Tuscan_landscape_with_lonely_tree.jpg"
  },
  {
    src: "./images/hero/crete-orcia-sunrise.jpg",
    place: "Sunrise on the Crete dell'Orcia",
    credit: "Wikimedia Commons · CC BY-SA",
    source:
      "https://commons.wikimedia.org/wiki/File:Sunrise_in_Crete_dell'Orcia.jpg"
  },
  {
    src: "./images/civita.jpg",
    place: "Civita di Bagnoregio · the dying city",
    credit: "Wikimedia Commons · CC BY-SA",
    source: "https://en.wikipedia.org/wiki/Civita_di_Bagnoregio",
    dayNumber: 9
  },
  {
    src: "./images/hero/coast-sunset.jpg",
    place: "Tramonto al Castello del Boccale · Tyrrhenian coast",
    credit: "Wikimedia Commons · CC BY-SA",
    source:
      "https://commons.wikimedia.org/wiki/File:Tramonto_al_Castello_del_Boccale.jpg"
  },
  {
    src: "./images/hero/tuscan-landscape-pano.jpg",
    place: "Tuscan countryside · the long view",
    credit: "Wikimedia · Featured Picture · CC BY-SA",
    source: "https://commons.wikimedia.org/wiki/File:Tuscan_Landscape_6.JPG"
  }
];

const PHOTO_DURATION_MS = 7000;

function useTripStateLive() {
  const [state, setState] = useState<TripState>(() => getTripState());
  useEffect(() => {
    const id = window.setInterval(() => setState(getTripState()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return state;
}

/* Build the hero photo carousel from a single day's actual content:
 * every attraction with a photo (in itinerary order), plus the day's
 * explicit `leadImage` if it's not already in the set. Used during the
 * trip so the hero shows what the family is *actually doing today /
 * tomorrow* rather than the generic Tuscany screensavers used pre-trip. */
function buildDayHeroPhotos(day: Day, getPoi: (p: POI) => POI): HeroPhoto[] {
  const out: HeroPhoto[] = [];
  const seen = new Set<string>();

  for (const a of day.activities) {
    if (!a.attractionId) continue;
    const att = getAttraction(a.attractionId);
    if (!att?.image || seen.has(att.image)) continue;
    seen.add(att.image);
    const local = getPoi(att);
    out.push({
      src: att.image,
      place: local.name,
      credit: att.imageCredit
        ? `${att.imageCredit.author} · ${att.imageCredit.license}`
        : "",
      source:
        att.imageCredit?.source ??
        att.imageCredit?.licenseUrl ??
        "#",
      dayNumber: day.dayNumber
    });
  }

  if (day.leadImage && !seen.has(day.leadImage)) {
    seen.add(day.leadImage);
    out.push({
      src: day.leadImage,
      place: day.title,
      credit: day.leadImageCredit
        ? `${day.leadImageCredit.author} · ${day.leadImageCredit.license}`
        : "",
      source:
        day.leadImageCredit?.source ??
        day.leadImageCredit?.licenseUrl ??
        "#",
      dayNumber: day.dayNumber
    });
  }

  return out;
}

function useHeroPhoto(photos: HeroPhoto[]) {
  const sig = useMemo(() => photos.map(p => p.src).join("|"), [photos]);
  const [idx, setIdx] = useState(0);
  const [prevSig, setPrevSig] = useState(sig);
  if (sig !== prevSig) {
    setPrevSig(sig);
    setIdx(0);
  }

  // Lazy preload: keep memory low and avoid hammering the network with
  // ~25 MB of full-resolution screensavers all at once. Strategy:
  //   - First photo loads with the page itself (no preload needed).
  //   - As soon as a photo becomes active, kick off a preload for the NEXT one
  //     so it's ready by the time we crossfade.
  useEffect(() => {
    if (photos.length === 0) return;
    const next = (idx + 1) % photos.length;
    const img = new Image();
    img.src = photos[next].src;
  }, [idx, photos]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const id = window.setInterval(() => {
      setIdx(i => (i + 1) % photos.length);
    }, PHOTO_DURATION_MS);
    return () => window.clearInterval(id);
  }, [photos]);

  // Defensive read — if `photos` was mutated to empty between renders,
  // fall back to the first hero photo so the page never renders blank.
  const safe = photos[idx] ?? photos[0] ?? HERO_PHOTOS[0];
  const step = useCallback(
    (delta: number) => {
      setIdx(i => {
        const len = photos.length;
        if (len <= 1) return i;
        return (i + delta + len) % len;
      });
    },
    [photos]
  );
  return { photo: safe, idx, step };
}

function HeroBody({ state }: { state: TripState }) {
  const t = useT();
  const localizeDay = useLocalizeDay();

  if (state.phase === "before") {
    return (
      <>
        <div className="font-serif italic text-cream-50/90 text-base sm:text-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
          {t("hero_before_lead")}
        </div>
        <div className="mt-5 sm:mt-7">
          <LiveCountdown target={TRIP_START} mode="down" size="lg" />
        </div>
        <div className="mt-5 font-serif italic text-cream-50/85 text-sm sm:text-base">
          {state.daysUntil <= 1
            ? t("hero_close_almost")
            : state.daysUntil <= 7
            ? t("hero_one_week")
            : state.daysUntil <= 30
            ? t("hero_one_month")
            : t("hero_far")}
        </div>
      </>
    );
  }
  if (state.phase === "during") {
    /* `featured` is the day to surface in the hero — same as `today`
       most of the time, but flips to tomorrow after the 20:00 evening
       cutoff (see tripState.ts). The eyebrow + the small label above the
       big day-number both swap between "Today" and "Tomorrow" copy. */
    const day = localizeDay(state.featured);
    const leadKey = state.isFeaturingTomorrow ? "hero_tomorrow_lead" : "hero_today_lead";
    const dayLabelKey = state.isFeaturingTomorrow ? "hero_tomorrow_day" : "hero_today_day";
    return (
      <>
        <div className="font-serif italic text-cream-50/90 text-base sm:text-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
          {t(leadKey)}
        </div>
        <div className="mt-4 sm:mt-6 flex items-end gap-4 sm:gap-6 justify-center">
          <div className="text-cream-50/95 text-end">
            <div className="text-[10px] uppercase tracking-[0.28em] font-medium opacity-90">
              {t(dayLabelKey)}
            </div>
            <div className="font-serif text-7xl sm:text-9xl leading-none mt-1">
              {String(day.dayNumber).padStart(2, "0")}
            </div>
          </div>
          <div className="text-cream-50/85 pb-2 sm:pb-4 text-start max-w-[55%]">
            <div className="text-[10px] uppercase tracking-[0.22em] font-medium opacity-90">
              {t("hero_of_ten")} · {formatDate(day.date)}
            </div>
            <div className="font-serif text-xl sm:text-3xl leading-tight mt-1">
              {day.title}
            </div>
          </div>
        </div>
        {day.activities[0] && (
          <div className="mt-5 font-serif italic text-cream-50/85 text-sm sm:text-base max-w-md mx-auto px-2">
            {day.activities[0].time} ·{" "}
            {day.activities[0].title}
          </div>
        )}
      </>
    );
  }
  return (
    <>
      <div className="font-serif italic text-cream-50/90 text-base sm:text-lg">
        {t("hero_after_lead")}
      </div>
      <div className="mt-5 font-serif text-5xl sm:text-7xl text-cream-50">{t("hero_after_title")}</div>
      <div className="mt-3 font-serif italic text-cream-50/85 text-sm sm:text-base">
        {t("hero_after_sub")}
      </div>
    </>
  );
}

export default function Hero() {
  const state = useTripStateLive();
  const t = useT();
  const { dir } = useLang();
  const localizePoi = useLocalizePoi();

  /* Pick the carousel source per trip phase:
   *  - "before": the curated screensaver-style HERO_PHOTOS (anticipation).
   *  - "during": photos of the *featured* day's actual stops, so the hero
   *    shows what the family is doing today (or tomorrow, after 20:00).
   *    Falls back to HERO_PHOTOS if a sparse day (Day 1 land, Day 10 fly)
   *    happens to have no attraction photos at all.
   *  - "after":  back to HERO_PHOTOS as a memorial of all the places. */
  const photos = useMemo<HeroPhoto[]>(() => {
    if (state.phase === "during") {
      const dayPhotos = buildDayHeroPhotos(state.featured, localizePoi);
      if (dayPhotos.length > 0) return dayPhotos;
    }
    return HERO_PHOTOS;
  }, [state, localizePoi]);

  const { photo, idx, step } = useHeroPhoto(photos);

  const { swipeHandlers, swipeTouchAction } = useCarouselSwipe({
    onPrev: () => step(-1),
    onNext: () => step(1),
    disabled: photos.length <= 1
  });

  return (
    <header
      id="hero"
      className="relative min-h-[100svh] flex flex-col overflow-hidden text-cream-50 bg-ink-900"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        ...(swipeTouchAction ? { touchAction: swipeTouchAction } : {})
      }}
      {...swipeHandlers}
    >
      {/* Crossfading hero photos with gentle Ken-Burns drift */}
      <AnimatePresence mode="sync">
        <motion.div
          key={photo.src}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1.0 }}
          exit={{ opacity: 0, scale: 1.0 }}
          transition={{
            opacity: { duration: 1.6, ease: "easeInOut" },
            scale: { duration: PHOTO_DURATION_MS / 1000 + 1.6, ease: "linear" }
          }}
          className="absolute inset-0 bg-cover bg-center will-change-transform"
          style={{ backgroundImage: `url('${photo.src}')` }}
        />
      </AnimatePresence>

      {/* Progress dashes — bottom corner, indicate position in the carousel.
          Maps over `photos` (not the global HERO_PHOTOS) so the count
          matches whatever source the carousel is actually rendering —
          general screensavers pre/post-trip, or the featured day's stops
          during the trip. */}
      <div
        className={`absolute ${dir === "rtl" ? "left-4 sm:left-8" : "right-4 sm:right-8"} bottom-3 sm:bottom-5 z-10 flex gap-1 pointer-events-none`}
        aria-hidden
      >
        {photos.map((_, i) => (
          <span
            key={i}
            className={`block h-px transition-all duration-500 ${
              i === idx ? "w-5 bg-cream-50/90" : "w-2 bg-cream-50/30"
            }`}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/55 via-ink-900/15 to-ink-900/75" />
      {/* Top-bottom edge fades */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink-900/40 to-transparent pointer-events-none" />

      {/* Top wordmark + dynamic photo place / credit on the right */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="relative z-10 max-w-6xl w-full mx-auto px-5 sm:px-8 pt-20 sm:pt-24"
      >
        <div className="flex items-baseline gap-3">
          <div className="font-serif tracking-[0.16em] text-xs sm:text-sm uppercase whitespace-nowrap">
            {t("brand")}
          </div>
          <div className="h-px flex-1 max-w-16 sm:max-w-32 bg-cream-50/40" />
          <AnimatePresence mode="wait">
            <motion.a
              key={photo.src}
              href={photo.source}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.5 }}
              className="text-end min-w-0 flex-shrink"
              dir="ltr"
              aria-label={`Photo: ${photo.place} (${photo.credit}). Open source.`}
            >
              <div className="font-serif italic text-[11px] sm:text-xs text-cream-50/90 leading-tight truncate">
                {photo.place}
                {photo.dayNumber && (
                  <span className="not-italic font-sans font-medium uppercase tracking-[0.18em] text-[9px] sm:text-[10px] text-cream-50/95 ms-2 px-1.5 py-0.5 rounded-full bg-cream-50/15 ring-1 ring-cream-50/25 align-middle">
                    {t("hero_photo_day", { n: photo.dayNumber })}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-[9px] uppercase tracking-[0.22em] text-cream-50/60 mt-0.5">
                {photo.credit}
              </div>
            </motion.a>
          </AnimatePresence>
        </div>

        {/* Magazine subhead — who this issue is "by" */}
        <div className="mt-2 sm:mt-2.5 font-serif italic text-[11px] sm:text-[13px] text-cream-50/85 tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
          {t("families_byline")}
        </div>
      </motion.div>

      {/* Centerpiece */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-5 sm:px-8 pb-32 sm:pb-40">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
          className="text-center max-w-3xl"
        >
          <HeroBody state={state} />
        </motion.div>
      </div>

      {/* Bottom strip: weather + scroll cue.
          Desktop: weather on the left, scroll cue on the right.
          Mobile: scroll cue sits ABOVE the weather glass strip. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10 max-w-6xl w-full mx-auto px-5 sm:px-8 pb-8 sm:pb-10 flex flex-col sm:flex-row items-center sm:items-end justify-center sm:justify-between gap-5 sm:gap-4"
      >
        <div className="hidden sm:block flex-1 max-w-md order-1">
          <WeatherStrip variant="glass" />
        </div>

        <button
          type="button"
          onClick={() =>
            document.getElementById("trip")?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          className="group flex flex-col items-center gap-1 text-cream-50/90 hover:text-cream-50 transition-colors order-1 sm:order-2"
          aria-label={t("scroll_to_plan")}
        >
          <span className="font-serif italic text-sm sm:text-sm tracking-wide">{t("scroll_to_plan")}</span>
          <ChevronDown size={20} className="animate-bounce group-hover:animate-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
        </button>

        {/* Mobile-only weather, rendered below the scroll cue in the column */}
        <div className="sm:hidden w-full order-2">
          <WeatherStrip variant="glass" />
        </div>
      </motion.div>
    </header>
  );
}
