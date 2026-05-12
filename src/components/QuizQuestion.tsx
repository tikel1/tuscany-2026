import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { QuizQuestion as QuizQuestionType } from "../data/types";
import { useT } from "../lib/dict";

/** A single question card with 4 option chips. The host (Quizzo)
 *  reads the question aloud via the parent's voice backend; this
 *  component is purely visual + tap handling.
 *
 *  States:
 *    - `selectedIndex === null` → all options live, kid is choosing
 *    - `selectedIndex !== null` → answer locked: correct one glows
 *      green, the kid's wrong pick glows red, the rest mute
 */
interface Props {
  question: QuizQuestionType;
  /** 1-indexed position in the quiz, for the "Question X of Y" eyebrow. */
  index: number;
  /** Total number of questions, for the eyebrow + progress dots. */
  total: number;
  /** Index the kid tapped, or null if they haven't picked yet. */
  selectedIndex: number | null;
  /** Called when the kid taps an option. The parent decides whether
   *  to lock further taps (it does — see Quiz.tsx). */
  onSelect: (optionIndex: number) => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

export default function QuizQuestion({ question, index, total, selectedIndex, onSelect }: Props) {
  const t = useT();
  const locked = selectedIndex !== null;
  const correctIdx = question.correctIndex;

  return (
    <div className="flex flex-col gap-5">
      {/* Eyebrow — "Question X of Y" + progress dots */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] uppercase tracking-[0.28em] text-terracotta-600/85 font-medium">
          {t("quiz_question_of", { n: index, total })}
        </div>
        <div className="flex gap-1.5" aria-hidden>
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={`block h-1.5 w-6 rounded-full transition-colors duration-300 ${
                i < index - 1
                  ? "bg-terracotta-500/70"
                  : i === index - 1
                    ? "bg-terracotta-500"
                    : "bg-cream-300/70"
              }`}
            />
          ))}
        </div>
      </div>

      {/* The question itself — kid-readable serif type, generous line height */}
      <h3 className="font-serif text-[20px] sm:text-[24px] leading-snug text-ink-900">
        {question.question}
      </h3>

      {/* Four option chips. On tap they immediately flash green/red
          and stay locked until the parent advances. */}
      <ul className="grid sm:grid-cols-2 gap-2.5">
        {question.options.map((option, i) => {
          const isCorrect = i === correctIdx;
          const isPicked = i === selectedIndex;

          let chrome =
            "bg-cream-50 ring-1 ring-cream-300/70 hover:ring-terracotta-500/60 hover:bg-cream-100/80";
          if (locked) {
            if (isCorrect) {
              chrome = "bg-olive-500/12 ring-1 ring-olive-500/55 text-ink-900";
            } else if (isPicked) {
              chrome = "bg-terracotta-500/15 ring-1 ring-terracotta-500/55 text-ink-900";
            } else {
              chrome = "bg-cream-50/70 ring-1 ring-cream-300/60 text-ink-700/55";
            }
          }

          let badgeChrome = "bg-cream-100 text-ink-800 ring-1 ring-cream-300/80";
          if (locked) {
            if (isCorrect) badgeChrome = "bg-olive-500 text-cream-50";
            else if (isPicked) badgeChrome = "bg-terracotta-500 text-cream-50";
            else badgeChrome = "bg-cream-100 text-ink-700/55 ring-1 ring-cream-300/60";
          }

          return (
            <li key={i}>
              <motion.button
                type="button"
                whileTap={{ scale: locked ? 1 : 0.98 }}
                onClick={() => !locked && onSelect(i)}
                disabled={locked}
                aria-label={t("quiz_aria_option", { n: i + 1 })}
                aria-pressed={isPicked}
                className={`w-full flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl text-start transition-all min-h-12 ${chrome} ${
                  locked ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <span
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold transition-colors ${badgeChrome}`}
                >
                  {locked && isCorrect ? (
                    <Check size={14} strokeWidth={2.5} />
                  ) : locked && isPicked ? (
                    <X size={14} strokeWidth={2.5} />
                  ) : (
                    OPTION_LETTERS[i] ?? i + 1
                  )}
                </span>
                <span className="flex-1 text-[14.5px] sm:text-[15.5px] leading-snug">
                  {option}
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>

      {/* Reaction line — appears once locked, in the matching color */}
      {locked && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={`rounded-2xl p-3.5 sm:p-4 text-[13.5px] sm:text-[14.5px] leading-snug ${
            selectedIndex === correctIdx
              ? "bg-olive-500/10 ring-1 ring-olive-500/35 text-olive-700"
              : "bg-terracotta-500/10 ring-1 ring-terracotta-500/35 text-terracotta-700"
          }`}
        >
          <div className="text-[10px] uppercase tracking-[0.22em] font-semibold opacity-80">
            {selectedIndex === correctIdx ? t("quiz_correct") : t("quiz_wrong")}
          </div>
          <div className="mt-1 text-ink-800/95">
            {selectedIndex === correctIdx
              ? question.reactionCorrect
              : `${question.reactionWrong} — ${question.options[correctIdx]}`}
          </div>
        </motion.div>
      )}
    </div>
  );
}
