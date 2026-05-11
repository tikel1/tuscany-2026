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
  | {
      phase: "during";
      /** The actual calendar day we're on. */
      today: Day;
      /** The next calendar day, if one exists in the itinerary. */
      tomorrow?: Day;
      /** The day to *feature* in the hero. Same as `today` for most of
       *  the day, but flips to `tomorrow` after 20:00 local time so the
       *  evening view nudges the family toward the next day's plan
       *  instead of replaying one that's already done. Falls back to
       *  `today` on the last day of the trip (no tomorrow to show). */
      featured: Day;
      /** True when `featured !== today` — i.e. we've crossed the 20:00
       *  evening cutoff and are now showing tomorrow. Hero uses this to
       *  swap the "Today" eyebrow for "Tomorrow". */
      isFeaturingTomorrow: boolean;
      dayIndex: number;
      elapsed: CountdownParts;
    }
  | { phase: "after" };

function startOfDayLocal(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** The trip is structured as 10 day-chapters, each centered on the
 *  morning + afternoon. By 20:00 local time the day's plan is essentially
 *  done — dinner is starting, the family is winding down — so the hero
 *  flips from "Today" to "Tomorrow" so you wake up to the next chapter
 *  already on screen. The local hour matches what the family experiences
 *  on the ground (in Italy during the trip; "before"/"after" never use
 *  this anyway). */
function isAfterEveningCutoff(now: Date): boolean {
  return now.getHours() >= 20;
}

export function partsFromMs(ms: number): CountdownParts {
  const safe = Math.max(0, ms);
  const days = Math.floor(safe / (1000 * 60 * 60 * 24));
  const hours = Math.floor((safe / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((safe / (1000 * 60)) % 60);
  const seconds = Math.floor((safe / 1000) % 60);
  return { totalMs: safe, days, hours, minutes, seconds };
}

/**
 * Returns the day number to feature by default. Mirrors `state.featured`
 * during the trip (so consumers stay in sync with the hero's 20:00
 * evening cutoff).
 *
 * - During the trip: featured chapter (today, or tomorrow after 20:00).
 * - Before the trip: Day 1 (the upcoming chapter).
 * - After the trip: Day 1 (back to the start).
 */
export function getCurrentOrUpcomingDayNumber(now: Date = new Date()): number {
  const state = getTripState(now);
  if (state.phase === "during") return state.featured.dayNumber;
  return 1;
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

  /* `toISOString()` after `startOfDayLocal` returns a UTC ISO string of
     midnight in the *local* zone — but `slice(0,10)` of the UTC ISO can
     be off by a day for negative-UTC offsets, so build the ISO from the
     local date parts directly. */
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  const todayIso = `${y}-${m}-${d}`;
  const idx = itinerary.findIndex(day => day.date === todayIso);
  const safeIdx = idx === -1 ? 0 : idx;
  const elapsed = partsFromMs(now.getTime() - TRIP_START.getTime());

  const todayDay = itinerary[safeIdx];
  const tomorrowDay = itinerary[safeIdx + 1];
  /* Show tomorrow once we're past the 20:00 evening cutoff, *unless*
     it's the last day of the trip (no tomorrow exists — keep showing
     today). */
  const featured =
    isAfterEveningCutoff(now) && tomorrowDay ? tomorrowDay : todayDay;
  const isFeaturingTomorrow = featured !== todayDay;

  return {
    phase: "during",
    today: todayDay,
    tomorrow: tomorrowDay,
    featured,
    isFeaturingTomorrow,
    dayIndex: safeIdx,
    elapsed
  };
}
