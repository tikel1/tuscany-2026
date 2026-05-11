import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";

const SWIPE_THRESHOLD_PX = 48;
/** Horizontal swipe must dominate vertical by this ratio (avoids fighting scroll). */
const HORIZONTAL_RATIO = 1.15;

function useIsBelowWidthPx(px: number) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(`(max-width: ${px}px)`).matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${px}px)`);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [px]);
  return matches;
}

/**
 * Touch swipe to prev/next on narrow viewports;
 * breakpoint defaults to Tailwind below-`sm` (639px) so desktop keeps arrow buttons only.
 * Uses capture-phase listeners so touches beginning on nested controls still count.
 */
export function useCarouselSwipe(options: {
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
  /** When false, swipe works on all viewports (default: only below maxWidthPx). */
  mobileOnly?: boolean;
  /** Inclusive max inner width where swipe applies (default 639). */
  maxWidthPx?: number;
}) {
  const { onPrev, onNext, disabled = false, mobileOnly = true, maxWidthPx = 639 } = options;
  const narrow = useIsBelowWidthPx(maxWidthPx);
  const active = !disabled && (!mobileOnly || narrow);

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

  const onTouchCancel = useCallback(() => {
    tracking.current = false;
  }, []);

  const swipeHandlers = active
    ? ({
        /* Capture prevents nested buttons/links from absorbing the gesture chain inconsistently */
        onTouchStartCapture: onTouchStart,
        onTouchEndCapture: onTouchEnd,
        onTouchCancelCapture: onTouchCancel,
      } as const)
    : ({} as const);

  return {
    swipeHandlers,
    /** Prefer vertical scrolling for the page; we only react on clear horizontal swipes. */
    swipeTouchAction: active ? ("pan-y" as const) : undefined
  };
}
