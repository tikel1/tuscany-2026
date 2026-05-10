import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Moon, Map, Compass, Waves, Mountain, Castle } from "lucide-react";
import { useT } from "../lib/dict";
import { useLang } from "../lib/i18n";

interface Stat {
  value: number;
  suffix?: string;
  label: { en: string; he: string };
  Icon: typeof Moon;
}

const STATS: Stat[] = [
  { value: 9,    label: { en: "nights",       he: "לילות" },     Icon: Moon },
  { value: 17,   label: { en: "attractions",  he: "אטרקציות" },  Icon: Compass },
  { value: 2,    label: { en: "bases",        he: "בסיסים" },    Icon: Map },
  { value: 6,    label: { en: "swims",        he: "שחיות" },     Icon: Waves },
  { value: 1900, suffix: " m", label: { en: "highest peak", he: "פסגה" }, Icon: Mountain },
  { value: 4,    label: { en: "old towns",    he: "ערים עתיקות" }, Icon: Castle }
];

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function useCountUp(target: number, durationMs: number, start: boolean) {
  const [n, setN] = useState(0);
  const startedAt = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    startedAt.current = t0;
    function frame(now: number) {
      const elapsed = now - (startedAt.current ?? now);
      const p = Math.min(1, elapsed / durationMs);
      setN(Math.round(easeOutCubic(p) * target));
      if (p < 1) rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [start, target, durationMs]);

  return n;
}

function StatCell({ stat, fire }: { stat: Stat; fire: boolean }) {
  const { lang } = useLang();
  const v = useCountUp(stat.value, 1100, fire);
  const Icon = stat.Icon;
  const display = v >= 1000 ? `${(v / 1000).toFixed(1).replace(/\.0$/, "")}k` : `${v}`;
  return (
    <div className="flex items-center gap-2.5 sm:flex-col sm:items-start sm:gap-1 px-3.5 sm:px-4 py-3 sm:py-3.5 min-w-max">
      <div className="p-1.5 rounded-lg bg-terracotta-500/10 text-terracotta-600 sm:hidden">
        <Icon size={14} />
      </div>
      <div className="flex items-baseline gap-1.5">
        <Icon size={13} className="text-terracotta-500/80 hidden sm:inline" />
        <span
          className="font-serif text-2xl sm:text-[1.75rem] leading-none text-ink-900 tabular-nums"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {display}
          {stat.suffix && <span className="text-base text-ink-700/70">{stat.suffix}</span>}
        </span>
      </div>
      <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-ink-700/65 font-medium">
        {stat.label[lang]}
      </div>
    </div>
  );
}

export default function TripStats() {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-3 px-1">
        <span className="h-px w-6 bg-terracotta-500/60" aria-hidden />
        <span className="text-[10px] uppercase tracking-[0.28em] font-medium text-terracotta-600">
          {t("trip_stats_eyebrow")}
        </span>
      </div>
      <div className="card-paper overflow-hidden">
        <div className="-mx-px overflow-x-auto scrollbar-hide">
          <div className="flex sm:grid sm:grid-cols-6 divide-x divide-cream-300/70 min-w-max sm:min-w-0">
            {STATS.map(s => (
              <StatCell key={s.label.en} stat={s} fire={inView} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
