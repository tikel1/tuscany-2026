import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";

const SWIPE_THRESHOLD_PX = 48;
/** Horizontal swipe must dominate vertical by this ratio (avoids fighting scroll). */
const HORIZONTAL_RATIO = 1.15;

function useIsMaxSm() {
  const [maxSm, setMaxSm] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 639px)").matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setMaxSm(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return maxSm;
}

/**
 * Touch swipe to prev/next on narrow viewports (max-width: 639px),
 * matching Tailwind's `sm` breakpoint so desktop keeps arrow buttons only.
 */
export function useCarouselSwipe(options: {
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
  /** When false, swipe works on all viewports (default: only max-width 639px). */
  mobileOnly?: boolean;
}) {
  const { onPrev, onNext, disabled = false, mobileOnly = true } = options;
  const maxSm = useIsMaxSm();
  const active = !disabled && (!mobileOnly || maxSm);

  const x0 = useRef(0);
  const y0 = useRef(0);
  const tracking = useRef(false);

  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!active || e.touches.length !== 1) return;
      tracking.current = true;
      x0.current = e.touches[0].clientX;
      y0.current = e.touches[0].clientY;
    },
    [active]
  );

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!active || !tracking.current) {
        tracking.current = false;
        return;
      }
      tracking.current = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - x0.current;
      const dy = t.clientY - y0.current;
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
      if (Math.abs(dx) < Math.abs(dy) * HORIZONTAL_RATIO) return;
      if (dx < 0) onNext();
      else onPrev();
    },
    [active, onNext, onPrev]
  );

  return {
    swipeHandlers: { onTouchStart, onTouchEnd } as const,
    /** Prefer vertical scrolling for the page; we only react on clear horizontal swipes. */
    swipeTouchAction: active ? ("pan-y" as const) : undefined
  };
}
