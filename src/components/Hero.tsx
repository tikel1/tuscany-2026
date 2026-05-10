import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { getTripState, TRIP_START } from "../lib/tripState";
import type { TripState } from "../lib/tripState";
import { formatDate } from "../lib/nav";
import LiveCountdown from "./LiveCountdown";
import WeatherStrip from "./WeatherStrip";

interface HeroPhoto {
  src: string;
  /** Place name shown at the bottom-left in italics */
  place: string;
  /** Tiny attribution shown next to the place — photographer + license */
  credit: string;
  /** Wikimedia Commons / Unsplash file page so curious viewers can verify */
  source: string;
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
      "https://commons.wikimedia.org/wiki/File:Terme_di_Saturnia_-_Cascate_del_Mulino-0518.jpg"
  },
  {
    src: "./images/hero/pitigliano-panorama.jpg",
    place: "Pitigliano · viewpoint at golden hour",
    credit: "Wikimedia · Featured Picture · CC BY-SA",
    source:
      "https://commons.wikimedia.org/wiki/File:01665_ITA_Tuscany_Pitigliano_S_from_viewpoint_V-P.jpg"
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
      "https://commons.wikimedia.org/wiki/File:Toscana_-_Maremma_Regional_Park_-_aerial_photo_with_Torre_di_Collelungo.jpg"
  },
  {
    src: "./images/cala-del-gesso.jpg",
    place: "Cala del Gesso · Argentario",
    credit: "Cristina Gottardi (Unsplash) · CC0",
    source: "https://unsplash.com/photos/7_APbY7Afsg"
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
    source: "https://en.wikipedia.org/wiki/Civita_di_Bagnoregio"
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
    setState(getTripState());
    const id = window.setInterval(() => setState(getTripState()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return state;
}

function useHeroPhoto() {
  const [idx, setIdx] = useState(0);

  // Lazy preload: keep memory low and avoid hammering the network with ~25 MB
  // of full-resolution screensavers all at once. Strategy:
  //   - First photo loads with the page itself (no preload needed).
  //   - As soon as a photo becomes active, kick off a preload for the NEXT one
  //     so it's ready by the time we crossfade.
  useEffect(() => {
    const next = (idx + 1) % HERO_PHOTOS.length;
    const img = new Image();
    img.src = HERO_PHOTOS[next].src;
  }, [idx]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIdx(i => (i + 1) % HERO_PHOTOS.length);
    }, PHOTO_DURATION_MS);
    return () => window.clearInterval(id);
  }, []);

  return { photo: HERO_PHOTOS[idx], idx };
}

function HeroBody({ state }: { state: TripState }) {
  if (state.phase === "before") {
    return (
      <>
        <div className="font-serif italic text-cream-50/90 text-base sm:text-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
          Counting down to summer in the Maremma.
        </div>
        <div className="mt-5 sm:mt-7">
          <LiveCountdown target={TRIP_START} mode="down" size="lg" />
        </div>
        <div className="mt-5 font-serif italic text-cream-50/85 text-sm sm:text-base">
          {state.daysUntil <= 1
            ? "Buon viaggio — almost there."
            : state.daysUntil <= 7
            ? "One week to go. Time to pack the dry bag."
            : state.daysUntil <= 30
            ? "Less than a month. Confirm the chef and the boat."
            : "The summer of swimming, slowly approaching."}
        </div>
      </>
    );
  }
  if (state.phase === "during") {
    return (
      <>
        <div className="font-serif italic text-cream-50/90 text-base sm:text-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
          Today in Tuscany.
        </div>
        <div className="mt-4 sm:mt-6 flex items-end gap-4 sm:gap-6 justify-center">
          <div className="text-cream-50/95 text-right">
            <div className="text-[10px] uppercase tracking-[0.28em] font-medium opacity-90">
              Day
            </div>
            <div className="font-serif text-7xl sm:text-9xl leading-none mt-1">
              {String(state.today.dayNumber).padStart(2, "0")}
            </div>
          </div>
          <div className="text-cream-50/85 pb-2 sm:pb-4 text-left max-w-[55%]">
            <div className="text-[10px] uppercase tracking-[0.22em] font-medium opacity-90">
              of ten · {formatDate(state.today.date)}
            </div>
            <div className="font-serif text-xl sm:text-3xl leading-tight mt-1">
              {state.today.title}
            </div>
          </div>
        </div>
        {state.today.activities[0] && (
          <div className="mt-5 font-serif italic text-cream-50/85 text-sm sm:text-base max-w-md mx-auto px-2">
            {state.today.activities[0].time} ·{" "}
            {state.today.activities[0].title}
          </div>
        )}
      </>
    );
  }
  return (
    <>
      <div className="font-serif italic text-cream-50/90 text-base sm:text-lg">
        That summer in Tuscany.
      </div>
      <div className="mt-5 font-serif text-5xl sm:text-7xl text-cream-50">Buon ritorno</div>
      <div className="mt-3 font-serif italic text-cream-50/85 text-sm sm:text-base">
        17 — 26 August 2026 · the family edition
      </div>
    </>
  );
}

export default function Hero() {
  const state = useTripStateLive();
  const { photo, idx } = useHeroPhoto();

  return (
    <header
      id="hero"
      className="relative min-h-[100svh] flex flex-col overflow-hidden text-cream-50 bg-ink-900"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
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

      {/* Progress dashes — bottom right, indicate position in the carousel */}
      <div
        className="absolute right-4 sm:right-8 bottom-3 sm:bottom-5 z-10 flex gap-1 pointer-events-none"
        aria-hidden
      >
        {HERO_PHOTOS.map((_, i) => (
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
            Tuscany 2026
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
              className="text-right min-w-0 flex-shrink"
              aria-label={`Photo: ${photo.place} (${photo.credit}). Open source.`}
            >
              <div className="font-serif italic text-[11px] sm:text-xs text-cream-50/90 leading-tight truncate">
                {photo.place}
              </div>
              <div className="hidden sm:block text-[9px] uppercase tracking-[0.22em] text-cream-50/60 mt-0.5">
                {photo.credit}
              </div>
            </motion.a>
          </AnimatePresence>
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

      {/* Bottom strip: weather + scroll cue */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10 max-w-6xl w-full mx-auto px-5 sm:px-8 pb-8 sm:pb-10 flex flex-col sm:flex-row items-center sm:items-end justify-center sm:justify-between gap-4"
      >
        <div className="hidden sm:block flex-1 max-w-md">
          <WeatherStrip variant="glass" />
        </div>
        <button
          type="button"
          onClick={() =>
            document.getElementById("trip")?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          className="group flex flex-col items-center gap-1 text-cream-50/90 hover:text-cream-50 transition-colors"
          aria-label="Scroll to the plan"
        >
          <span className="font-serif italic text-sm sm:text-sm tracking-wide">the plan</span>
          <ChevronDown size={20} className="animate-bounce group-hover:animate-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
        </button>
      </motion.div>

      {/* Mobile: weather glass strip sits just above the scroll cue */}
      <div className="sm:hidden absolute inset-x-5 bottom-24 z-10">
        <WeatherStrip variant="glass" />
      </div>
    </header>
  );
}
