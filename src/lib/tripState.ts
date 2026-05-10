import { itinerary } from "../data/itinerary";
import type { Day } from "../data/types";

export const TRIP_START = new Date("2026-08-17T00:00:00+02:00");
export const TRIP_END = new Date("2026-08-26T23:59:59+02:00");

export interface CountdownParts {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export type TripState =
  | { phase: "before"; daysUntil: number; countdown: CountdownParts }
  | { phase: "during"; today: Day; tomorrow?: Day; dayIndex: number; elapsed: CountdownParts }
  | { phase: "after" };

function startOfDayLocal(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function partsFromMs(ms: number): CountdownParts {
  const safe = Math.max(0, ms);
  const days = Math.floor(safe / (1000 * 60 * 60 * 24));
  const hours = Math.floor((safe / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((safe / (1000 * 60)) % 60);
  const seconds = Math.floor((safe / 1000) % 60);
  return { totalMs: safe, days, hours, minutes, seconds };
}

export function getTripState(now: Date = new Date()): TripState {
  const today = startOfDayLocal(now);
  const start = startOfDayLocal(TRIP_START);
  const end = startOfDayLocal(TRIP_END);

  if (today < start) {
    const ms = TRIP_START.getTime() - now.getTime();
    const countdown = partsFromMs(ms);
    const daysUntil = Math.round((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { phase: "before", daysUntil, countdown };
  }
  if (today > end) {
    return { phase: "after" };
  }

  const todayIso = today.toISOString().slice(0, 10);
  const idx = itinerary.findIndex(d => d.date === todayIso);
  const safeIdx = idx === -1 ? 0 : idx;
  const elapsed = partsFromMs(now.getTime() - TRIP_START.getTime());

  return {
    phase: "during",
    today: itinerary[safeIdx],
    tomorrow: itinerary[safeIdx + 1],
    dayIndex: safeIdx,
    elapsed
  };
}
