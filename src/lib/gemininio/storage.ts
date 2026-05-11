/**
 * Tiny localStorage shim for the Gemininio chat. The Gemini API key
 * is stored on the user's device only — it never enters the repo,
 * never goes to a server, and never leaves the browser except as a
 * direct request to Google's API.
 *
 * Each family member who wants to chat enters their own free
 * Gemini key (https://aistudio.google.com/apikey). This is the
 * "user-supplied key" pattern — the only safe way to ship live LLM
 * chat from a static site without standing up a backend.
 */

const KEY = "tuscany2026.gemininio.apiKey";
const HISTORY_KEY = "tuscany2026.gemininio.history";

export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
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
