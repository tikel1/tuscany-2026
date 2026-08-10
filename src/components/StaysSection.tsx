import { ExternalLink, MapPin, AlertTriangle, ChevronDown, LogIn, LogOut, Phone, DoorOpen } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, useCallback } from "react";
import { stays } from "../data/stays";
import type { Stay } from "../data/types";
import Section from "./Section";
import { useMapFocus } from "../lib/mapContext";
import { useT, localizeShortDate } from "../lib/dict";
import NavigateLinks from "./NavigateLinks";
import { useLang } from "../lib/i18n";
import { useLocalizeStay } from "../data/i18n";
import PoiImage from "./PoiImage";
import PhotoCredit from "./PhotoCredit";
import { useCarouselSwipe } from "../lib/useCarouselSwipe";

const STAY_SLIDE_MS = 5000;

/* Crossfading hero image for a stay card. Falls back to a single static
   PoiImage when the stay only has one photo. */
function StayHero({ stay }: { stay: Stay }) {
  const slides = useMemo(
    () =>
      stay.image ? [stay.image, ...(stay.gallery ?? [])] : (stay.gallery ?? []),
    [stay.image, stay.gallery]
  );

  const [idx, setIdx] = useState(0);

  const step = useCallback(
    (delta: number) => {
      if (slides.length <= 1) return;
      setIdx(i => (i + delta + slides.length) % slides.length);
    },
    [slides.length]
  );

  const { swipeHandlers, swipeTouchAction } = useCarouselSwipe({
    onPrev: () => step(-1),
    onNext: () => step(1),
    disabled: slides.length <= 1
  });
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(
      () => setIdx(i => (i + 1) % slides.length),
      STAY_SLIDE_MS
    );
    return () => window.clearInterval(id);
  }, [slides.length]);

  // Preload the next slide so the crossfade has something to fade into.
  useEffect(() => {
    if (slides.length <= 1) return;
    const next = slides[(idx + 1) % slides.length];
    if (next) {
      const img = new Image();
      img.src = next;
    }
  }, [idx, slides]);

  if (slides.length === 0) {
    return (
      <PoiImage
        src={undefined}
        alt={stay.name}
        region={stay.region}
        category={stay.category}
      />
    );
  }

  if (slides.length === 1) {
    return (
      <PoiImage
        src={slides[0]}
        alt={stay.name}
        region={stay.region}
        category={stay.category}
      />
    );
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={swipeTouchAction ? { touchAction: swipeTouchAction } : undefined}
      {...swipeHandlers}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={slides[idx]}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{
            opacity: { duration: 1.1, ease: "easeInOut" },
            scale: { duration: STAY_SLIDE_MS / 1000 + 1.1, ease: "linear" }
          }}
          className="absolute inset-0 will-change-transform"
        >
          <PoiImage
            src={slides[idx]}
            alt={stay.name}
            region={stay.region}
            category={stay.category}
          />
        </motion.div>
      </AnimatePresence>

      {/* Progress dashes — top-end of the photo */}
      <div
        className="absolute end-3 top-3 z-10 flex gap-1 pointer-events-none"
        aria-hidden
      >
        {slides.map((_, i) => (
          <span
            key={i}
            className={`block h-px transition-all duration-500 ${
              i === idx ? "w-5 bg-cream-50/90" : "w-2 bg-cream-50/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/** A labelled row inside the expanded details panel. */
function DetailRow({
  icon,
  label,
  children
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2.5">
      <span className="text-olive-600 shrink-0 mt-[3px]">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.18em] text-ink-700/60 font-medium">
          {label}
        </div>
        <div className="text-sm text-ink-800 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

/* The card face stays short — photo, name, dates, the pitch. Everything a
 * person only needs on the day they actually arrive (exact address, the
 * check-in window, the gate-and-front-desk walkthrough, the warnings) sits
 * behind this toggle, so the section still scans in one screen. */
function StayDetails({ stay: s }: { stay: Stay }) {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] font-medium text-terracotta-600 hover:text-terracotta-700 transition-colors"
      >
        {open ? t("stay_show_less") : t("stay_show_more")}
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3.5">
              {s.address && (
                <DetailRow icon={<MapPin size={14} />} label={t("stay_address")}>
                  {s.address}
                </DetailRow>
              )}
              {s.checkInWindow && (
                <DetailRow icon={<LogIn size={14} />} label={t("stay_checkin")}>
                  {s.checkInWindow}
                </DetailRow>
              )}
              {s.checkOutWindow && (
                <DetailRow icon={<LogOut size={14} />} label={t("stay_checkout")}>
                  {s.checkOutWindow}
                </DetailRow>
              )}
              {s.publicPhone && (
                <DetailRow icon={<Phone size={14} />} label={t("stay_phone")}>
                  <a href={`tel:${s.publicPhone.replace(/\s/g, "")}`} className="hover:text-terracotta-600">
                    {s.publicPhone}
                  </a>
                </DetailRow>
              )}
              {s.arrival && s.arrival.length > 0 && (
                <DetailRow icon={<DoorOpen size={14} />} label={t("stay_arrival")}>
                  <ol className="mt-0.5 space-y-1.5">
                    {s.arrival.map((step, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="shrink-0 w-4 h-4 mt-0.5 rounded-full bg-olive-500/15 text-olive-700 text-[10px] font-semibold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </DetailRow>
              )}

              {/* "Why we picked it" deliberately not rendered: by the time
                  you're opening this panel you have already booked the place,
                  so the sell is noise. The panel is arrival logistics only. */}
              {s.warnings && s.warnings.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-terracotta-700/85 font-medium">
                    {t("stay_warnings")}
                  </div>
                  <ul className="mt-1.5 space-y-1.5">
                    {s.warnings.map((w, i) => (
                      <li key={i} className="flex gap-2 text-sm text-terracotta-700">
                        <AlertTriangle size={14} className="text-terracotta-500 shrink-0 mt-0.5" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StaysSection() {
  const t = useT();
  const { lang } = useLang();
  const { focusOn } = useMapFocus();
  const localizeStay = useLocalizeStay();

  return (
    <Section
      id="stays"
      eyebrow={t("stays_eyebrow")}
      title={t("stays_title")}
      kicker={t("stays_kicker")}
      intro={t("stays_intro")}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {stays.map(rawStay => {
          const s = localizeStay(rawStay);
          return (
          <article key={s.id} className="card-paper card-paper-hover overflow-hidden flex flex-col">
            <div className="relative aspect-[16/10] overflow-hidden bg-cream-200">
              <StayHero stay={s} />
              {s.image && s.imageCredit && (
                <div className="absolute bottom-1.5 end-2 z-10 px-1.5 py-[3px] rounded-full bg-ink-900/45 backdrop-blur-sm">
                  <PhotoCredit credit={s.imageCredit} variant="light" />
                </div>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-serif text-2xl text-ink-900 leading-tight">{s.name}</h3>
                <span className={`shrink-0 ${s.region === "south" ? "pill-gold" : s.region === "north" ? "pill-olive" : "pill-ink"}`}>
                  {s.nights === 1
                    ? t("stay_nights_one", { n: s.nights })
                    : t("stay_nights_many", { n: s.nights })}
                </span>
              </div>
              <div className="mt-1 text-sm text-terracotta-600 font-medium">
                {localizeShortDate(s.checkIn, lang)} → {localizeShortDate(s.checkOut, lang)}
              </div>
              {s.address && (
                <div className="mt-1 text-xs text-ink-700/70 flex items-center gap-1">
                  <MapPin size={11} /> {s.address}
                </div>
              )}

              <p className="mt-3 text-sm text-ink-700/85 leading-relaxed">
                {s.description}
              </p>

              <StayDetails stay={s} />

              <div className="mt-5 pt-4 border-t border-cream-300/60 flex flex-wrap gap-x-4 gap-y-2">
                {s.bookingLink && (
                  <a href={s.bookingLink} target="_blank" rel="noopener noreferrer" className="icon-link">
                    <ExternalLink size={13} /> {t("stay_open_booking")}
                  </a>
                )}
                <NavigateLinks name={s.name} coords={s.coords} address={s.address} size={13} />
                <button onClick={() => focusOn(s.id)} className="icon-link">
                  <MapPin size={13} /> {t("show_on_map")}
                </button>
              </div>
            </div>
          </article>
          );
        })}
      </div>
    </Section>
  );
}
