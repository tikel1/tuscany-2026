/**
 * Per-day quiz generator + offline-pack storage.
 *
 * Two callers, two count regimes:
 *
 * - **Live mode** (endless stream) calls `generateQuiz({count: 5})`
 *   each round and again every time the orchestrator wants a fresh
 *   batch to chain on the end. Nothing is cached — each batch is
 *   fresh.
 * - **Offline mode** (10-question pack per day per language) calls
 *   `generateQuiz({count: 10})` once per (day, lang), stores the
 *   result via `saveOfflinePack` in `localStorage` *indefinitely*
 *   (no TTL — questions about a past trip don't go stale), and
 *   replays it on every subsequent Start tap so the kid can play
 *   in the car with no signal.
 *
 * Same key + endpoint Gemininio uses today, so the family already
 * has everything configured (build-time key OR a per-device paste).
 */

import type { Lang } from "../lang";
import type { Quiz, QuizQuestion } from "../../data/types";
import { buildQuizSystemPrompt, buildQuizUserMessage } from "./quizPersona";

const MODELS_TO_TRY = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash"] as const;

const OPTIONS_PER_QUESTION = 4;

/** Default question count. Live-mode batches use this; offline pack
 *  calls override to 10. Picked because 5 is short enough to read
 *  out loud comfortably in a single car-ride pause. */
export const DEFAULT_QUESTIONS_PER_BATCH = 5;
export const QUESTIONS_PER_OFFLINE_PACK = 10;

/* ------------------------------------------------------------------ */
/* Offline pack storage (one entry per (day, lang), no expiry)         */
/* ------------------------------------------------------------------ */

const OFFLINE_PACK_PREFIX = "tuscany2026.quiz.offlinePack.v1";

function offlinePackKey(dayNumber: number, lang: Lang): string {
  return `${OFFLINE_PACK_PREFIX}.day${dayNumber}.${lang}`;
}

export function loadOfflinePack(dayNumber: number, lang: Lang): Quiz | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(offlinePackKey(dayNumber, lang));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Quiz;
    if (!isValidQuiz(parsed, parsed.questions?.length ?? 0)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearOfflinePack(dayNumber: number, lang: Lang): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(offlinePackKey(dayNumber, lang));
  } catch {
    /* ignore */
  }
}

export function saveOfflinePack(quiz: Quiz): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(offlinePackKey(quiz.day, quiz.lang), JSON.stringify(quiz));
  } catch {
    /* private browsing / quota — silently ignore. The kid will get
       a fresh generation next time the toggle flips to offline. */
  }
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

function isValidQuestion(q: unknown): q is QuizQuestion {
  if (!q || typeof q !== "object") return false;
  const o = q as Record<string, unknown>;
  if (typeof o.question !== "string" || !o.question.trim()) return false;
  if (!Array.isArray(o.options) || o.options.length !== OPTIONS_PER_QUESTION) return false;
  if (!o.options.every(opt => typeof opt === "string" && opt.trim().length > 0)) return false;
  // Ensure options are distinct (Gemini sometimes hallucinates 4 identical options)
  const uniqueOptions = new Set(o.options.map(opt => opt.trim().toLowerCase()));
  if (uniqueOptions.size < OPTIONS_PER_QUESTION) return false;
  if (typeof o.correctIndex !== "number") return false;
  if (!Number.isInteger(o.correctIndex)) return false;
  if (o.correctIndex < 0 || o.correctIndex >= OPTIONS_PER_QUESTION) return false;
  if (typeof o.reactionCorrect !== "string" || !o.reactionCorrect.trim()) return false;
  if (typeof o.reactionWrong !== "string" || !o.reactionWrong.trim()) return false;
  return true;
}

function isValidQuiz(q: unknown, expectedCount: number): q is Quiz {
  if (!q || typeof q !== "object") return false;
  const o = q as Record<string, unknown>;
  if (typeof o.day !== "number") return false;
  if (o.lang !== "en" && o.lang !== "he") return false;
  if (typeof o.generatedAt !== "number") return false;
  if (!Array.isArray(o.questions)) return false;
  if (expectedCount > 0 && o.questions.length !== expectedCount) return false;
  return o.questions.every(isValidQuestion);
}

/* ------------------------------------------------------------------ */
/* Response parsing — Gemini sometimes wraps JSON in code fences       */
/* despite "no markdown" instructions, so be defensive.                */
/* ------------------------------------------------------------------ */

function extractJsonBlock(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) return fenceMatch[1].trim();
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    return trimmed.slice(first, last + 1);
  }
  return trimmed;
}

