import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import Section from "./Section";
import { TicketCardFace, TicketDetails } from "./WalletTicket";
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

/** Where a card sits, given its distance from the active card. Neighbours
 *  peek on the sides (coverflow); direction flips for RTL. */
function sideStyle(delta: number, rtl: boolean) {
  if (delta === 0) return { x: "0%", scale: 1, opacity: 1, zIndex: 40 };
  const dir = rtl ? -1 : 1;
  if (Math.abs(delta) === 1) {
    return { x: `${dir * delta * 58}%`, scale: 0.84, opacity: 0.45, zIndex: 30 };
  }
  return { x: `${dir * delta * 82}%`, scale: 0.72, opacity: 0, zIndex: 20 };
}

function TicketDeck({ tickets }: { tickets: Booking[] }) {
  const { lang } = useLang();
  const t = useT();
  const isRTL = lang === "he";
  const [active, setActive] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const go = (i: number) => setActive(Math.max(0, Math.min(i, tickets.length - 1)));
  const prev = () => go(active - 1);
  const next = () => go(active + 1);

  return (
    <div className="mx-auto max-w-xl">
      <div className="relative">
        {/* Desktop arrows (outside the clipped viewport) */}
        <button
          type="button"
          onClick={prev}
          disabled={active === 0}
          aria-label={t("ticket_prev")}
          className="hidden sm:flex absolute start-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 items-center justify-center rounded-full bg-cream-50 ring-1 ring-cream-300 shadow-md text-ink-800 hover:bg-cream-100 disabled:opacity-0 transition-opacity"
        >
          {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <button
          type="button"
          onClick={next}
          disabled={active === tickets.length - 1}
          aria-label={t("ticket_next")}
          className="hidden sm:flex absolute end-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 items-center justify-center rounded-full bg-cream-50 ring-1 ring-cream-300 shadow-md text-ink-800 hover:bg-cream-100 disabled:opacity-0 transition-opacity"
        >
          {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        {/* Coverflow viewport — clips the side peeks so the page never scrolls */}
        <div className="overflow-hidden py-2">
          <div className="relative mx-auto w-[72%] max-w-[340px] aspect-[1.7/1]">
            {tickets.map((b, i) => {
              const delta = i - active;
              const isActive = delta === 0;
              return (
                <motion.div
                  key={b.id}
                  className="absolute inset-0"
                  initial={false}
                  animate={sideStyle(delta, isRTL)}
                  transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
                  style={{ pointerEvents: Math.abs(delta) > 1 ? "none" : "auto" }}
                >
                  <TicketCardFace
                    booking={b}
                    index={i}
                    className="cursor-pointer"
                    onClick={() => (isActive ? setDetailsOpen(o => !o) : go(i))}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dots */}
      {tickets.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {tickets.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => go(i)}
              aria-label={t("ticket_go_to", { n: i + 1 })}
              aria-current={active === i}
              className={`h-2 rounded-full transition-all ${
                active === i ? "w-6 bg-terracotta-500" : "w-2 bg-ink-900/20 hover:bg-ink-900/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* One central Details toggle, for the active card */}
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={() => setDetailsOpen(o => !o)}
          aria-expanded={detailsOpen}
          className="inline-flex items-center gap-1 text-sm font-medium text-terracotta-700 hover:text-terracotta-800"
        >
          {t(detailsOpen ? "ticket_less" : "ticket_more")}
          <ChevronDown
            size={15}
            className={`transition-transform ${detailsOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <AnimatePresence initial={false} mode="wait">
        {detailsOpen && (
          <motion.div
            key={tickets[active].id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-3"
          >
            <TicketDetails booking={tickets[active]} />
          </motion.div>
        )}
      </AnimatePresence>
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
        <TicketDeck tickets={upcomingFirst(data.activities)} />
      )}
    </Section>
  );
}
