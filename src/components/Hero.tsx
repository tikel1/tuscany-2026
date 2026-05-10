import { motion } from "framer-motion";
import { CalendarDays, MapPin, Plane } from "lucide-react";
import { getTripState } from "../lib/tripState";
import { useEffect, useState } from "react";

export default function Hero() {
  const [state, setState] = useState(() => getTripState());
  useEffect(() => {
    setState(getTripState());
  }, []);

  return (
    <header
      id="hero"
      className="relative min-h-[92svh] sm:min-h-[88vh] flex items-end overflow-hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1568797629192-789acf8e4df3?auto=format&fit=crop&w=2400&q=80')"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/40 via-ink-900/15 to-cream-50" />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-6 pb-12 sm:pb-24 pt-28 w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-cream-50/95 backdrop-blur-sm border border-cream-300/60 px-3 py-1.5 text-[11px] font-semibold text-terracotta-700 uppercase tracking-[0.2em] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500 animate-pulse" />
            {state.phase === "before"
              ? `${state.daysUntil} ${state.daysUntil === 1 ? "day" : "days"} to go`
              : state.phase === "during"
              ? `Day ${state.today.dayNumber} of 10`
              : "Trip complete"}
          </div>

          <h1 className="font-serif text-[3.25rem] leading-[0.95] sm:text-7xl lg:text-8xl text-cream-50 drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]">
            Tuscany
            <span className="block italic text-terracotta-400 text-4xl sm:text-6xl lg:text-7xl mt-1.5 sm:mt-2">
              August 2026
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-xl text-cream-50/95 max-w-xl leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]">
            Turquoise canyons, Etruscan rock corridors, dawn at the hot springs,
            a private chef in the villa, and a boat in the Argentario coves.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-cream-50/95 backdrop-blur-sm px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-ink-800 shadow-sm">
              <CalendarDays size={14} className="text-terracotta-500" />
              17 – 26 Aug
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-cream-50/95 backdrop-blur-sm px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-ink-800 shadow-sm">
              <MapPin size={14} className="text-olive-500" />
              North &amp; South
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-cream-50/95 backdrop-blur-sm px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-ink-800 shadow-sm">
              <Plane size={14} className="text-sienna-500" />
              FCO
            </span>
          </div>
        </motion.div>
      </div>

      <div
        aria-hidden
        className="absolute bottom-2 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-1 text-cream-50/80 text-[10px] uppercase tracking-[0.2em]"
      >
        <span>Scroll</span>
        <div className="w-px h-8 bg-cream-50/60" />
      </div>
    </header>
  );
}
