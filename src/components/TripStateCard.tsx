import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Sun, MapPin, Plane } from "lucide-react";
import { getTripState } from "../lib/tripState";
import type { TripState } from "../lib/tripState";
import { formatDate } from "../lib/nav";

function useTripState() {
  const [state, setState] = useState<TripState>(() => getTripState());
  useEffect(() => {
    setState(getTripState());
    const id = window.setInterval(() => setState(getTripState()), 60_000);
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
      <div className="grid sm:grid-cols-[auto_1fr] gap-0">
        <div
          className="px-5 py-4 sm:px-6 sm:py-5 flex sm:flex-col items-center justify-center gap-3 sm:gap-1 text-cream-50"
          style={{
            background:
              state.phase === "during"
                ? "linear-gradient(135deg, #C45A3D 0%, #A8472D 100%)"
                : state.phase === "before"
                ? "linear-gradient(135deg, #6B7A4B 0%, #525E39 100%)"
                : "linear-gradient(135deg, #8B4513 0%, #6F3710 100%)"
          }}
        >
          {state.phase === "before" && (
            <>
              <div className="font-serif text-4xl sm:text-5xl leading-none tracking-tight">
                {state.daysUntil}
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] font-medium opacity-90 text-center">
                {state.daysUntil === 1 ? "day to go" : "days to go"}
              </div>
            </>
          )}
          {state.phase === "during" && (
            <>
              <div className="font-serif text-4xl sm:text-5xl leading-none tracking-tight">
                {state.today.dayNumber}
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] font-medium opacity-90 text-center">
                of 10
              </div>
            </>
          )}
          {state.phase === "after" && (
            <>
              <Plane size={28} className="sm:mb-1" />
              <div className="text-[10px] uppercase tracking-[0.22em] font-medium opacity-90 text-center">
                Buon ritorno
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-4 sm:px-6 sm:py-5">
          {state.phase === "before" && (
            <>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-terracotta-600 font-medium">
                <Sparkles size={12} /> Counting down
              </div>
              <div className="font-serif text-xl sm:text-2xl text-ink-900 mt-1 leading-snug">
                Tuscany 2026 starts {formatDate("2026-08-17")}
              </div>
              <p className="text-sm text-ink-700/80 mt-1">
                Land at FCO 14:00 · drive north to Larciano · pool & sleep.
              </p>
            </>
          )}
          {state.phase === "during" && (
            <>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-terracotta-600 font-medium">
                <Sun size={12} /> Today &middot; {formatDate(state.today.date)}
              </div>
              <div className="font-serif text-xl sm:text-2xl text-ink-900 mt-1 leading-snug">
                {state.today.title}
              </div>
              {state.today.activities[0] && (
                <p className="text-sm text-ink-700/80 mt-1 line-clamp-2">
                  <span className="font-medium text-ink-900">
                    {state.today.activities[0].time}{" "}
                  </span>
                  {state.today.activities[0].title} &middot;{" "}
                  {state.today.activities[0].description}
                </p>
              )}
              {state.tomorrow && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-ink-700/60">
                  <MapPin size={10} className="text-olive-500" />
                  Tomorrow: {state.tomorrow.title}
                </div>
              )}
            </>
          )}
          {state.phase === "after" && (
            <>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-terracotta-600 font-medium">
                <Sparkles size={12} /> Trip complete
              </div>
              <div className="font-serif text-xl sm:text-2xl text-ink-900 mt-1 leading-snug">
                That was Tuscany 2026
              </div>
              <p className="text-sm text-ink-700/80 mt-1">
                Until next time. Buon viaggio.
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
