/**
 * Voice playback for Quizzo. Two interchangeable backends:
 *
 *   1. LiveQuizVoice — opens a Gemini Live session with a "narrator"
 *      persona (just speak the line you receive, in Quizzo's playful
 *      Italian-flavored cartoon voice). Reuses the WebSocket plumbing
 *      and PCM player that Gemininio already battle-tested. Best
 *      sounding option, costs ~5 cents per quiz on free-tier-equivalent
 *      accounts. Fails closed: any setup error rejects within ~3 s and
 *      the caller drops to the TTS fallback.
 *
 *   2. BrowserTtsQuizVoice — `window.speechSynthesis`. Works offline,
 *      no API key required, sounds robotic. Picks an Italian voice if
 *      one is installed (steers a tiny bit closer to the Quizzo vibe);
 *      otherwise uses the language default.
 *
 * Both backends expose the same `QuizVoice` shape so the UI doesn't
 * care which one it got — it just calls `speak()` and awaits the
 * promise. The factory `createQuizVoice` opens Live first and races
 * against a 3s timeout; on failure it returns a `BrowserTtsQuizVoice`
 * (or `null` if the browser has no speech synthesis at all).
 */

import { LiveSession } from "../gemininio/live";
import { PcmPlayer } from "../gemininio/audio";
import type { Lang } from "../lang";

const LIVE_CONNECT_TIMEOUT_MS = 3000;

/* ------------------------------------------------------------------ */
/* Common interface                                                    */
/* ------------------------------------------------------------------ */

export interface QuizVoice {
  /** Which backend won the race. The UI uses this to render a
   *  "voice unavailable" hint when no live voice could connect AND
   *  the browser also has no speech synthesis (`backend === "none"`). */
  backend: "live" | "tts" | "none";
  /** Speak a single line. Resolves when the audio finishes (best
   *  effort — Live gives us a "turnComplete" signal; TTS gives us
   *  the `onend` event). Safe to call again immediately to chain
   *  multiple lines (each call awaits the previous one's tail). */
  speak(text: string): Promise<void>;
  /** Hard-cut current playback. */
  cancel(): void;
  /** Tear down everything (close socket, stop audio context). */
  dispose(): void;
}

/* ------------------------------------------------------------------ */
/* LiveQuizVoice — Gemini Live with a "just-narrate-this" persona      */
/* ------------------------------------------------------------------ */

const NARRATOR_PERSONA_EN = `You are QUIZZO, a cartoon-style game-show host narrating a kid's
trip-recap quiz aloud.

ABSOLUTE RULES:
- Every user turn you receive contains a line for you to SPEAK. Speak
  it back EXACTLY as written, word for word. Do NOT add words, do NOT
  paraphrase, do NOT comment, do NOT translate, do NOT add intro or
  outro phrases.
- One line per turn. After speaking, stop. Do not ask follow-up
  questions.
- Voice: warm, playful, slightly silly cartoon-host energy with a
  thick Italian-flavored accent — sing-song intonation, rolled R, big
  open vowels. Cheerful upward lifts at phrase ends.
- This applies even when the line you receive is in Hebrew or another
  language: keep the Italian *accent and prosody*, but the *words*
  you say are the language of the line you received.
- Never narrate your own behavior ("I will now read…"). Never break
  character. Just speak the line.`;

const NARRATOR_PERSONA_HE = `You are QUIZZO, a cartoon-style game-show host narrating a kid's
trip-recap quiz aloud.

ABSOLUTE RULES (your spoken output is in Hebrew when the line is
Hebrew):
- Every user turn contains one line for you to SPEAK. Speak it back
  EXACTLY as written, word for word. Do NOT add words, do NOT
  paraphrase, do NOT comment, do NOT translate.
- One line per turn. After speaking, stop.
- Voice: warm, playful, cartoon-host energy with a thick
  Italian-flavored accent on top of Hebrew speech — rolled R, sing-
  song intonation, big open vowels, cheerful upward lifts.
- Never narrate your own behavior. Never break character. Just speak
  the line.`;

