/**
 * Tiny localStorage helper for the per-day quiz "last score" memory.
 * Lets the idle state of the Quiz card show "Last score: 4/5" so kids
 * know whether they've already played and want to beat it.
 *
 * Stored per `(day, lang)` because the questions themselves differ
 * between languages — comparing a Hebrew score to an English score is
 * apples to oranges.
 */

import type { Lang } from "../lang";

const KEY_PREFIX = "tuscany2026.quiz.lastScore.v1";

export interface LastScore {
  score: number;
  total: number;
  /** Epoch ms — purely informational, not used for expiry. */
  ts: number;
}

function key(day: number, lang: Lang): string {
  return `${KEY_PREFIX}.day${day}.${lang}`;
}

export function loadLastScore(day: number, lang: Lang): LastScore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(day, lang));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LastScore>;
    if (
      typeof parsed.score !== "number" ||
      typeof parsed.total !== "number" ||
      typeof parsed.ts !== "number"
    ) {
      return null;
    }
    return parsed as LastScore;
  } catch {
    return null;
  }
}

export function saveLastScore(day: number, lang: Lang, score: number, total: number): void {
  if (typeof window === "undefined") return;
  try {
    const value: LastScore = { score, total, ts: Date.now() };
    window.localStorage.setItem(key(day, lang), JSON.stringify(value));
  } catch {
    /* private browsing / quota — silently ignore. */
  }
}
