import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Sun, MapPin, Plane, Clock } from "lucide-react";
import { getTripState, TRIP_START } from "../lib/tripState";
import type { TripState } from "../lib/tripState";
import { formatDate } from "../lib/nav";
import LiveCountdown from "./LiveCountdown";

function useTripState() {
  const [state, setState] = useState<TripState>(() => getTripState());
  useEffect(() => {
    const id = window.setInterval(() => setState(getTripState()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return state;
}

export default function TripStateCard() {
  const state = useTripState();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-paper overflow-hidden"
    >
      {state.phase === "before" && (
        <div
          className="relative px-5 sm:px-8 py-7 sm:py-10 text-cream-50 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #C45A3D 0%, #A8472D 55%, #8B3622 100%)"
          }}
        >
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
            }}
          />
          <svg
            className="absolute inset-x-0 bottom-0 w-full h-2/3 opacity-15 pointer-events-none"
            viewBox="0 0 400 200"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M0,160 Q60,100 120,130 T240,120 T400,140 L400,200 L0,200 Z"
              fill="rgba(255,255,255,0.7)"
            />
          </svg>

          <div className="relative">
            <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.28em] font-medium opacity-90 mb-4 sm:mb-6">
              <Sparkles size={11} />
              <span>Tuscany 2026 begins</span>
              <span className="opacity-60">·</span>
              <span>{formatDate("2026-08-17")}</span>
            </div>

            <LiveCountdown target={TRIP_START} mode="down" size="lg" />

            <div className="mt-5 sm:mt-7 text-center font-serif italic text-lg sm:text-2xl leading-snug opacity-95">
              {state.daysUntil <= 1
                ? "Buon viaggio — almost there."
                : state.daysUntil <= 7
                ? "One week to Tuscany. Time to pack."
                : state.daysUntil <= 30
                ? "Less than a month to go."
                : `${state.daysUntil} days of waiting…`}
            </div>
          </div>
        </div>
      )}

      {state.phase === "during" && (
        <div className="grid sm:grid-cols-[auto_1fr] gap-0">
          <div
            className="relative px-6 py-6 sm:px-10 sm:py-8 text-cream-50 flex sm:flex-col items-center justify-center gap-4 sm:gap-2 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #C45A3D 0%, #A8472D 100%)"
            }}
          >
            <div className="flex flex-col items-center">
              <div className="font-serif text-7xl sm:text-8xl leading-none tracking-tight">
                {state.today.dayNumber}
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] font-medium opacity-90 mt-1">
                of 10
              </div>
            </div>
            <div className="hidden sm:block w-12 h-px bg-cream-50/40 my-2" />
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] opacity-90">
              <Clock size={11} />
              <span>
                {state.elapsed.days}d {String(state.elapsed.hours).padStart(2, "0")}h in
              </span>
            </div>
          </div>

          <div className="px-5 py-5 sm:px-7 sm:py-7">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-terracotta-600 font-medium">
              <Sun size={12} /> Today &middot; {formatDate(state.today.date)}
            </div>
            <div className="font-serif text-2xl sm:text-3xl text-ink-900 mt-1.5 leading-tight">
              {state.today.title}
            </div>
            {state.today.activities[0] && (
              <p className="text-sm text-ink-700/85 mt-2 line-clamp-2 leading-relaxed">
                <span className="font-semibold text-ink-900">
                  {state.today.activities[0].time}{" "}
                </span>
                {state.today.activities[0].title} &middot;{" "}
                {state.today.activities[0].description}
              </p>
            )}
            {state.tomorrow && (
              <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-ink-700/70">
                <MapPin size={11} className="text-olive-500" />
                Tomorrow: {state.tomorrow.title}
              </div>
            )}
          </div>
        </div>
      )}

      {state.phase === "after" && (
        <div
          className="px-6 py-8 sm:px-10 sm:py-10 text-cream-50 text-center"
          style={{ background: "linear-gradient(135deg, #8B4513 0%, #6F3710 100%)" }}
        >
          <Plane size={32} className="mx-auto mb-2 opacity-90" />
          <div className="text-[10px] uppercase tracking-[0.28em] opacity-90">
            Trip complete
          </div>
          <div className="font-serif text-3xl sm:text-4xl mt-2">
            That was Tuscany 2026
          </div>
          <p className="font-serif italic text-base sm:text-lg opacity-90 mt-1">
            Until next time. Buon ritorno.
          </p>
        </div>
      )}
    </motion.div>
  );
}