class LiveQuizVoice implements QuizVoice {
  readonly backend = "live" as const;

  private session: LiveSession;
  private player: PcmPlayer;
  private currentTurn: { resolve: () => void; reject: (err: Error) => void } | null =
    null;
  private disposed = false;

  constructor(session: LiveSession, player: PcmPlayer) {
    this.session = session;
    this.player = player;
  }

  static async open(apiKey: string, lang: Lang): Promise<LiveQuizVoice> {
    const persona = lang === "he" ? NARRATOR_PERSONA_HE : NARRATOR_PERSONA_EN;
    const player = new PcmPlayer();

    const session = new LiveSession(
      {
        apiKey,
        systemInstruction: persona,
        language: lang
      },
      {
        onAudio: pcm => player.enqueue(pcm),
        onTurnComplete: () => {
          /* `currentTurn` is set by the speak() that issued the send.
             Resolve it so the next speak() can chain. */
        }
      }
    );

    // Race connect against the timeout so a slow / blocked network
    // doesn't strand the kid staring at "warming up…" forever.
    const connectWithTimeout = new Promise<void>((resolve, reject) => {
      const t = setTimeout(
        () => reject(new Error("Live connect timeout")),
        LIVE_CONNECT_TIMEOUT_MS
      );
      session
        .connect()
        .then(() => {
          clearTimeout(t);
          resolve();
        })
        .catch(err => {
          clearTimeout(t);
          reject(err);
        });
    });

    try {
      await connectWithTimeout;
    } catch (err) {
      session.close();
      player.stop();
      throw err;
    }

    const voice = new LiveQuizVoice(session, player);

    // Re-wire the callbacks now that we have the instance, so
    // turnComplete actually resolves the right pending speak().
    (session as unknown as { cb: { onAudio?: (pcm: Uint8Array) => void; onTurnComplete?: () => void } }).cb = {
      onAudio: pcm => voice.player.enqueue(pcm),
      onTurnComplete: () => voice.handleTurnComplete()
    };

    // Unlock playback on the same gesture that opened the voice
    // (the Start button). iOS Safari refuses to play PCM otherwise.
    await voice.player.ensureAudioUnlocked();

    return voice;
  }

  private handleTurnComplete(): void {
    const t = this.currentTurn;
    this.currentTurn = null;
    t?.resolve();
  }

