/**
 * Quiz with Quizzo — the per-day kid-friendly recap.
 *
 * Two play modes the kid toggles between via a segmented control at
 * the bottom of the card (persisted per device, default `offline`):
 *
 *   - **Offline (10 q)** — the offline pack: 10 questions, generated
 *     once per `(day, lang)` and cached in `localStorage` forever.
 *     After the first successful generation the day plays without a
 *     network connection. Standard fixed-end → score flow. **Falls
 *     back to a template-based bundled question pack** when Gemini
 *     refuses (no key, free-tier quota, network down, etc.) so the
 *     kid never lands on a dead "Quizzo got tongue-tied" screen.
 *   - **Live (endless)** — questions in batches of 5, with the next
 *     batch prefetched in the background while the kid answers the
 *     last two of the current one. Round ends when the kid taps
 *     "End round". No fallback — live mode without API surfaces the
 *     real error so the user knows to switch to offline.
 *
 * Top-level props gate the card:
 *   - `locked` true → render `LockedView` (with unlock date), no
 *     toggle, no audio. The first N days are unlocked early as a
 *     preview; the rest open on their chapter date.
 *
 * State machine inside the unlocked card:
 *   - idle     : Start button, last-score chip, mode toggle
 *   - loading  : "Quizzo is warming up…" while we generate / load
 *   - playing  : <QuizQuestion>; Next + (live mode) End round; the
 *                playing phase carries `mode` + `usingFallback` so
 *                it knows whether to expose End round, kick off
 *                prefetch, and surface the fallback banner
 *   - done     : score screen; Play again / (live) New questions /
 *                Ask Quizzo something
 *   - error    : "Quizzo got tongue-tied" with Try again (live mode
 *                only — offline mode falls through to fallback)
 *
 * A persistent mute icon in the card chrome silences voice + SFX
 * (saved per device).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  RotateCcw,
  RefreshCw,
  MessageCircle,
  PartyPopper,
  X,
  ChevronRight,
  ChevronLeft,
  Wifi,
  WifiOff,
  StopCircle,
  Lock,
  Volume2,
  VolumeX
} from "lucide-react";
import { useT } from "../lib/dict";
import { useLang } from "../lib/i18n";
import type { Lang } from "../lib/lang";
import type { Quiz as QuizType, QuizMode } from "../data/types";
import {
  generateQuiz,
  loadOfflinePack,
  saveOfflinePack,
  clearOfflinePack,
  DEFAULT_QUESTIONS_PER_BATCH,
  QUESTIONS_PER_OFFLINE_PACK
} from "../lib/quiz/generateQuiz";
import { buildFallbackQuiz } from "../lib/quiz/fallbackQuiz";
import { createQuizVoice, type QuizVoice } from "../lib/quiz/quizVoice";
import { useQuizSfx } from "../lib/quiz/quizSfx";
import {
  loadLastScore,
  saveLastScore,
  type LastScore
} from "../lib/quiz/quizScoreStorage";
import { loadQuizMode, saveQuizMode } from "../lib/quiz/quizModeStorage";
import { loadQuizMute, saveQuizMute } from "../lib/quiz/quizMute";
import { getQuizzoIntro, getQuizzoOutro } from "../lib/quiz/quizPersona";
import { getApiKey } from "../lib/gemininio/storage";
import { requestOpenGemininio } from "../lib/gemininio/openEvent";
import QuizQuestion from "./QuizQuestion";

/** When the kid is at index `length - PREFETCH_AHEAD` (or beyond),
 *  start fetching the next live-mode batch. Two-question lead time
 *  is a nice balance between "it's ready before the kid catches up"
 *  and "we don't burn API on questions they'll never see". */
const PREFETCH_AHEAD = 0;

type Phase =
  | { kind: "idle" }
  | { kind: "loading"; mode: QuizMode }
  | {
      kind: "playing";
      mode: QuizMode;
      questions: QuizType["questions"];
      current: number;
      selections: (number | null)[];
      /** True while a background batch fetch is in flight (live mode). */
      isFetchingMore: boolean;
      /** Set when the most recent prefetch attempt failed; lets us
       *  show the "Couldn't load more — end the round?" copy without
       *  swallowing the error silently. */
      fetchMoreFailed: boolean;
      /** True when the current questions came from `buildFallbackQuiz`
       *  (offline mode + Gemini failure / no key). Drives the banner
       *  that explains why the questions feel basic. */
      usingFallback: boolean;
    }
  | {
      kind: "done";
      mode: QuizMode;
      questions: QuizType["questions"];
      selections: (number | null)[];
      score: number;
      usingFallback: boolean;
    }
  | { kind: "error"; message: string; mode: QuizMode };

