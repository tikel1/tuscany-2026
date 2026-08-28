import type { Day, DayActivity } from "../data/types";

/** Decide whether an activity should render with the "Optional" badge.
 *
 *  Source-of-truth waterfall:
 *   1. If the data sets `activity.optional` explicitly (true OR false), honor
 *      it — that's the curator's intent (e.g. Day 9's Civita is the headline,
 *      so it sets optional:false to opt OUT of the auto-rule).
 *   2. Otherwise apply a rule of thumb: a day full of multi-hour stops can
 *      realistically only fit ~2 of them with drives in between. So once a
 *      day has more than 2 activities tied to a real attraction (anything
 *      with `attractionId`), the 3rd-and-later attractions are auto-marked
 *      optional. Activities without an attractionId (drives, picnics,
 *      check-ins) never count toward the threshold and never auto-go optional.
 *
 *  This lets the data stay terse — most days get the right behavior
 *  for free — while still allowing per-activity overrides where the
 *  heuristic doesn't match the curator's intent. */
export function isActivityOptional(activity: DayActivity, index: number, day: Day): boolean {
  if (activity.optional !== undefined) return activity.optional;
  if (!activity.attractionId) return false;
  const attractionCount = day.activities.filter(a => a.attractionId).length;
  if (attractionCount <= 2) return false;
  // Position of THIS activity among attractionId-bearing siblings (1-indexed).
  const attractionPosition = day.activities
    .slice(0, index + 1)
    .filter(a => a.attractionId).length;
  return attractionPosition > 2;
}

/** Split a day into the committed plan and everything optional ("Plan B"),
 *  preserving each activity's ORIGINAL index so the positional auto-rule
 *  above keeps seeing the real shape of the day. Both the chapter page and
 *  the home-page card call this, so they can never disagree about which
 *  stops are real. */
export function splitDayPlan(day: Day): {
  mainPlan: { activity: DayActivity; index: number }[];
  planB: { activity: DayActivity; index: number }[];
} {
  const grouped = day.activities.map((activity, index) => ({
    activity,
    index,
    optional: isActivityOptional(activity, index, day)
  }));
  return {
    mainPlan: grouped.filter(g => !g.optional).map(({ activity, index }) => ({ activity, index })),
    planB: grouped.filter(g => g.optional).map(({ activity, index }) => ({ activity, index }))
  };
}