  async speak(text: string): Promise<void> {
    if (this.disposed) throw new Error("LiveQuizVoice disposed");
    if (!this.session.isOpen()) throw new Error("LiveQuizVoice connection closed");

    // If a previous turn hasn't completed yet, await it before
    // queuing the next one — keeps the audio chained cleanly.
    if (this.currentTurn) {
      await new Promise<void>(resolve => {
        const prev = this.currentTurn;
        if (!prev) {
          resolve();
          return;
        }
        const wrapped = {
          resolve: () => {
            prev.resolve();
            resolve();
          },
          reject: (err: Error) => {
            prev.reject(err);
            resolve();
          }
        };
        this.currentTurn = wrapped;
      });
    }

    return new Promise<void>((resolve, reject) => {
      this.currentTurn = { resolve, reject };
      try {
        this.session.sendText(text);
      } catch (err) {
        this.currentTurn = null;
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }

  cancel(): void {
    this.player.stop();
    this.player = new PcmPlayer();
    void this.player.ensureAudioUnlocked();
    const t = this.currentTurn;
    this.currentTurn = null;
    t?.resolve();
  }

  dispose(): void {
    this.disposed = true;
    try {
      this.session.close();
    } catch {
      /* ignore */
    }
    try {
      this.player.stop();
    } catch {
      /* ignore */
    }
    const t = this.currentTurn;
    this.currentTurn = null;
    t?.resolve();
  }
}

/* ------------------------------------------------------------------ */
/* BrowserTtsQuizVoice — Web Speech API                                */
/* ------------------------------------------------------------------ */

class BrowserTtsQuizVoice implements QuizVoice {
  readonly backend = "tts" as const;
  private lang: Lang;
  private chosenVoice: SpeechSynthesisVoice | null = null;

  constructor(lang: Lang) {
    this.lang = lang;
    this.pickVoice();
  }

  /** Pick a voice that sounds the most "Quizzo-like" for the active
   *  language. Italian voices add a hint of accent flavor for English
   *  output; for Hebrew we just use the best he-IL voice available. */
  private pickVoice(): void {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) {
      // Voices load asynchronously on Chrome; re-pick when they arrive.
      window.speechSynthesis.addEventListener(
        "voiceschanged",
        () => this.pickVoice(),
        { once: true }
      );
      return;
    }
    if (this.lang === "he") {
      this.chosenVoice =
        voices.find(v => /^he/i.test(v.lang)) ??
        voices.find(v => /hebrew/i.test(v.name)) ??
        null;
    } else {
      // Prefer an Italian-accented English voice if one is installed,
      // else any en-* voice, else the default.
      this.chosenVoice =
        voices.find(v => /italian|italiano/i.test(v.name) && /^en/i.test(v.lang)) ??
        voices.find(v => /^it/i.test(v.lang)) ??
        voices.find(v => /^en/i.test(v.lang)) ??
        null;
    }
  }

  async speak(text: string): Promise<void> {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      throw new Error("speechSynthesis not available");
    }
    return new Promise<void>((resolve, reject) => {
      try {
        // Cancel any in-flight utterance so back-to-back speak() calls
        // don't pile up — same behavior as the Live path.
        window.speechSynthesis.cancel();

        const u = new SpeechSynthesisUtterance(text);
        u.lang = this.lang === "he" ? "he-IL" : "en-US";
        if (this.chosenVoice) u.voice = this.chosenVoice;
        // A bit slower + slightly higher pitch for the cartoon-host vibe.
        u.rate = 0.95;
        u.pitch = 1.15;
        u.volume = 1;
        u.onend = () => resolve();
        u.onerror = ev => {
          // "interrupted" / "canceled" events fire when WE cancel
          // intentionally — treat as resolve, not reject.
          if (ev.error === "interrupted" || ev.error === "canceled") {
            resolve();
            return;
          }
          reject(new Error(`speechSynthesis error: ${ev.error ?? "unknown"}`));
        };
        window.speechSynthesis.speak(u);
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    });
  }

  cancel(): void {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }

  dispose(): void {
    this.cancel();
  }
}

/* ------------------------------------------------------------------ */
/* No-op fallback (when neither Live nor TTS is available)             */
/* ------------------------------------------------------------------ */

class NoVoice implements QuizVoice {
  readonly backend = "none" as const;
  async speak(): Promise<void> {
    /* nothing to do — the UI shows the "voice unavailable" hint and
       the kid reads + taps. */
  }
  cancel(): void {}
  dispose(): void {}
}

/* ------------------------------------------------------------------ */
/* Factory                                                             */
/* ------------------------------------------------------------------ */

export interface CreateQuizVoiceOptions {
  apiKey: string | null;
  lang: Lang;
  /** When true, skip Live entirely and go straight to TTS. The UI
   *  uses this when the network looked offline at quiz start. */
  ttsOnly?: boolean;
}

/**
 * Open a voice for the quiz. Tries Live first (best sound), falls
 * back to browser TTS, then to a no-op silent voice as a last resort.
 * Never throws — the UI always gets *something*; the `backend` field
 * tells it what it got.
 */
export async function createQuizVoice(
  opts: CreateQuizVoiceOptions
): Promise<QuizVoice> {
  if (!opts.ttsOnly && opts.apiKey) {
    try {
      return await LiveQuizVoice.open(opts.apiKey, opts.lang);
    } catch {
      // Fall through to TTS — the connect timeout / setup failure is
      // already logged inside LiveSession.
    }
  }

  if (typeof window !== "undefined" && window.speechSynthesis) {
    return new BrowserTtsQuizVoice(opts.lang);
  }

  return new NoVoice();
}
