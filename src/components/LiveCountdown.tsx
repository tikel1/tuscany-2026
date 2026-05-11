import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { partsFromMs } from "../lib/tripState";
import type { CountdownParts } from "../lib/tripState";
import { useLang } from "../lib/i18n";

const COUNTDOWN_LABELS = {
  en: { days: "days", hrs: "hrs", min: "min", sec: "sec" },
  he: { days: "ימים", hrs: "שעות", min: "דקות", sec: "שניות" }
} as const;

interface Props {
  /** Target date to count down to (or up from). */
  target: Date;
  /** "down" before target, switches to "up" after target. */
  mode?: "down" | "up";
  /** Show seconds block (default true). */
  showSeconds?: boolean;
  /** Show days block (default true). */
  showDays?: boolean;
  /** Visual size: "lg" for hero, "md" default. */
  size?: "md" | "lg";
  className?: string;
}

interface DigitCellProps {
  value: string;
  size: "md" | "lg";
}

function DigitCell({ value, size }: DigitCellProps) {
  /* Numerals always render in the Latin serif (Cormorant Garamond)
     even when the page is in Hebrew. Frank Ruhl Libre's tabular
     numerals are visually quite different from Cormorant's, and the
     design depends on the countdown looking the same across languages.
     Only the unit labels (days/hrs/min/sec) below switch language. */
  const digitCls =
    size === "lg"
      ? "font-latin-serif text-5xl sm:text-7xl"
      : "font-latin-serif text-4xl sm:text-6xl";
  /* Slot ≈ 1.5× digit cap height so ±25% slide fits inside overflow clip
     (40–60% slides need much taller boxes with display-size numerals). */
  const slotCls =
    size === "lg"
      ? "h-[4.5rem] sm:h-[6.75rem] min-w-[1ch]"
      : "h-[3.5rem] sm:h-[5.75rem] min-w-[1ch]";
  return (
    <span
      className={`relative inline-grid place-items-center overflow-hidden tabular-nums align-middle ${slotCls}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "25%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-25%", opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
          className={`col-start-1 row-start-1 flex items-center justify-center ${digitCls}`}
          style={{
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

interface BlockProps {
  value: number;
  label: string;
  pad: number;
  size: "md" | "lg";
  pulse?: boolean;
}

function CountdownBlock({ value, label, pad, size, pulse }: BlockProps) {
  const str = String(value).padStart(pad, "0");

  /* Less padding above numerals than below — keeps animation safe while
     trimming empty band at the top of the glass pill. */
  const padCls =
    size === "lg" ? "pt-1 pb-1.5 sm:pt-1.5 sm:pb-2.5" : "pt-1 pb-1.5 sm:pt-1.5 sm:pb-2";

  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2">
      <div
        className={`flex items-center justify-center overflow-hidden px-2 sm:px-3 ${padCls} rounded-xl bg-cream-50/12 backdrop-blur-[2px] ${
          pulse ? "ring-1 ring-cream-50/25" : ""
        }`}
      >
        <span className="flex items-center justify-center">
          {str.split("").map((d, i) => (
            <DigitCell key={`${label}-${i}`} value={d} size={size} />
          ))}
        </span>
      </div>
      <div
        className={`uppercase tracking-[0.22em] font-medium opacity-90 ${
          size === "lg" ? "text-[10px] sm:text-xs" : "text-[9px] sm:text-[11px]"
        }`}
      >
        {label}
      </div>
    </div>
  );
}

function Sep({ size }: { size: "md" | "lg" }) {
  /* Same reasoning as DigitCell — the colon separator stays in the
     Latin serif so the countdown reads identically in EN and HE. */
  const cls =
    size === "lg"
      ? "font-latin-serif text-4xl sm:text-6xl leading-none opacity-60"
      : "font-latin-serif text-3xl sm:text-5xl leading-none opacity-60";
  return (
    <span className={`${cls} px-0.5 sm:px-1 self-center leading-none`}>:</span>
  );
}

export default function LiveCountdown({
  target,
  mode = "down",
  showSeconds = true,
  showDays = true,
  size = "md",
  className
}: Props) {
  const { lang } = useLang();
  const labels = COUNTDOWN_LABELS[lang];
  const [parts, setParts] = useState<CountdownParts>(() => {
    const ms = mode === "down" ? target.getTime() - Date.now() : Date.now() - target.getTime();
    return partsFromMs(ms);
  });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    function tick() {
      const ms = mode === "down" ? target.getTime() - Date.now() : Date.now() - target.getTime();
      setParts(partsFromMs(ms));
      // align to top of next second to keep a clean tick
      const delay = 1000 - (Date.now() % 1000);
      if (!cancelled) {
        rafRef.current = window.setTimeout(tick, delay);
      }
    }
    tick();
    return () => {
      cancelled = true;
      if (rafRef.current) window.clearTimeout(rafRef.current);
    };
  }, [target, mode]);

  return (
    <div dir="ltr" className={`flex items-center justify-center gap-1 sm:gap-2 ${className ?? ""}`}>
      {showDays && (
        <>
          <CountdownBlock value={parts.days} label={labels.days} pad={String(parts.days).length > 2 ? 3 : 2} size={size} pulse />
          <Sep size={size} />
        </>
      )}
      <CountdownBlock value={parts.hours} label={labels.hrs} pad={2} size={size} />
      <Sep size={size} />
      <CountdownBlock value={parts.minutes} label={labels.min} pad={2} size={size} />
      {showSeconds && (
        <>
          <Sep size={size} />
          <CountdownBlock value={parts.seconds} label={labels.sec} pad={2} size={size} pulse />
        </>
      )}
    </div>
  );
}
