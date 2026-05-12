/**
 * Tiny SFX bank for the per-day quiz. Three short non-voice sounds:
 *   - correct  : a bright two-note "ding" when the kid picks right
 *   - wrong    : a soft descending buzz when the kid picks wrong
 *   - whoosh   : an airy sweep used on score-screen transitions
 *
 * Default behaviour is to **synthesize** these on the fly via the Web
 * Audio API — zero bytes shipped, works offline, sounds clean on every
 * device, and is destination-agnostic so the same code drops into any
 * trip without art assets. If a real MP3 is found at
 * `public/audio/quiz/<name>.mp3` (HEAD-checked once, lazily) the
 * loader uses it instead, so a curator who wants custom sounds can
 * drop files in without touching code.
 *
 * Exported as a tiny React hook so callers don't have to manage the
 * AudioContext lifecycle themselves.
 */

import { useEffect, useRef } from "react";

export type QuizSfxName = "correct" | "wrong" | "whoosh";

const ASSET_NAMES: Record<QuizSfxName, string> = {
  correct: "correct.mp3",
  wrong: "wrong.mp3",
  whoosh: "whoosh.mp3"
};

/* ------------------------------------------------------------------ */
/* Asset URL resolution (mirrors src/lib/audioUrl.ts)                  */
/* ------------------------------------------------------------------ */

function baseUrl(): string {
  const raw = (import.meta.env.BASE_URL as string | undefined) || "/";
  return raw.endsWith("/") ? raw : `${raw}/`;
}

function assetUrl(name: QuizSfxName): string {
  return `${baseUrl()}audio/quiz/${ASSET_NAMES[name]}`;
}

/** Per-name cache of "did the HEAD request succeed?". `undefined` =
 *  not yet checked, `true` = MP3 exists, `false` = use synth. */
const assetExists = new Map<QuizSfxName, boolean>();

async function checkAssetExists(name: QuizSfxName): Promise<boolean> {
  const cached = assetExists.get(name);
  if (cached !== undefined) return cached;
  try {
    const res = await fetch(assetUrl(name), { method: "HEAD" });
    const ok = res.ok;
    assetExists.set(name, ok);
    return ok;
  } catch {
    assetExists.set(name, false);
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Web Audio synth — three tiny one-shot sounds                        */
/* ------------------------------------------------------------------ */

function synthCorrect(ctx: AudioContext): void {
  // Two-note bright ding: C6 → E6, ~280 ms total.
  const now = ctx.currentTime;
  const notes: Array<[number, number]> = [
    [1046.5, now],
    [1318.5, now + 0.12]
  ];
  for (const [freq, t] of notes) {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }
}

function synthWrong(ctx: AudioContext): void {
  // Short descending buzz: square wave glide from 220 Hz → 130 Hz, ~250 ms.
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(130, now + 0.22);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.16, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.26);
}

function synthWhoosh(ctx: AudioContext): void {
  // Filtered white-noise sweep: 0.4 s, lowpass cutoff 600 Hz → 4000 Hz.
  const now = ctx.currentTime;
  const duration = 0.42;
  const sampleRate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(600, now);
  filter.frequency.exponentialRampToValueAtTime(4000, now + duration);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(now);
  src.stop(now + duration);
}

const SYNTHS: Record<QuizSfxName, (ctx: AudioContext) => void> = {
  correct: synthCorrect,
  wrong: synthWrong,
  whoosh: synthWhoosh
};

/* ------------------------------------------------------------------ */
/* Player                                                              */
/* ------------------------------------------------------------------ */

class QuizSfxPlayer {
  private ctx: AudioContext | null = null;
  private mp3Cache = new Map<QuizSfxName, AudioBuffer>();

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume().catch(() => {
        /* ignore — iOS sometimes needs another tap */
      });
    }
    return this.ctx;
  }

  private async loadMp3(name: QuizSfxName, ctx: AudioContext): Promise<AudioBuffer | null> {
    const cached = this.mp3Cache.get(name);
    if (cached) return cached;
    try {
      const res = await fetch(assetUrl(name));
      if (!res.ok) return null;
      const arr = await res.arrayBuffer();
      const buf = await ctx.decodeAudioData(arr);
      this.mp3Cache.set(name, buf);
      return buf;
    } catch {
      return null;
    }
  }

  async play(name: QuizSfxName): Promise<void> {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const exists = await checkAssetExists(name);
    if (exists) {
      const buf = await this.loadMp3(name, ctx);
      if (buf) {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start();
        return;
      }
    }

    SYNTHS[name](ctx);
  }

  dispose(): void {
    try {
      void this.ctx?.close();
    } catch {
      /* ignore */
    }
    this.ctx = null;
    this.mp3Cache.clear();
  }
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export interface QuizSfxApi {
  play(name: QuizSfxName): void;
}

/**
 * React hook that gives a stable `play(name)` method for the lifetime
 * of the component. The underlying AudioContext is created on first
 * play (so we don't open one when the kid never starts the quiz) and
 * disposed on unmount.
 */
export function useQuizSfx(): QuizSfxApi {
  const playerRef = useRef<QuizSfxPlayer | null>(null);
  if (playerRef.current === null) {
    playerRef.current = new QuizSfxPlayer();
  }

  useEffect(() => {
    return () => {
      playerRef.current?.dispose();
      playerRef.current = null;
    };
  }, []);

  return {
    play: (name: QuizSfxName) => {
      void playerRef.current?.play(name);
    }
  };
}
