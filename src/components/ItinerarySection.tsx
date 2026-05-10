import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { itinerary } from "../data/itinerary";
import { getCurrentOrUpcomingDayNumber } from "../lib/tripState";
import { getRememberedChapter, rememberChapter } from "../lib/route";
import ChapterCard from "./ChapterCard";
import TripStrip from "./TripStrip";

export default function ItinerarySection() {
  const days = itinerary;

  const defaultDay = useMemo(
    () => getRememberedChapter() ?? getCurrentOrUpcomingDayNumber(),
    []
  );
  const [activeDay, setActiveDay] = useState<number>(defaultDay);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const programmaticTimeout = useRef<number | null>(null);

  // Scroll to a specific chapter card in the carousel
  const scrollToDay = (dayNumber: number, behavior: ScrollBehavior = "smooth") => {
    const sc = scrollerRef.current;
    if (!sc) return;
    const el = sc.querySelector<HTMLElement>(`[data-chapter="${dayNumber}"]`);
    if (!el) return;
    isProgrammaticScroll.current = true;
    if (programmaticTimeout.current) window.clearTimeout(programmaticTimeout.current);
    sc.scrollTo({ left: el.offsetLeft, behavior });
    setActiveDay(dayNumber);
    // Re-allow scroll-tracking after the smooth scroll has had time to settle
    programmaticTimeout.current = window.setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, behavior === "smooth" ? 700 : 100);
  };

  // On mount, jump straight to the default chapter (no smooth scroll for first paint)
  useEffect(() => {
    scrollToDay(defaultDay, "auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track which chapter is centred as the user swipes/scrolls
  useEffect(() => {
    const sc = scrollerRef.current;
    if (!sc) return;
    const onScroll = () => {
      if (isProgrammaticScroll.current) return;
      const center = sc.scrollLeft + sc.offsetWidth / 2;
      let nearest = days[0].dayNumber;
      let nearestDist = Infinity;
      sc.querySelectorAll<HTMLElement>("[data-chapter]").forEach(el => {
        const elCenter = el.offsetLeft + el.offsetWidth / 2;
        const dist = Math.abs(elCenter - center);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = parseInt(el.dataset.chapter ?? "1", 10);
        }
      });
      setActiveDay(nearest);
    };
    sc.addEventListener("scroll", onScroll, { passive: true });
    return () => sc.removeEventListener("scroll", onScroll);
  }, [days]);

  // Persist the active chapter so refresh / back from detail return here
  useEffect(() => {
    rememberChapter(activeDay);
  }, [activeDay]);

  const handleSelect = (n: number) => scrollToDay(n);

  const goPrev = () => activeDay > 1 && scrollToDay(activeDay - 1);
  const goNext = () => activeDay < days.length && scrollToDay(activeDay + 1);

  return (
    <section
      id="trip"
      className="relative scroll-mt-20 bg-gradient-to-b from-cream-100/80 via-cream-100/50 to-cream-100/80 pt-2 sm:pt-10 pb-12 sm:pb-20 overflow-hidden"
    >
      {/* Decorative oversized FEATURE word in the background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-2 sm:top-2 right-0 left-0 text-center font-serif italic select-none whitespace-nowrap text-[18vw] sm:text-[12rem] leading-none text-terracotta-500/[0.05]"
      >
        Tuscany
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Sticky compact chapter navigation — controlled by the carousel */}
        <div className="sticky top-14 sm:top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 sm:py-2.5 bg-cream-100/85 backdrop-blur-md border-b border-cream-300/60">
          <div className="max-w-6xl mx-auto">
            <TripStrip compact activeDay={activeDay} onSelect={handleSelect} />
          </div>
        </div>

        {/* Eyebrow — desktop only, gives context */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="hidden md:flex items-center justify-between mt-8 mb-3"
        >
          <div>
            <div className="text-[10px] uppercase tracking-[0.32em] text-terracotta-600/85 font-medium">
              The plan · day by day
            </div>
            <div className="font-serif italic text-ink-800/65 text-sm mt-0.5">
              Swipe through ten chapters · click <span className="font-sans not-italic font-medium text-ink-900">Read more</span> for the full chapter
            </div>
          </div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-ink-700/55 font-medium">
            Chapter {String(activeDay).padStart(2, "0")} / {String(days.length).padStart(2, "0")}
          </div>
        </motion.div>
      </div>

      {/* Horizontal carousel — full bleed on mobile, padded on desktop */}
      <div className="relative mt-3 sm:mt-2">
        {/* Edge fades — desktop only */}
        <div className="pointer-events-none hidden md:block absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-cream-100 to-transparent z-10" />
        <div className="pointer-events-none hidden md:block absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-cream-100 to-transparent z-10" />

        {/* Prev / next buttons — desktop only */}
        <button
          type="button"
          onClick={goPrev}
          disabled={activeDay <= 1}
          aria-label="Previous chapter"
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center bg-cream-50 ring-1 ring-cream-300 shadow-md hover:bg-terracotta-500 hover:text-cream-50 hover:ring-terracotta-500 transition disabled:opacity-30 disabled:hover:bg-cream-50 disabled:hover:text-ink-900"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={activeDay >= days.length}
          aria-label="Next chapter"
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center bg-cream-50 ring-1 ring-cream-300 shadow-md hover:bg-terracotta-500 hover:text-cream-50 hover:ring-terracotta-500 transition disabled:opacity-30 disabled:hover:bg-cream-50 disabled:hover:text-ink-900"
        >
          <ChevronRight size={20} />
        </button>

        <div
          ref={scrollerRef}
          className="overflow-x-auto scrollbar-hide snap-x snap-mandatory flex"
        >
          {days.map(day => (
            <div
              key={day.dayNumber}
              data-chapter={day.dayNumber}
              className="snap-center shrink-0 w-full md:w-[640px] px-4 sm:px-8 first:pl-4 sm:first:pl-12 last:pr-4 sm:last:pr-12"
            >
              <ChapterCard day={day} />
            </div>
          ))}
        </div>

        {/* Dot indicator — mobile only */}
        <div className="md:hidden mt-4 flex items-center justify-center gap-1.5">
          {days.map(d => (
            <button
              key={d.dayNumber}
              type="button"
              onClick={() => handleSelect(d.dayNumber)}
              aria-label={`Go to chapter ${d.dayNumber}`}
              className={`transition-all rounded-full ${
                d.dayNumber === activeDay
                  ? "w-5 h-1.5 bg-terracotta-600"
                  : "w-1.5 h-1.5 bg-ink-700/25 hover:bg-ink-700/45"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
