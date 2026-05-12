/**
 * Tiny pub/sub for "open the Gemininio panel from anywhere on the page".
 *
 * Other components (the per-day quiz score screen, future homepage CTAs)
 * dispatch `requestOpenGemininio()` to surface the chat without having
 * to thread refs or callbacks through the component tree. Gemininio
 * itself listens once on mount via `subscribeOpenGemininio`.
 *
 * Implemented on top of `window.dispatchEvent` so it works across React
 * portals, lazy-mounted components, and iframes inside the same origin.
 */

const EVENT_NAME = "gemininio:open";

export function requestOpenGemininio(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    /* extremely old browsers — ignore, the user can still tap the FAB */
  }
}

export function subscribeOpenGemininio(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = () => handler();
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
