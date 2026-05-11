/**
 * Tiny localStorage shim for the Gemininio chat, with a fall-back to
 * a build-time env var so the site can ship with a default key.
 *
 * Resolution order (first non-empty wins):
 *
 *   1. localStorage entry — a key the current visitor pasted into
 *      the Settings panel themselves. Highest priority because it
 *      lets a family member override the default with their own
 *      account if they want to.
 *   2. import.meta.env.VITE_GEMINI_API_KEY — baked in at build time
 *      from .env.local (dev) or a GitHub Actions secret (prod). When
 *      this is set, the user never sees the setup screen.
 *   3. null — the setup screen asks the visitor for a key.
 *
 * The build-time key gets compiled into the JS bundle and is
 * therefore extractable by anyone who view-sources the site. The
 * mitigation is to restrict the key in AI Studio (HTTP referrers).
 * See `.env.example` for the full warning.
 */

const KEY = "tuscany2026.gemininio.apiKey";
const HISTORY_KEY = "tuscany2026.gemininio.history";

/** Build-time default key. Vite replaces `import.meta.env.VITE_…`
 *  references with string literals at compile time, so this becomes
 *  `""` (or the real key) in the bundle — no runtime lookup. */
const BUILD_KEY: string =
  typeof import.meta !== "undefined" &&
  typeof import.meta.env?.VITE_GEMINI_API_KEY === "string"
    ? (import.meta.env.VITE_GEMINI_API_KEY as string)
    : "";

/** Did we ship with a default key? Lets the UI hide the setup
 *  screen and the "Forget my key" button. */
export function hasBuildTimeKey(): boolean {
  return BUILD_KEY.trim().length > 0;
}

export function getApiKey(): string | null {
  // Build-time default works even before the browser has a window
  // (SSR / pre-hydration is rare here, but free safety).
  const userKey = readUserKey();
  if (userKey) return userKey;
  return BUILD_KEY.trim() || null;
}

function readUserKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw && raw.trim() ? raw.trim() : null;
  } catch {
    return null;
  }
}

/** Did the current user explicitly paste their own key? Useful in
 *  the Settings UI to decide whether "Forget my key" is meaningful
 *  (it only clears the localStorage override, not the build key). */
export function hasUserOverride(): boolean {
  return readUserKey() !== null;
}

export function setApiKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, key.trim());
  } catch {
    /* private browsing / quota — silently ignore. The user can
       re-enter the key next session. */
  }
}

export function clearApiKey(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** A small persisted transcript so the chat doesn't reset every page
 *  load. Only the last ~30 turns are kept; older ones are dropped to
 *  avoid stuffing the prompt window forever. */
export interface PersistedMessage {
  role: "user" | "model";
  text: string;
  ts: number;
}

const MAX_HISTORY = 30;

export function loadHistory(): PersistedMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is PersistedMessage =>
        m && (m.role === "user" || m.role === "model") && typeof m.text === "string"
    );
  } catch {
    return [];
  }
}

export function saveHistory(messages: PersistedMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = messages.slice(-MAX_HISTORY);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore */
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
}
