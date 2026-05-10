import { itinerary } from "../data/itinerary";
import type { Day } from "../data/types";

export const TRIP_START = new Date("2026-08-17T00:00:00+02:00");
export const TRIP_END = new Date("2026-08-26T23:59:59+02:00");

export type TripState =
  | { phase: "before"; daysUntil: number }
  | { phase: "during"; today: Day; tomorrow?: Day; dayIndex: number }
  | { phase: "after" };

function startOfDayLocal(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getTripState(now: Date = new Date()): TripState {
  const today = startOfDayLocal(now);
  const start = startOfDayLocal(TRIP_START);
  const end = startOfDayLocal(TRIP_END);

  if (today < start) {
    const ms = start.getTime() - today.getTime();
    const days = Math.round(ms / (1000 * 60 * 60 * 24));
    return { phase: "before", daysUntil: days };
  }
  if (today > end) {
    return { phase: "after" };
  }

  const todayIso = today.toISOString().slice(0, 10);
  const idx = itinerary.findIndex(d => d.date === todayIso);
  if (idx === -1) {
    // safety net — find the closest
    return { phase: "during", today: itinerary[0], dayIndex: 0 };
  }

  return {
    phase: "during",
    today: itinerary[idx],
    tomorrow: itinerary[idx + 1],
    dayIndex: idx
  };
}
