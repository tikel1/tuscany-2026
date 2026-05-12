/**
 * Per-device persistence for the kid's mute preference. The toggle
 * in the Quiz card writes here; the orchestrator reads on every
 * mount and on every voice / SFX call.
 *
 * Default is `false` (audio on) — the quiz is voice-led; muting it
 * silently flattens the fun. We store the choice anyway so a parent
 * who muted it during a hospital waiting-room session doesn't have
 * to re-mute every time the kid opens it.
 */

const KEY = "tuscany2026.quiz.mute.v1";

export function loadQuizMute(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function saveQuizMute(muted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (muted) {
      window.localStorage.setItem(KEY, "1");
    } else {
      window.localStorage.removeItem(KEY);
    }
  } catch {
    /* private browsing / quota — silently ignore */
  }
}
