import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { getTripState, TRIP_START } from "../lib/tripState";
import type { TripState } from "../lib/tripState";
import { formatDate } from "../lib/nav";
import LiveCountdown from "./LiveCountdown";
import WeatherStrip from "./WeatherStrip";

function useTripStateLive() {
  const [state, setState] = useState<TripState>(() => getTripState());
  useEffect(() => {
    setState(getTripState());
    const id = window.setInterval(() => setState(getTripState()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return state;
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

  return (
    <header
      id="hero"
      className="relative min-h-[100svh] flex flex-col overflow-hidden text-cream-50"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Ken-Burns photo backdrop */}
      <motion.div
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 18, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 bg-cover bg-center will-change-transform"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1568797629192-789acf8e4df3?auto=format&fit=crop&w=2400&q=80')"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/55 via-ink-900/15 to-ink-900/75" />
      {/* Top-bottom edge fades */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink-900/40 to-transparent pointer-events-none" />

      {/* Top wordmark */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="relative z-10 max-w-6xl w-full mx-auto px-5 sm:px-8 pt-20 sm:pt-24"
      >
        <div className="flex items-baseline gap-3">
          <div className="font-serif tracking-[0.16em] text-xs sm:text-sm uppercase">
            Tuscany 2026
          </div>
          <div className="h-px flex-1 max-w-32 bg-cream-50/40" />
          <div className="font-serif italic text-[11px] sm:text-xs text-cream-50/80">
            Family edition · Issue 01
          </div>
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
        className="relative z-10 max-w-6xl w-full mx-auto px-5 sm:px-8 pb-8 sm:pb-10 flex items-end justify-between gap-4"
      >
        <div className="hidden sm:block flex-1 max-w-md">
          <WeatherStrip variant="glass" />
        </div>
        <button
          type="button"
          onClick={() =>
            document.getElementById("trip")?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          className="group flex flex-col items-center gap-1 text-cream-50/85 hover:text-cream-50 transition-colors"
          aria-label="Scroll to itinerary"
        >
          <span className="font-serif italic text-xs sm:text-sm">read the itinerary</span>
          <ChevronDown size={18} className="animate-bounce group-hover:animate-none" />
        </button>
      </motion.div>

      {/* Mobile: weather glass strip just above the scroll cue */}
      <div className="sm:hidden absolute inset-x-5 bottom-20 z-10">
        <WeatherStrip variant="glass" />
      </div>
    </header>
  );
}
