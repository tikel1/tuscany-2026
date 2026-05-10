import { tips } from "../data/tips";
import type { Tip } from "../data/types";

/**
 * Map each chapter (1-10) to the tip ids that are most relevant on that day.
 * Tips not mapped to a day still show in the global "Tips" section of the home page.
 */
const TIP_IDS_PER_DAY: Record<number, string[]> = {
  1: ["self-service-fuel"],
  2: ["water-shoes", "canyon-park-booking"],
  3: ["ztl"],
  4: [],
  5: ["water-shoes", "ac-confirm"],
  6: ["boat-no-licence"],
  7: [],
  8: ["ztl"],
  9: ["saturnia-early", "water-shoes", "car-return-night-before", "ztl"],
  10: ["car-return-night-before"]
};

export function tipsForDay(dayNumber: number): Tip[] {
  const ids = TIP_IDS_PER_DAY[dayNumber] ?? [];
  return ids
    .map(id => tips.find(t => t.id === id))
    .filter((t): t is Tip => !!t);
}