export default function Quiz({
  day,
  locked = false,
  unlockDate = null
}: {
  day: number;
  /** Hide the playable card and show a "unlocks on …" notice instead.
   *  Driven by `isQuizUnlocked` in the chapter page. */
  locked?: boolean;
  /** ISO date string ("2026-08-20") used inside the locked notice.
   *  Ignored when `locked` is false. */
  unlockDate?: string | null;
}) {
  const t = useT();
  const { lang } = useLang();
  const isRTL = lang === "he";

  const [mode, setMode] = useState<QuizMode>(() => loadQuizMode());
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [lastScore, setLastScore] = useState<LastScore | null>(() => loadLastScore(day, lang));
  const [voiceBackend, setVoiceBackend] = useState<QuizVoice["backend"] | null>(null);
  const [muted, setMuted] = useState<boolean>(() => loadQuizMute());

  const voiceRef = useRef<QuizVoice | null>(null);
  /** Kept in sync with `muted` state so the speak / play guards
   *  always see the latest value without re-binding callbacks. */
  const mutedRef = useRef<boolean>(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  /** Latch so a single round only kicks off ONE background fetch at
   *  a time; multiple selections inside the prefetch window must not
   *  spawn parallel requests. */
  const fetchingMoreRef = useRef(false);
  /** Abort the in-flight live-batch fetch when the kid ends the
   *  round / closes the card / changes chapter. */
  const fetchAbortRef = useRef<AbortController | null>(null);
  const sfx = useQuizSfx();

  /** Tear down voice + any in-flight fetch on unmount.
   *
   *  Note: ChapterDetailPage keys this component on `(day, lang)`,
   *  so a chapter-nav or language flip remounts us fresh — no
   *  cross-prop reset effect lives here on purpose. */
  useEffect(() => {
    return () => {
      voiceRef.current?.dispose();
      voiceRef.current = null;
      fetchAbortRef.current?.abort();
      fetchAbortRef.current = null;
    };
  }, []);

  /** Mute-aware speak: drops the utterance silently when the kid (or
   *  parent) has muted Quizzo, and never throws — voice failures are
   *  always non-fatal. */
  function speak(text: string): void {
    if (mutedRef.current) return;
    void voiceRef.current?.speak(text).catch(() => {
      /* swallow — voice is best-effort */
    });
  }

  /** Mute-aware SFX play. */
  function playSfx(name: Parameters<typeof sfx.play>[0]): void {
    if (mutedRef.current) return;
    sfx.play(name);
  }

  function toggleMute() {
    setMuted(prev => {
      const next = !prev;
      saveQuizMute(next);
      // Cut off any in-flight utterance immediately when the user
      // mutes — otherwise the current line keeps reading until it
      // naturally ends, which feels broken.
      if (next) voiceRef.current?.cancel();
      return next;
    });
  }

  /* ---------------- mode toggle ---------------- */

  function changeMode(next: QuizMode) {
    if (next === mode) return;
    // Only allow flipping the mode in calm phases. Phases that own
    // an active session (loading / playing) keep the toggle disabled
    // so we don't have to surgically reconcile mid-quiz.
    if (phase.kind !== "idle" && phase.kind !== "done" && phase.kind !== "error") return;
    setMode(next);
    saveQuizMode(next);
    // Reset back to idle when switching modes after a finished round
    // — the score chip is preserved separately (`lastScore`).
    if (phase.kind !== "idle") setPhase({ kind: "idle" });
  }

  /* ---------------- core actions ---------------- */

  /**
   * Start (or restart) a quiz round in the currently-selected mode.
   *
   * Offline mode flow:
   *   1. Try cached pack from localStorage → instant play.
   *   2. Else try Gemini (10 questions) → cache + play.
   *   3. Else (no key OR Gemini failure) → use `buildFallbackQuiz`
   *      and CACHE that too so subsequent plays are instant. The
   *      "New questions" button on the score screen wipes the cache
   *      and re-tries Gemini.
   *
   * Live mode flow: fetch first batch of 5; further batches arrive
   * via background prefetch as the kid plays. No fallback — surfaces
   * the real error so the user knows to switch modes.
   */
  async function startQuiz(opts: { forceRefresh?: boolean } = {}) {
    fetchAbortRef.current?.abort();
    fetchAbortRef.current = null;
    fetchingMoreRef.current = false;

    setPhase({ kind: "loading", mode });

    try {
      const apiKey = getApiKey();

      if (mode === "offline") {
        // Step 1 — cached pack (real or previously-saved fallback).
        const cached = !opts.forceRefresh ? loadOfflinePack(day, lang) : null;
        if (cached) {
          startPlayingWith(cached, cached.generatedAt === 0);
          return;
        }

        // Step 2 — try Gemini if we have a key.
        if (apiKey) {
          try {
            const fresh = await generateQuiz({
              apiKey,
              dayNumber: day,
              lang,
              count: QUESTIONS_PER_OFFLINE_PACK
            });
            saveOfflinePack(fresh);
            startPlayingWith(fresh, false);
            return;
          } catch {
            // Quota / network / parse failure → fall through to
            // the template-based fallback below. We don't re-throw
            // because offline mode promises *something* to play.
          }
        }

        // Step 3 — bundled fallback. Cached so the next play is
        // instant and we don't re-try Gemini until "New questions".
        const fallback = buildFallbackQuiz(day, lang);
        if (fallback.questions.length === 0) {
          // Itinerary data was too thin for any template — surface
          // a real error rather than open an empty quiz.
          setPhase({
            kind: "error",
            mode,
            message: t("quiz_offline_pack_unavailable")
          });
          return;
        }
        saveOfflinePack(fallback);
        startPlayingWith(fallback, true);
        return;
      }

      // Live mode — fetch the first batch only, prefetch the rest.
      if (!apiKey) {
        setPhase({ kind: "error", mode, message: t("quiz_offline") });
        return;
      }
      const ctrl = new AbortController();
      fetchAbortRef.current = ctrl;
      const quiz = await generateQuiz({
        apiKey,
        dayNumber: day,
        lang,
        count: DEFAULT_QUESTIONS_PER_BATCH,
        signal: ctrl.signal
      });
      if (ctrl.signal.aborted) return;
      startPlayingWith(quiz, false);
    } catch (err) {
      if ((err as { name?: string })?.name === "AbortError") return;
      setPhase({
        kind: "error",
        mode,
        message: err instanceof Error ? err.message : t("quiz_error")
      });
    }
  }

  function startPlayingWith(quiz: QuizType, usingFallback: boolean) {
    setPhase({
      kind: "playing",
      mode,
      questions: quiz.questions,
      current: 0,
      selections: quiz.questions.map(() => null),
      isFetchingMore: false,
      fetchMoreFailed: false,
      usingFallback
    });
    void openVoiceAndAnnounce(quiz, usingFallback);
  }

  async function openVoiceAndAnnounce(quiz: QuizType, usingFallback: boolean) {
    // For fallback quizzes we still try to open a voice (Browser TTS
    // works without Gemini), but skip the Live attempt to save the
    // 3s connect timeout — Gemini is presumed unavailable.
    if (mutedRef.current) {
      setVoiceBackend("none");
      return;
    }

    try {
      const voice = await createQuizVoice({
        apiKey: usingFallback ? null : getApiKey(),
        lang
      });
      voiceRef.current?.dispose();
      voiceRef.current = voice;
      setVoiceBackend(voice.backend);

      speak(getQuizzoIntro(lang, day));
      speak(quiz.questions[0].question);
    } catch {
      setVoiceBackend("none");
    }
  }

  /** Live-mode background fetch of the next batch. Called from
   *  `handleSelect` once we cross the prefetch threshold. */
  async function prefetchNextBatch() {
    if (fetchingMoreRef.current) return;
    if (phase.kind !== "playing" || phase.mode !== "live") return;
    const apiKey = getApiKey();
    if (!apiKey) return;

    fetchingMoreRef.current = true;
    setPhase(p =>
      p.kind === "playing" ? { ...p, isFetchingMore: true, fetchMoreFailed: false } : p
    );

    const ctrl = new AbortController();
    fetchAbortRef.current = ctrl;
    try {
      const next = await generateQuiz({
        apiKey,
        dayNumber: day,
        lang,
        count: DEFAULT_QUESTIONS_PER_BATCH,
        signal: ctrl.signal
      });
      if (ctrl.signal.aborted) return;
      setPhase(p => {
        if (p.kind !== "playing") return p;
        return {
          ...p,
          questions: [...p.questions, ...next.questions],
          selections: [...p.selections, ...next.questions.map(() => null)],
          isFetchingMore: false,
          fetchMoreFailed: false
        };
      });
    } catch (err) {
      if ((err as { name?: string })?.name === "AbortError") return;
      setPhase(p =>
        p.kind === "playing"
          ? { ...p, isFetchingMore: false, fetchMoreFailed: true }
          : p
      );
    } finally {
      fetchingMoreRef.current = false;
    }
  }

  function handleSelect(optionIndex: number) {
    setPhase(p => {
      if (p.kind !== "playing") return p;
      if (p.selections[p.current] !== null) return p;
      const nextSelections = [...p.selections];
      nextSelections[p.current] = optionIndex;
      const isCorrect = optionIndex === p.questions[p.current].correctIndex;

      playSfx(isCorrect ? "correct" : "wrong");

      const reaction = isCorrect
        ? p.questions[p.current].reactionCorrect
        : `${p.questions[p.current].reactionWrong} ${p.questions[p.current].options[p.questions[p.current].correctIndex]}`;
      speak(reaction);

      // Live-mode prefetch: kick off when the kid is near the end of
      // the current batch. Fires once per batch thanks to the latch.
      if (
        p.mode === "live" &&
        p.current >= p.questions.length - PREFETCH_AHEAD &&
        !fetchingMoreRef.current
      ) {
        // Defer to next tick so the state update lands first.
        queueMicrotask(() => void prefetchNextBatch());
      }

      return { ...p, selections: nextSelections };
    });
  }

  function handleNext() {
    setPhase(p => {
      if (p.kind !== "playing") return p;
      const nextIndex = p.current + 1;

      if (nextIndex >= p.questions.length) {
        if (p.mode === "offline") {
          return finishRound(p);
        }
        // Live mode at the tail: if a prefetch is in flight we'll
        // simply hold position — the questions array will grow under
        // us and the Next button reappears. If the prefetch failed,
        // surface the "couldn't load more" copy via fetchMoreFailed
        // and let the kid hit End round.
        return p;
      }

      const next = p.questions[nextIndex];
      speak(next.question);

      return { ...p, current: nextIndex };
    });
  }

  function handleEndRound() {
    setPhase(p => (p.kind === "playing" ? finishRound(p) : p));
  }

  /** Pure helper used by both Next-at-end (offline) and End round
   *  (live). Computes score, persists it, plays the closing flourish,
   *  and returns the next phase. */
  function finishRound(
    p: Extract<Phase, { kind: "playing" }>
  ): Extract<Phase, { kind: "done" }> {
    fetchAbortRef.current?.abort();
    fetchAbortRef.current = null;
    fetchingMoreRef.current = false;

    const answered = p.selections.filter((s): s is number => s !== null);
    const score = p.selections.reduce<number>((acc, sel, i) => {
      if (sel !== null && sel === p.questions[i].correctIndex) return acc + 1;
      return acc;
    }, 0);

    // Only count it as a recorded score if the kid answered at least
    // one question — bailing immediately shouldn't overwrite a real
    // earlier score with 0/0.
    if (answered.length > 0) {
      saveLastScore(day, lang, score, answered.length);
      setLastScore({ score, total: answered.length, ts: Date.now() });
    }

    playSfx("whoosh");
    speak(getQuizzoOutro(lang, score, answered.length));

    return {
      kind: "done",
      mode: p.mode,
      questions: p.questions.slice(0, answered.length),
      selections: answered,
      score,
      usingFallback: p.usingFallback
    };
  }

  function handleClose() {
    fetchAbortRef.current?.abort();
    fetchAbortRef.current = null;
    fetchingMoreRef.current = false;
    voiceRef.current?.cancel();
    voiceRef.current?.dispose();
    voiceRef.current = null;
    setVoiceBackend(null);
    setPhase({ kind: "idle" });
  }

  function handleAskQuizzo() {
    requestOpenGemininio();
  }

  /** "New questions" — clear the cached offline pack (so the next
   *  `startQuiz` re-tries Gemini for a fresh real pack) and restart.
   *  In live mode this is just "play another round". */
  function handleNewQuestions() {
    if (mode === "offline") clearOfflinePack(day, lang);
    void startQuiz({ forceRefresh: true });
  }

  /* ---------------- render ---------------- */

  if (locked) {
    return (
      <section>
        <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cream-50 via-cream-100 to-terracotta-500/10 ring-1 ring-cream-300/70 shadow-[0_18px_50px_-30px_rgba(151,109,76,0.45)]">
          <Sparkles
            size={140}
            strokeWidth={1}
            className="absolute -top-6 end-0 text-terracotta-600 opacity-[0.06] pointer-events-none rtl:scale-x-[-1]"
            aria-hidden
          />
          <div className="relative px-5 sm:px-8 py-6 sm:py-8">
            <LockedView unlockDate={unlockDate} lang={lang} />
          </div>
        </article>
      </section>
    );
  }

  const toggleDisabled = phase.kind === "loading" || phase.kind === "playing";
  const showCloseButton =
    phase.kind === "playing" || phase.kind === "done" || phase.kind === "error";

  return (
    <section>
      <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cream-50 via-cream-100 to-terracotta-500/10 ring-1 ring-cream-300/70 shadow-[0_18px_50px_-30px_rgba(151,109,76,0.45)]">
        <Sparkles
          size={140}
          strokeWidth={1}
          className="absolute -top-6 end-0 text-terracotta-600 opacity-[0.06] pointer-events-none rtl:scale-x-[-1]"
          aria-hidden
        />

        {/* Card-chrome controls — mute is always visible, close
            shows in playing/done/error. Sits above the Sparkles
            decoration. */}
        <div className="absolute top-3 end-3 z-10 flex items-center gap-1">
          <button
            type="button"
            onClick={toggleMute}
            aria-pressed={muted}
            aria-label={t(muted ? "quiz_unmute" : "quiz_mute")}
            title={t(muted ? "quiz_unmute" : "quiz_mute")}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              muted
                ? "bg-terracotta-500/10 text-terracotta-600 hover:bg-terracotta-500/20"
                : "text-ink-700/55 hover:bg-cream-100 hover:text-ink-800"
            }`}
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          {showCloseButton && (
            <button
              type="button"
              onClick={handleClose}
              aria-label={t("quiz_close")}
              className="w-8 h-8 rounded-full text-ink-700/55 hover:bg-cream-100 hover:text-ink-800 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="relative px-5 sm:px-8 py-6 sm:py-8">
          <AnimatePresence mode="wait">
            {phase.kind === "idle" && (
              <IdleView
                key="idle"
                onStart={() => startQuiz()}
                lastScore={lastScore}
                mode={mode}
              />
            )}
            {phase.kind === "loading" && (
              <LoadingView
                key="loading"
                isOfflinePackBuild={
                  phase.mode === "offline" && !loadOfflinePack(day, lang)
                }
              />
            )}
            {phase.kind === "playing" && (
              <PlayingView
                key={`playing-${phase.current}`}
                phase={phase}
                voiceBackend={voiceBackend}
                muted={muted}
                onSelect={handleSelect}
                onNext={handleNext}
                onEndRound={handleEndRound}
                isRTL={isRTL}
              />
            )}
            {phase.kind === "done" && (
              <DoneView
                key="done"
                phase={phase}
                onPlayAgain={() => startQuiz()}
                onNewQuestions={handleNewQuestions}
                onAskQuizzo={handleAskQuizzo}
              />
            )}
            {phase.kind === "error" && (
              <ErrorView
                key="error"
                message={phase.message}
                onRetry={() => startQuiz()}
              />
            )}
          </AnimatePresence>

          {/* Mode toggle — always rendered at the bottom, disabled
              during loading / playing so we don't have to reconcile
              a mid-quiz mode flip. */}
          <ModeToggle
            mode={mode}
            disabled={toggleDisabled}
            onChange={changeMode}
          />
        </div>
      </article>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-views                                                           */
/* ------------------------------------------------------------------ */

function CardEyebrow() {
  const t = useT();
  return (
    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-terracotta-600/85 font-medium">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta-500" />
      {t("quiz_eyebrow")}
    </div>
  );
}

function FallbackBanner() {
  const t = useT();
  return (
    <div className="mb-4 px-3 py-2 rounded-xl bg-gold-500/10 ring-1 ring-gold-500/35 text-[12px] text-sienna-600 leading-snug">
      {t("quiz_fallback_banner")}
    </div>
  );
}

function IdleView({
  onStart,
  lastScore,
  mode
}: {
  onStart: () => void;
  lastScore: LastScore | null;
  mode: QuizMode;
}) {
  const t = useT();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <CardEyebrow />
      <h2 className="mt-3 sm:mt-4 font-serif italic text-3xl sm:text-5xl text-ink-900 leading-none">
        {t("quiz_title")}
      </h2>
      <p className="mt-3 text-[14.5px] sm:text-[16px] text-ink-700/85 leading-relaxed max-w-xl">
        {t("quiz_subtitle")}
      </p>

      <div className="mt-5 sm:mt-6 flex items-center flex-wrap gap-3">
        <motion.button
          type="button"
          onClick={onStart}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-cream-50 text-[14px] font-medium shadow-md shadow-terracotta-700/25 transition-colors"
        >
          <Sparkles size={15} strokeWidth={2.1} />
          {t("quiz_start")}
        </motion.button>

        {/* Tiny chip telling the kid which mode they're about to
            play in — no surprises when they hit Start. */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-50 ring-1 ring-cream-300/70 text-[12px] text-ink-700/75">
          {mode === "offline" ? (
            <WifiOff size={12} strokeWidth={2} className="text-olive-700" />
          ) : (
            <Wifi size={12} strokeWidth={2} className="text-terracotta-600" />
          )}
          {t(mode === "offline" ? "quiz_mode_offline" : "quiz_mode_live")}
        </span>

        {lastScore && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-50 ring-1 ring-cream-300/70 text-[12px] text-ink-700/80">
            <PartyPopper size={12} className="text-gold-500" strokeWidth={2} />
            {t("quiz_score", { score: lastScore.score, total: lastScore.total })}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function LoadingView({ isOfflinePackBuild }: { isOfflinePackBuild: boolean }) {
  const t = useT();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-3 py-3"
    >
      <Loader2 size={20} className="animate-spin text-terracotta-600" />
      <div className="font-serif italic text-[16px] sm:text-lg text-ink-800">
        {t(isOfflinePackBuild ? "quiz_offline_preparing" : "quiz_loading")}
      </div>
    </motion.div>
  );
}

function PlayingView({
  phase,
  voiceBackend,
  muted,
  onSelect,
  onNext,
  onEndRound,
  isRTL
}: {
  phase: Extract<Phase, { kind: "playing" }>;
  voiceBackend: QuizVoice["backend"] | null;
  muted: boolean;
  onSelect: (i: number) => void;
  onNext: () => void;
  onEndRound: () => void;
  isRTL: boolean;
}) {
  const t = useT();
  const { mode, questions, current, selections, isFetchingMore, fetchMoreFailed, usingFallback } = phase;
  const question = questions[current];
  const locked = selections[current] !== null;
  const atTail = current === questions.length - 1;
  const isLast = mode === "offline" && atTail;
  // For live mode at the tail, the Next button only works once the
  // background prefetch lands more questions. Show a loader instead
  // until the array grows (or fetchMoreFailed is true).
  const liveWaitingForMore = mode === "live" && atTail && locked && isFetchingMore;
  const liveOutOfMore = mode === "live" && atTail && locked && fetchMoreFailed;

  const score = selections.reduce<number>(
    (acc, sel, i) =>
      sel !== null && sel === questions[i].correctIndex ? acc + 1 : acc,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3 }}
    >
      {/* Eyebrow row — close button lives in card chrome now, so
          this row is just the eyebrow. Right-padded so it doesn't
          collide with the absolute-positioned mute / close cluster. */}
      <div className="mb-4 pe-20">
        <CardEyebrow />
      </div>

      {usingFallback && <FallbackBanner />}

      {/* Voice-unavailable hint shown only when audio is unmuted —
          if the kid muted intentionally the hint is just noise. */}
      {!muted && voiceBackend === "none" && (
        <div className="mb-4 px-3 py-2 rounded-xl bg-gold-500/10 ring-1 ring-gold-500/35 text-[12px] text-sienna-600 leading-snug">
          {t("quiz_voice_unavailable")}
        </div>
      )}

      <QuizQuestion
        question={question}
        index={current + 1}
        total={mode === "offline" ? questions.length : 0}
        selectedIndex={selections[current]}
        onSelect={onSelect}
      />

      {locked && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="mt-5 flex flex-wrap items-center justify-end gap-2.5"
        >
          {/* Live-mode End round button. Available after the kid has
              answered at least the first question — keeps the option
              visible without crowding the chip row before that. */}
          {mode === "live" && (
            <button
              type="button"
              onClick={onEndRound}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-cream-50 ring-1 ring-cream-300/70 hover:ring-terracotta-500/55 text-ink-700/85 text-[12.5px] font-medium transition-colors"
            >
              <StopCircle size={13} strokeWidth={2.1} />
              {t("quiz_end_round")}
            </button>
          )}

          {liveWaitingForMore ? (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-cream-100 text-ink-700/70 text-[12.5px]">
              <Loader2 size={13} className="animate-spin" />
              {t("quiz_loading_more")}
            </div>
          ) : liveOutOfMore ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-terracotta-500/10 text-terracotta-700 text-[12.5px]">
              {t("quiz_load_more_failed")}
            </div>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-ink-900 hover:bg-ink-800 text-cream-50 text-[13px] font-medium transition-colors"
            >
              {isLast
                ? t("quiz_score", {
                    score,
                    total: questions.length
                  })
                : mode === "live"
                  ? t("quiz_keep_going")
                  : t("next")}
              {isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

function DoneView({
  phase,
  onPlayAgain,
  onNewQuestions,
  onAskQuizzo
}: {
  phase: Extract<Phase, { kind: "done" }>;
  onPlayAgain: () => void;
  onNewQuestions: () => void;
  onAskQuizzo: () => void;
}) {
  const t = useT();
  const total = phase.selections.length;
  const score = phase.score;
  const flavor = useMemo<string>(() => {
    if (total === 0) return t("quiz_score_low");
    const ratio = score / total;
    if (ratio === 1) return t("quiz_score_perfect");
    if (ratio >= 0.8) return t("quiz_score_great");
    if (ratio >= 0.4) return t("quiz_score_ok");
    return t("quiz_score_low");
  }, [score, total, t]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 pe-20">
        <CardEyebrow />
      </div>

      {phase.usingFallback && <FallbackBanner />}

      <div className="mt-1 flex items-baseline flex-wrap gap-x-3 gap-y-1">
        <h2 className="font-serif italic text-4xl sm:text-6xl text-ink-900 leading-none">
          {score}
          <span className="text-ink-700/40 mx-1">/</span>
          {total}
        </h2>
        <div className="text-[12px] uppercase tracking-[0.22em] text-terracotta-600/85 font-medium">
          {t("quiz_score", { score, total })}
        </div>
      </div>

      <p className="mt-3 font-serif italic text-[16px] sm:text-lg text-ink-800/90 leading-snug">
        {flavor}
      </p>

      <div className="mt-5 sm:mt-6 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={onPlayAgain}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-cream-50 text-[13px] font-medium shadow-md shadow-terracotta-700/25 transition-colors"
        >
          <RotateCcw size={13} strokeWidth={2.1} />
          {t("quiz_play_again")}
        </button>
        <button
          type="button"
          onClick={onNewQuestions}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-cream-50 ring-1 ring-cream-300/70 hover:ring-terracotta-500/55 text-ink-800 text-[13px] font-medium transition-colors"
        >
          <RefreshCw size={13} strokeWidth={2.1} />
          {t("quiz_new_questions")}
        </button>
        <button
          type="button"
          onClick={onAskQuizzo}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-cream-50 ring-1 ring-cream-300/70 hover:ring-terracotta-500/55 text-ink-800 text-[13px] font-medium transition-colors"
        >
          <MessageCircle size={13} strokeWidth={2.1} />
          {t("quiz_ask_quizzo")}
        </button>
      </div>
    </motion.div>
  );
}

function ErrorView({
  message,
  onRetry
}: {
  message: string;
  onRetry: () => void;
}) {
  const t = useT();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-3 pe-20">
        <CardEyebrow />
      </div>

      <h2 className="font-serif italic text-2xl sm:text-3xl text-ink-900">
        {t("quiz_error")}
      </h2>
      <p className="mt-2 text-[13.5px] sm:text-[14.5px] text-ink-700/75 leading-relaxed">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-cream-50 text-[13px] font-medium transition-colors"
      >
        <RotateCcw size={13} strokeWidth={2.1} />
        {t("quiz_play_again")}
      </button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Locked view — chapter date hasn't arrived (and not in preview).     */
/* ------------------------------------------------------------------ */

function LockedView({
  unlockDate,
  lang
}: {
  unlockDate: string | null;
  lang: Lang;
}) {
  const t = useT();
  const friendlyDate = useMemo(() => {
    if (!unlockDate) return "";
    const [y, m, d] = unlockDate.split("-").map(Number);
    if (!y || !m || !d) return unlockDate;
    const dt = new Date(y, m - 1, d);
    try {
      return new Intl.DateTimeFormat(lang === "he" ? "he-IL" : "en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
      }).format(dt);
    } catch {
      return unlockDate;
    }
  }, [unlockDate, lang]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-terracotta-600/65 font-medium">
        <Lock size={12} strokeWidth={2.1} />
        {t("quiz_locked_eyebrow")}
      </div>
      <h2 className="mt-3 sm:mt-4 font-serif italic text-2xl sm:text-4xl text-ink-900 leading-tight">
        {t("quiz_locked_title")}
      </h2>
      {friendlyDate && (
        <p className="mt-3 text-[14.5px] sm:text-[16px] text-ink-700/85 leading-relaxed">
          {t("quiz_locked_unlocks_on", { date: friendlyDate })}
        </p>
      )}
      <p className="mt-3 text-[12.5px] sm:text-[13.5px] text-ink-700/65 leading-snug max-w-xl">
        {t("quiz_locked_hint_preview")}
      </p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Mode toggle — segmented control at the bottom of the card           */
/* ------------------------------------------------------------------ */

function ModeToggle({
  mode,
  disabled,
  onChange
}: {
  mode: QuizMode;
  disabled: boolean;
  onChange: (next: QuizMode) => void;
}) {
  const t = useT();

  const baseChipClass =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors";
  const activeClass = "bg-terracotta-500 text-cream-50 shadow-sm";
  const inactiveClass =
    "text-ink-700/65 hover:text-ink-800 hover:bg-cream-50";

  const hint =
    mode === "offline"
      ? t("quiz_mode_offline_hint")
      : t("quiz_mode_live_hint");

  return (
    <div
      className={`mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-cream-300/55 ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.22em] text-ink-700/55 font-medium">
            {t("quiz_mode_label")}
          </span>
        </div>

        <div
          role="group"
          aria-label={t("quiz_mode_label")}
          className="inline-flex p-0.5 bg-cream-100 rounded-full ring-1 ring-cream-300/70"
        >
          <button
            type="button"
            onClick={() => onChange("offline")}
            disabled={disabled}
            aria-pressed={mode === "offline"}
            className={`${baseChipClass} ${mode === "offline" ? activeClass : inactiveClass} ${
              disabled ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <WifiOff size={12} strokeWidth={2} />
            {t("quiz_mode_offline")}
          </button>
          <button
            type="button"
            onClick={() => onChange("live")}
            disabled={disabled}
            aria-pressed={mode === "live"}
            className={`${baseChipClass} ${mode === "live" ? activeClass : inactiveClass} ${
              disabled ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <Wifi size={12} strokeWidth={2} />
            {t("quiz_mode_live")}
          </button>
        </div>
      </div>

      <div className="mt-2 text-[11.5px] text-ink-700/60 leading-snug">
        {hint}
      </div>
    </div>
  );
}
