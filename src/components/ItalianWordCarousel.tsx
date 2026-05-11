import { useCallback, useMemo, useRef, useState, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pause,
  Play,
  Quote,
  Volume2
} from "lucide-react";
import type { ItalianWord } from "../data/types";
import { resolveAudioUrl } from "../lib/audioUrl";
import { usePageAudio } from "../lib/usePageAudio";
import {
  firstUnheardItalianWordIndex,
  markItalianWordHeard
} from "../lib/italianWordListenProgress";
import { useT } from "../lib/dict";
import { useCarouselSwipe } from "../lib/useCarouselSwipe";

function padDay(n: number) {
  return String(n).padStart(2, "0");
}

export default function ItalianWordCarousel({
  dayNumber,
  words
}: {
  dayNumber: number;
  words: ItalianWord[];
}) {
  if (words.length === 0) return null;
  return (
    <ItalianWordCarouselInner key={`${dayNumber}-${words.length}`} dayNumber={dayNumber} words={words} />
  );
}

function ItalianWordCarouselInner({
  dayNumber,
  words
}: {
  dayNumber: number;
  words: ItalianWord[];
}) {
  const t = useT();
  const count = words.length;
  const [slideIdx, setSlideIdx] = useState(() =>
    firstUnheardItalianWordIndex(dayNumber, count)
  );

  const assetPath = useMemo(
    () => `italian-words/day-${padDay(dayNumber)}-${slideIdx}`,
    [dayNumber, slideIdx]
  );
  const exampleAssetPath = useMemo(
    () => `italian-words/day-${padDay(dayNumber)}-${slideIdx}-ex`,
    [dayNumber, slideIdx]
  );
  const url = resolveAudioUrl({ audioAssetPath: assetPath });
  const markIndexRef = useRef(0);
  const wordListenOpts = useMemo(
    () => ({
      preload: "auto" as const,
      onEnded: () => markItalianWordHeard(dayNumber, markIndexRef.current)
    }),
    [dayNumber]
  );
  const { state, toggle } = usePageAudio(url, wordListenOpts);

  const exampleUrlForSlide = useMemo(() => {
    const w0 = words[slideIdx];
    if (!w0?.example || !w0.exampleMeaning) return null;
    return resolveAudioUrl({ audioAssetPath: exampleAssetPath });
  }, [words, slideIdx, exampleAssetPath]);

  const exampleListenOpts = useMemo(() => ({ preload: "auto" as const }), []);
  const { state: exState, toggle: exToggle } = usePageAudio(exampleUrlForSlide, exampleListenOpts);

  const go = useCallback(
    (delta: number) => setSlideIdx(i => (i + delta + count) % count),
    [count]
  );

  const { swipeHandlers, swipeTouchAction } = useCarouselSwipe({
    onPrev: () => go(-1),
    onNext: () => go(1),
    disabled: count <= 1
  });

  const playFromChip = (e: MouseEvent<HTMLButtonElement>) => {
    markIndexRef.current = slideIdx;
    toggle(e);
  };

  const w = words[slideIdx];
  if (!w) return null;

  return (
    <section className="space-y-6 sm:space-y-8">
      <article
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cream-50 via-cream-100 to-gold-400/10 ring-1 ring-cream-300/70 shadow-[0_18px_50px_-30px_rgba(151,109,76,0.45)]"
        style={swipeTouchAction ? { touchAction: swipeTouchAction } : undefined}
        {...swipeHandlers}
      >
        <Quote
          size={120}
          strokeWidth={1}
          className="absolute -top-5 end-0 text-terracotta-500/8 pointer-events-none rtl:scale-x-[-1] sm:size-[140px] sm:-top-6"
          aria-hidden
        />

        <div className="relative px-5 sm:px-8 py-6 sm:py-8 flex flex-col min-h-[280px] sm:min-h-[320px]">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-terracotta-600/85 font-medium shrink-0">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta-500 shrink-0" />
            {t("word_eyebrow")}
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slideIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.26, ease: "easeOut" }}
                className="mt-4 sm:mt-5 flex-1 flex flex-col"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="font-serif italic text-4xl sm:text-6xl text-ink-900 leading-none min-w-0">
                    {w.word}
                  </h2>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={playFromChip}
                    dir="ltr"
                    className={`inline-flex items-center gap-2 rounded-full bg-cream-50 px-3 py-1.5 text-left ring-1 transition-all outline-none focus-visible:ring-2 focus-visible:ring-terracotta-400/80 ${
                      state === "error"
                        ? "ring-amber-400/90 text-ink-700/70"
                        : state === "playing"
                          ? "ring-terracotta-400 text-ink-900 shadow-sm"
                          : "ring-cream-300/90 text-ink-700/85 hover:ring-terracotta-300/80 hover:bg-cream-50/95"
                    }`}
                    aria-label={`${t("word_pronounce_chip_listen")}: ${w.word}`}
                    title={t("word_pronounce_chip_listen")}
                  >
                    <span dir="auto" className="text-[12px] sm:text-[13px] font-medium tracking-wide">
                      {w.pronounce}
                    </span>
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cream-200/90 text-ink-600">
                      {state === "loading" ? (
                        <Loader2 size={12} className="animate-spin" aria-hidden />
                      ) : state === "playing" ? (
                        <Pause size={12} strokeWidth={2.2} aria-hidden />
                      ) : state === "error" ? (
                        <Play size={12} strokeWidth={2.2} className="opacity-40" aria-hidden />
                      ) : (
                        <Volume2 size={12} strokeWidth={2} className="opacity-75" aria-hidden />
                      )}
                    </span>
                  </button>
                  {state === "error" && (
                    <span className="text-[11px] text-ink-600/80">{t("listen_unavailable")}</span>
                  )}
                </div>

                <p className="mt-3 text-[15px] sm:text-[17px] text-ink-700/90 leading-snug">
                  <span className="text-[10px] uppercase tracking-[0.24em] text-ink-700/55 font-medium me-2">
                    {t("word_meaning_label")}
                  </span>
                  {w.meaning}
                </p>

                {w.example && (
                  <div className="mt-5 pt-5 border-t border-cream-300/60 flex-1">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-ink-700/55 font-medium mb-1.5">
                      {t("word_use_label")}
                    </div>
                    <div className="flex flex-wrap items-start gap-x-2 gap-y-2" dir="ltr">
                      <p className="font-serif italic text-[16px] sm:text-[18px] text-ink-900 leading-snug min-w-0 flex-1">
                        “{w.example}”
                      </p>
                      {w.exampleMeaning && exampleUrlForSlide && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            exToggle(e);
                          }}
                          dir="ltr"
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full bg-cream-50/90 px-2.5 py-1 text-left ring-1 transition-all outline-none focus-visible:ring-2 focus-visible:ring-terracotta-400/80 self-start mt-0.5 ${
                            exState === "error"
                              ? "ring-amber-400/90 text-ink-700/70"
                              : exState === "playing"
                                ? "ring-terracotta-400 text-ink-900 shadow-sm"
                                : "ring-cream-300/90 text-ink-700/85 hover:ring-terracotta-300/80"
                          }`}
                          aria-label={t("word_example_chip_listen")}
                          title={t("word_example_chip_listen")}
                        >
                          <Volume2 size={11} strokeWidth={2} className="opacity-80 shrink-0" aria-hidden />
                          {exState === "loading" ? (
                            <Loader2 size={11} className="animate-spin" aria-hidden />
                          ) : exState === "playing" ? (
                            <Pause size={11} strokeWidth={2.2} aria-hidden />
                          ) : exState === "error" ? (
                            <Play size={11} strokeWidth={2.2} className="opacity-40" aria-hidden />
                          ) : null}
                        </button>
                      )}
                    </div>
                    {w.exampleMeaning && (
                      <p className="mt-1 text-[13px] sm:text-[14px] text-ink-700/70 leading-snug">
                        {w.exampleMeaning}
                      </p>
                    )}
                    {exState === "error" && w.exampleMeaning && exampleUrlForSlide && (
                      <p className="mt-1 text-[11px] text-ink-600/80">{t("listen_unavailable")}</p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div
            dir="ltr"
            className="mt-5 pt-4 border-t border-cream-300/50 flex items-center justify-center gap-2 shrink-0"
            role="group"
            aria-label={t("word_carousel_n_of_m", { n: slideIdx + 1, total: count })}
          >
            <button
              type="button"
              onClick={() => go(-1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cream-50/95 ring-1 ring-cream-300/70 text-ink-700 hover:bg-terracotta-500 hover:text-cream-50 hover:ring-terracotta-500 transition-colors"
              aria-label={t("word_carousel_prev")}
            >
              <ChevronLeft size={14} strokeWidth={2.2} />
            </button>
            <div className="flex items-center gap-1 px-0.5" role="tablist">
              {words.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === slideIdx}
                  onClick={() => setSlideIdx(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === slideIdx
                      ? "h-1.5 w-5 bg-terracotta-500"
                      : "h-1 w-1 bg-cream-300 hover:bg-cream-400"
                  }`}
                  aria-label={t("word_carousel_n_of_m", { n: i + 1, total: count })}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cream-50/95 ring-1 ring-cream-300/70 text-ink-700 hover:bg-terracotta-500 hover:text-cream-50 hover:ring-terracotta-500 transition-colors"
              aria-label={t("word_carousel_next")}
            >
              <ChevronRight size={14} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}