function extractTextFromCandidate(candidate: unknown): string {
  if (!candidate || typeof candidate !== "object") return "";
  const c = candidate as { content?: { parts?: unknown[] } };
  const parts = c.content?.parts;
  if (!Array.isArray(parts)) return "";
  const chunks: string[] = [];
  for (const p of parts) {
    if (!p || typeof p !== "object") continue;
    if ((p as { thought?: boolean }).thought === true) continue;
    const text = (p as { text?: string }).text;
    if (typeof text === "string" && text.length) chunks.push(text);
  }
  return chunks.join("\n").trim();
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export interface GenerateQuizParams {
  apiKey: string;
  dayNumber: number;
  lang: Lang;
  /** How many questions to ask Gemini for. Live batches use 5;
   *  the offline-pack generator uses 10. Default is 5. */
  count?: number;
  signal?: AbortSignal;
  /** Previous questions to avoid repeating. */
  avoidQuestions?: string[];
}

/**
 * Hits Gemini REST and returns a validated quiz of `params.count`
 * questions for the given day + language. Throws on transport /
 * parse / validation failure so the UI can show a retry button.
 *
 * **Does NOT cache.** Live mode wants fresh batches on every call;
 * the offline pack flow caches separately via `saveOfflinePack`
 * after a successful 10-question generation (see
 * `ensureOfflinePack`).
 */
export async function generateQuiz(params: GenerateQuizParams): Promise<Quiz> {
  const count = params.count ?? DEFAULT_QUESTIONS_PER_BATCH;

  const systemInstruction = buildQuizSystemPrompt(params.dayNumber, params.lang, count);
  const userMessage = buildQuizUserMessage(params.lang, count, params.avoidQuestions);

  let lastErr = "No model accepted the quiz request.";

  for (const model of MODELS_TO_TRY) {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent` +
      `?key=${encodeURIComponent(params.apiKey)}`;

    const body: Record<string, unknown> = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }]
        }
      ],
      generationConfig: {
        // Slightly higher than gemininio's 0.45 — we want the questions
        // to feel fresh batch-to-batch in live mode rather than the
        // same five every round, but not so high the model strays from
        // the digest. Larger packs (the 10-question offline build) want
        // even more spread inside the set, so nudge up a touch.
        temperature: count >= 10 ? 0.85 : 0.75,
        maxOutputTokens: count >= 10 ? 2800 : 1500,
        responseMimeType: "application/json"
      }
    };

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: params.signal
      });
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
      continue;
    }

    const raw = await res.text();
    if (!res.ok) {
      lastErr = raw.slice(0, 400) || `HTTP ${res.status}`;
      continue;
    }

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      lastErr = "Invalid JSON envelope from Gemini.";
      continue;
    }

    const root = json as { candidates?: unknown[]; error?: { message?: string } };
    if (root.error?.message) {
      lastErr = root.error.message;
      continue;
    }

    const text = extractTextFromCandidate(root.candidates?.[0]);
    if (!text) {
      lastErr = "Empty quiz reply from model.";
      continue;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJsonBlock(text));
    } catch (e) {
      lastErr = `Quizzo's JSON was malformed: ${e instanceof Error ? e.message : e}`;
      continue;
    }

    const wrapper = parsed as { questions?: unknown };
    if (!Array.isArray(wrapper?.questions)) {
      lastErr = "Quizzo's reply was missing the questions array.";
      continue;
    }

    const questions = wrapper.questions.filter(isValidQuestion).slice(0, count);
    if (questions.length !== count) {
      lastErr = `Quizzo wrote ${questions.length} valid questions, needed ${count}.`;
      continue;
    }

    // Force a client-side shuffle of the options to ensure correctIndex is truly random,
    // because Gemini often anchors to `0` from the prompt example.
    for (const q of questions) {
      const correctText = q.options[q.correctIndex];
      for (let i = q.options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
      }
      q.correctIndex = q.options.indexOf(correctText);
    }

    return {
      day: params.dayNumber,
      lang: params.lang,
      questions,
      generatedAt: Date.now()
    };
  }

  throw new Error(lastErr);
}

/**
 * Get the offline 10-question pack for `(day, lang)`, generating
 * + persisting it on first call. Subsequent calls (this session,
 * any future session, even fully offline) replay from
 * `localStorage` instantly.
 *
 * Throws if there is no cached pack AND we can't generate (no API
 * key, network failure, etc.) — the caller surfaces that as the
 * "Offline pack isn't ready" copy.
 */
export async function ensureOfflinePack(params: {
  apiKey: string | null;
  dayNumber: number;
  lang: Lang;
  signal?: AbortSignal;
  /** When true, ignore the cache and force a fresh generation. */
  forceRefresh?: boolean;
}): Promise<Quiz> {
  if (!params.forceRefresh) {
    const cached = loadOfflinePack(params.dayNumber, params.lang);
    if (cached) return cached;
  }

  if (!params.apiKey) {
    throw new Error("offline-pack-needs-network");
  }

  const quiz = await generateQuiz({
    apiKey: params.apiKey,
    dayNumber: params.dayNumber,
    lang: params.lang,
    count: QUESTIONS_PER_OFFLINE_PACK,
    signal: params.signal
  });
  saveOfflinePack(quiz);
  return quiz;
}
