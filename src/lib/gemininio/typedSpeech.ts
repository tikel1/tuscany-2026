/**
 * Read typed Gemininio replies aloud when the user leaves "voice" on.
 * Live WebSocket PCM handles mic turns; typed turns use REST only, so
 * we use the browser Speech Synthesis API here (no extra Gemini quota).
 */

import type { Lang } from "../i18n";

export function cancelTypedSpeech(): void {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
}

/** Fire-and-forget; safe to call without awaiting. */
export function speakTypedReply(text: string, lang: Lang): void {
  if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.trim());
    u.lang = lang === "he" ? "he-IL" : "en-US";
    u.rate = 1;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}
