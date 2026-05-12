/**
 * Place-aware deep links to Google Maps and Waze.
 *
 * Old behaviour was to launch each app in **active turn-by-turn nav
 * mode** straight from coordinates. That was useful in the car but
 * skipped the "let me see what this place actually is" step — hours,
 * photos, reviews, the actual address. The new builders open the
 * **place's listing** in each app and let the user tap "Directions"
 * (Maps) or "Go" (Waze) themselves once they've decided.
 *
 * Strategy:
 *   - With a name → search by "<name>, <address-or-Italy>". Google
 *     Maps usually opens directly to the top hit's place card; Waze
 *     opens search results with the place pinned.
 *   - Without a name → drop a plain coord pin. The user still sees
 *     the location on the map and can tap nav themselves.
 */

export interface NavTarget {
  /** Place name (used in the search query). */
  name: string;
  /** Lat, lon. Used when no name is available. */
  coords: [number, number];
  /** Optional street address. Sharpens the search; if absent we
   *  fall back to "<name>, Italy" which is still usually enough. */
  address?: string;
}

function buildSearchQuery(target: NavTarget): string {
  const trimmedName = target.name.trim();
  const addr = target.address?.trim();
  return addr ? `${trimmedName}, ${addr}` : `${trimmedName}, Italy`;
}

/**
 * Build a Google Maps URL that opens the place's listing (card with
 * photos, hours, reviews, "Directions" button). The user reviews the
 * place first, then taps "Directions" themselves.
 *
 * Pass a coord tuple for the rare cases where we only know lat/lon —
 * Maps will drop a pin instead of opening a card.
 */
export function googleMapsPlaceUrl(target: NavTarget | [number, number]): string {
  if (Array.isArray(target)) {
    const [lat, lon] = target;
    return `https://www.google.com/maps/?q=${lat},${lon}`;
  }
  const query = encodeURIComponent(buildSearchQuery(target));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * Build a Waze URL that opens search results for the place (or drops
 * a pin when only coords are known). `navigate=no` keeps Waze from
 * auto-starting nav so the user picks the right result and taps Go
 * themselves.
 */
export function wazePlaceUrl(target: NavTarget | [number, number]): string {
  if (Array.isArray(target)) {
    const [lat, lon] = target;
    return `https://waze.com/ul?ll=${lat},${lon}&navigate=no`;
  }
  const query = encodeURIComponent(buildSearchQuery(target));
  return `https://waze.com/ul?q=${query}&navigate=no`;
}

/* ------------------------------------------------------------------ */
/* Deprecated aliases — kept so any straggler imports still compile.   */
/* New code should use googleMapsPlaceUrl / wazePlaceUrl instead.      */
/* ------------------------------------------------------------------ */

/** @deprecated Use {@link googleMapsPlaceUrl} so the user lands on the
 *  place card instead of being thrown straight into navigation. */
export function googleMapsNavUrl(coords: [number, number]): string {
  return googleMapsPlaceUrl(coords);
}

/** @deprecated Use {@link wazePlaceUrl}. */
export function wazeNavUrl(coords: [number, number]): string {
  return wazePlaceUrl(coords);
}

/** @deprecated Older callsites import { navUrl }. Maps to the place URL. */
export function navUrl(coords: [number, number]): string {
  return googleMapsPlaceUrl(coords);
}

/* ------------------------------------------------------------------ */
/* Unrelated helpers — kept here for historical reasons; safe to move.  */
/* ------------------------------------------------------------------ */

export function formatDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
