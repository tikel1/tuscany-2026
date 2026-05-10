import { useEffect, useState } from "react";

export type Route =
  | { kind: "home" }
  | { kind: "chapter"; day: number };

export function parseHash(hash: string): Route {
  const m = hash.match(/^#chapter\/(\d+)$/);
  if (m) {
    const day = parseInt(m[1], 10);
    if (day >= 1 && day <= 10) return { kind: "chapter", day };
  }
  return { kind: "home" };
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() =>
    typeof window !== "undefined" ? parseHash(window.location.hash) : { kind: "home" }
  );
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export function navigateChapter(day: number) {
  window.location.hash = `chapter/${day}`;
}

export function navigateHome(opts?: { scrollToTrip?: boolean }) {
  // pushState preserves the chapter in history (so browser forward still works)
  history.pushState(null, "", window.location.pathname + window.location.search);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  if (opts?.scrollToTrip) {
    setTimeout(() => {
      document.getElementById("trip")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }
}

const REMEMBERED_KEY = "tuscany:lastChapter";

export function rememberChapter(day: number) {
  try {
    sessionStorage.setItem(REMEMBERED_KEY, String(day));
  } catch {
    /* ignore */
  }
}

export function getRememberedChapter(): number | null {
  try {
    const v = sessionStorage.getItem(REMEMBERED_KEY);
    if (!v) return null;
    const n = parseInt(v, 10);
    return n >= 1 && n <= 10 ? n : null;
  } catch {
    return null;
  }
}
