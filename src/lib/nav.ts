/**
 * Build a Google Maps deep link that opens in **active navigation mode**
 * (skips the preview / "Directions" step). On mobile, the URL launches
 * the Google Maps app and starts driving turn-by-turn immediately;
 * on desktop, it opens google.com/maps with directions ready to go.
 *
 * Parameters per Google's documented "Universal cross-platform URLs":
 *   api=1                       — use the new URL format
 *   destination=LAT,LON         — target
 *   travelmode=driving          — force car routing (no walk/bike default)
 *   dir_action=navigate         — start nav immediately, skip preview
 */
export function googleMapsNavUrl(coords: [number, number]): string {
  const [lat, lon] = coords;
  return (
    "https://www.google.com/maps/dir/?api=1" +
    `&destination=${lat},${lon}` +
    "&travelmode=driving" +
    "&dir_action=navigate"
  );
}

/**
 * Build a Waze deep link that starts navigation immediately.
 *
 * Parameters per Waze's documented universal links:
 *   ll=LAT,LON     — target coords
 *   navigate=yes   — start nav now (skip the preview screen)
 */
export function wazeNavUrl(coords: [number, number]): string {
  const [lat, lon] = coords;
  return `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`;
}

/**
 * Backward-compatible alias — older callsites import { navUrl } from
 * "./nav". Keep them working by mapping to the Google Maps nav URL.
 */
export function navUrl(coords: [number, number]): string {
  return googleMapsNavUrl(coords);
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
