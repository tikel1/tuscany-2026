import { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Section from "./Section";
import WalletTicket from "./WalletTicket";
import TicketUnlock from "./TicketUnlock";
import { useBookings } from "../lib/bookingsStore";
import { useT } from "../lib/dict";
import { useLang } from "../lib/i18n";
import type { Booking } from "../lib/bookingsTypes";

/** Sort tickets so the next upcoming one leads; past ones fall to the end. */
function upcomingFirst(activities: Booking[]): Booking[] {
  const today = new Date().toISOString().slice(0, 10);
  return [...activities].sort((a, b) => {
    const ad = a.date ?? "";
    const bd = b.date ?? "";
    const aPast = ad !== "" && ad < today;
    const bPast = bd !== "" && bd < today;
    if (aPast !== bPast) return aPast ? 1 : -1;
    return ad.localeCompare(bd);
  });
}

/** A Google-Wallet-style ticket carousel: swipe on touch, arrows + dots on
 *  desktop. Works in both LTR and RTL (navigation is index-based). */
function TicketCarousel({ tickets }: { tickets: Booking[] }) {
  const { lang } = useLang();
  const t = useT();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const isRTL = lang === "he";

  const goTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(i, track.children.length - 1));
    const el = track.children[clamped] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }, []);

  // Track the active card by whichever one's leading edge sits nearest the
  // track's start. Reading the on-screen rects keeps this correct in LTR and
  // RTL and at both ends (where a centered detection would be off-by-one).
  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const rtl = getComputedStyle(track).direction === "rtl";
    const contRect = track.getBoundingClientRect();
    const anchor = rtl ? contRect.right : contRect.left;
    let best = 0;
    let bestDist = Infinity;
    Array.from(track.children).forEach((child, i) => {
      const r = (child as HTMLElement).getBoundingClientRect();
      const edge = rtl ? r.right : r.left;
      const d = Math.abs(edge - anchor);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  }, []);

  // Previous/next in reading order (index-based, so RTL just works).
  const prev = () => goTo(active - 1);
  const next = () => goTo(active + 1);

  return (
    <div className="mx-auto max-w-md">
      <div className="relative">
        {/* Desktop arrows, just outside the card. Position auto-flips via
            start/end; only the glyph flips for RTL. */}
        <button
          type="button"
          onClick={prev}
          disabled={active === 0}
          aria-label={t("ticket_prev")}
          className="hidden sm:flex absolute start-0 top-[130px] -translate-x-[140%] z-10 w-10 h-10 items-center justify-center rounded-full bg-cream-50 ring-1 ring-cream-300 shadow-md text-ink-800 hover:bg-cream-100 disabled:opacity-0 transition-opacity"
        >
          {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <button
          type="button"
          onClick={next}
          disabled={active === tickets.length - 1}
          aria-label={t("ticket_next")}
          className="hidden sm:flex absolute end-0 top-[130px] translate-x-[140%] z-10 w-10 h-10 items-center justify-center rounded-full bg-cream-50 ring-1 ring-cream-300 shadow-md text-ink-800 hover:bg-cream-100 disabled:opacity-0 transition-opacity"
        >
          {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1"
        >
          {tickets.map((b, i) => (
            <div key={b.id} className="snap-start shrink-0 w-full self-start">
              <WalletTicket booking={b} index={i} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      {tickets.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {tickets.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={t("ticket_go_to", { n: i + 1 })}
              aria-current={active === i}
              className={`h-2 rounded-full transition-all ${
                active === i
                  ? "w-6 bg-terracotta-500"
                  : "w-2 bg-ink-900/20 hover:bg-ink-900/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BookingsSection() {
  const { data } = useBookings();
  const t = useT();

  return (
    <Section
      id="bookings"
      eyebrow={t("bookings_eyebrow")}
      title={t("bookings_title")}
      kicker={t("bookings_kicker")}
      toned
    >
      {!data ? (
        <TicketUnlock />
      ) : (
        <TicketCarousel tickets={upcomingFirst(data.activities)} />
      )}
    </Section>
  );
}
