/**
 * Per-device persistence for the kid's preferred quiz mode (offline
 * vs live). The toggle at the bottom of the Quiz card writes here;
 * the idle phase reads from here on every mount so swapping chapters
 * doesn't reset the choice.
 *
 * Default is `offline` — bundled / locally-cached questions are
 * snappier, work without network, and don't burn Gemini quota every
 * time a kid taps Start. Live mode is the "I want endless questions
 * and we have wifi" upgrade.
 */

import type { QuizMode } from "../../data/types";

const KEY = "tuscany2026.quiz.mode.v1";

const DEFAULT_MODE: QuizMode = "offline";

export function loadQuizMode(): QuizMode {
  if (typeof window === "undefined") return DEFAULT_MODE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === "offline" || raw === "live") return raw;
  } catch {
    /* private browsing — fall through to default */
  }
  return DEFAULT_MODE;
}

export function saveQuizMode(mode: QuizMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, mode);
  } catch {
    /* quota / private browsing — silently ignore */
  }
}
