/**
 * Deep links to Google Maps and Waze that resolve to EXACTLY ONE place.
 *
 * History, because this has now been wrong twice:
 *   1. Originally these launched turn-by-turn nav straight from coords.
 *   2. Then they became text searches ("<name>, <address>") so the user
 *      would get a place card with hours and photos. That is what shipped
 *      for the trip, and in the field it was the wrong call: Google's
 *      `/maps/search/` renders a RESULTS LIST, and Waze's `q=` does the
 *      same, so you stand in a car park picking from five options. When
 *      the name doesn't resolve at all (Tenuta Cortevecchia has no
 *      OpenStreetMap record) Google collapses to a generic map.
 *   3. Now: `/maps/place/<lat>,<lon>` and Waze `ll=` only. One pin, one
 *      destination, no list, no ambiguity.
 *
 * We give up the business card on famous places to get that. The bet is
 * that a pin on the right spot beats a card you have to find, and it only
 * holds because every coordinate in the data is geocoded rather than
 * estimated — see the coordinate audit in docs/.
 */

export interface NavTarget {
  /** Place name. No longer used to build the URL (see the note above) —
   *  callers still pass it for accessible labels and tooltips. */
  name: string;
  /** Lat, lon. THE destination. Everything else is decoration. */
  coords: [number, number];
  /** Optional street address, shown in the UI next to the buttons. */
  address?: string;
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
  const [lat, lon] = Array.isArray(target) ? target : target.coords;
  // `/maps/place/<lat>,<lon>` resolves to ONE destination, every time.
  //
  // We shipped `/maps/search/<name>/@lat,lon` before and it was wrong in the
  // field: `/search/` renders a RESULTS LIST, so you arrive at the car park
  // still choosing between five things. Worse, when the name doesn't resolve
  // (verified with Tenuta Cortevecchia) Google collapses the URL to an empty
  // `/maps/place//@...` and drops you on a generic map.
  //
  // The trade-off is deliberate: we lose the business card for famous places
  // and get a coordinate pin instead. A pin on the right spot beats a card
  // you have to pick out of a list, and every coordinate here is geocoded.
  return `https://www.google.com/maps/place/${lat},${lon}/@${lat},${lon},17z`;
}

/**
 * Build a Waze URL that opens search results for the place (or drops
 * a pin when only coords are known). `navigate=no` keeps Waze from
 * auto-starting nav so the user picks the right result and taps Go
 * themselves.
 */
export function wazePlaceUrl(target: NavTarget | [number, number]): string {
  const [lat, lon] = Array.isArray(target) ? target : target.coords;
  // `ll` alone pins the exact point. We used to also pass `q=<name>`, which
  // turned this into a SEARCH and gave Waze licence to offer alternatives.
  // `navigate=no` still lets the user eyeball it before tapping Go.
  return `https://waze.com/ul?ll=${lat},${lon}&navigate=no`;
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
