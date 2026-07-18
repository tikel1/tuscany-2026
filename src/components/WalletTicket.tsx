import { useCallback, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Car,
  Phone,
  Mail,
  Users,
  Euro,
  CheckCircle2,
  Backpack,
  Info,
  CalendarX,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  KeyRound
} from "lucide-react";
import type { Booking, BookingLoc, BookingListLoc } from "../lib/bookingsTypes";
import { getAttraction } from "../data/attractions";
import { useLocalizePoi } from "../data/i18n";
import { useLang } from "../lib/i18n";
import { useT } from "../lib/dict";
import PoiImage from "./PoiImage";

/** All orders are under the trip owner's name — printed on each pass. */
const CARDHOLDER = "Itay Kaplan";

/** A distinct colour identity per ticket (semi-transparent over the photo). */
const THEMES: Record<string, string> = {
  "canyon-park-sup":
    "linear-gradient(150deg, rgba(58,90,74,0.66) 0%, rgba(14,40,30,0.94) 100%)",
  "soft-rafting":
    "linear-gradient(150deg, rgba(42,74,104,0.66) 0%, rgba(12,32,58,0.94) 100%)",
  "argentario-catamaran":
    "linear-gradient(150deg, rgba(196,90,61,0.68) 0%, rgba(66,22,36,0.94) 100%)"
};
const FALLBACKS = [
  "linear-gradient(150deg, rgba(196,90,61,0.68) 0%, rgba(66,22,36,0.94) 100%)",
  "linear-gradient(150deg, rgba(58,90,74,0.66) 0%, rgba(14,40,30,0.94) 100%)",
  "linear-gradient(150deg, rgba(184,134,44,0.68) 0%, rgba(66,42,14,0.94) 100%)"
];

function themeFor(b: Booking, index: number): string {
  return THEMES[b.id] ?? FALLBACKS[index % FALLBACKS.length];
}

function mapsHref(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * The minimalist "credit card" face: attraction photo + colour gradient, a
 * gold chip, the activity, its date & time, and the cardholder. Fills its
 * parent (wrap it in an aspect-[1.7/1] box).
 */
export function TicketCardFace({
  booking: b,
  index = 0,
  onClick,
  className = "",
  style
}: {
  booking: Booking;
  index?: number;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  const { lang } = useLang();
  const localizePoi = useLocalizePoi();
  const raw = b.attractionId ? getAttraction(b.attractionId) : undefined;
  const venue = raw ? localizePoi(raw) : undefined;
  const dayFull = b.day[lang];
  // "Day 2 · Tue 18 Aug" → "Tue 18 Aug"
  const dayShort = dayFull.includes("·")
    ? dayFull.slice(dayFull.indexOf("·") + 1).trim()
    : dayFull;

  return (
    <div
      onClick={onClick}
      style={style}
      className={`relative w-full h-full overflow-hidden rounded-2xl ring-1 ring-black/10 shadow-[0_20px_45px_-24px_rgba(40,20,10,0.7)] ${className}`}
    >
      <div className="absolute inset-0">
        <PoiImage
          src={raw?.image}
          alt={venue?.name ?? b.title[lang]}
          region={raw?.region}
          category={raw?.category}
          tags={raw?.tags}
        />
      </div>
      <div className="absolute inset-0" style={{ backgroundImage: themeFor(b, index) }} />
      <div className="absolute inset-0 p-4 flex flex-col justify-between text-cream-50">
        {/* chip + brand */}
        <div className="flex items-start justify-between gap-2">
          <span
            className="h-5 w-7 rounded-[4px] ring-1 ring-white/30 shrink-0"
            style={{ backgroundImage: "linear-gradient(135deg, #f4d58d 0%, #d9a441 100%)" }}
            aria-hidden
          />
          <span className="text-[9px] uppercase tracking-[0.16em] opacity-80 truncate max-w-[58%] text-end">
            {venue?.name ?? b.provider}
          </span>
        </div>
        {/* activity + when */}
        <div>
          <h3 className="font-serif text-base sm:text-lg leading-snug line-clamp-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
            {b.title[lang]}
          </h3>
          <div className="text-[10.5px] opacity-90 mt-0.5">
            {dayShort} · {b.time}
          </div>
        </div>
        {/* card number + holder */}
        <div>
          {b.bookingRef && (
            <div className="font-mono text-[11px] tracking-[0.1em] opacity-95 drop-shadow truncate">
              {b.bookingRef}
            </div>
          )}
          <div className="text-[9px] uppercase tracking-[0.2em] opacity-80 mt-0.5">
            {CARDHOLDER}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  children
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-terracotta-600 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-[0.15em] text-ink-700/55">
          {label}
        </div>
        <div className="text-[15px] text-ink-900/90 break-words">{children}</div>
      </div>
    </div>
  );
}

/** The full logistics for a booking — shown once, for the active card. */
export function TicketDetails({ booking: b }: { booking: Booking }) {
  const { lang } = useLang();
  const t = useT();
  const localizePoi = useLocalizePoi();
  const loc = (v: BookingLoc) => v[lang];
  const list = (v: BookingListLoc) => v[lang];
  const [copied, setCopied] = useState(false);

  const raw = b.attractionId ? getAttraction(b.attractionId) : undefined;
  const venue = raw ? localizePoi(raw) : undefined;

  const copyRef = useCallback(() => {
    if (!b.bookingRef) return;
    navigator.clipboard
      ?.writeText(b.bookingRef)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  }, [b.bookingRef]);

  return (
    <div className="card-paper p-4 sm:p-5 space-y-3">
      <Field icon={<MapPin size={16} />} label={t("bookings_meetup")}>
        {loc(b.meetup)}
        {b.address && <div className="text-ink-700/70 text-sm">{b.address}</div>}
        {b.mapsQuery && (
          <a
            href={mapsHref(b.mapsQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-terracotta-700 text-sm mt-0.5 hover:underline"
          >
            <Navigation size={12} /> {t("bookings_directions")}
          </a>
        )}
      </Field>
      {b.drive && (
        <Field icon={<Car size={16} />} label={t("bookings_drive")}>
          {loc(b.drive)}
        </Field>
      )}
      {b.party && (
        <Field icon={<Users size={16} />} label={t("bookings_party")}>
          {loc(b.party)}
        </Field>
      )}
      {b.phones && b.phones.length > 0 && (
        <Field icon={<Phone size={16} />} label={t("bookings_phone")}>
          {b.phones.map((p, i) => (
            <span key={p}>
              {i > 0 && " · "}
              <a
                href={`tel:${p.replace(/[^+\d]/g, "")}`}
                className="text-terracotta-700 hover:underline"
              >
                {p}
              </a>
            </span>
          ))}
        </Field>
      )}
      {b.email && (
        <Field icon={<Mail size={16} />} label="Email">
          <a href={`mailto:${b.email}`} className="text-terracotta-700 hover:underline">
            {b.email}
          </a>
        </Field>
      )}
      {venue?.website && (
        <Field icon={<ExternalLink size={16} />} label={t("bookings_venue")}>
          <a
            href={venue.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-terracotta-700 hover:underline"
          >
            {venue.name} <ExternalLink size={12} />
          </a>
        </Field>
      )}
      {(b.bookingRef || b.bookingPin) && (
        <div className="rounded-xl bg-terracotta-500/8 ring-1 ring-terracotta-500/25 p-3">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-terracotta-700/80">
            <KeyRound size={13} /> {t("bookings_ref")}
          </div>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            {b.bookingRef && (
              <code className="font-mono text-base font-semibold text-ink-900 tracking-wide break-all">
                {b.bookingRef}
              </code>
            )}
            {b.bookingRef && (
              <button
                type="button"
                onClick={copyRef}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/70 ring-1 ring-ink-900/10 text-xs text-ink-700 hover:bg-white transition-colors"
                aria-label={t("bookings_copy")}
              >
                {copied ? (
                  <Check size={13} className="text-olive-700" />
                ) : (
                  <Copy size={13} />
                )}
                {copied ? t("bookings_copied") : t("bookings_copy")}
              </button>
            )}
          </div>
          {b.bookingPin && (
            <div className="mt-1.5 text-sm text-ink-700/80">
              {t("bookings_pin")}:{" "}
              <code className="font-mono font-medium text-ink-900">{b.bookingPin}</code>
            </div>
          )}
        </div>
      )}
      {b.price && (
        <Field icon={<Euro size={16} />} label={t("bookings_price")}>
          {b.price}
        </Field>
      )}
      {b.included && (
        <Field icon={<CheckCircle2 size={16} />} label={t("bookings_included")}>
          {list(b.included).join(" · ")}
        </Field>
      )}
      {b.bring && (
        <Field icon={<Backpack size={16} />} label={t("bookings_bring")}>
          {list(b.bring).join(" · ")}
        </Field>
      )}
      {b.notes && (
        <Field icon={<Info size={16} />} label={t("bookings_notes")}>
          <ul className="list-disc ms-4 space-y-0.5">
            {list(b.notes).map(n => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Field>
      )}
      {b.cancel && (
        <Field icon={<CalendarX size={16} />} label={t("bookings_cancel")}>
          {loc(b.cancel)}
        </Field>
      )}
    </div>
  );
}

/**
 * A single expandable pass — used on the day page (one ticket): the minimal
 * face plus a "Details" toggle that reveals the full logistics.
 */
export default function WalletTicket({
  booking,
  index = 0
}: {
  booking: Booking;
  index?: number;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <div className="aspect-[1.6/1]">
        <TicketCardFace
          booking={booking}
          index={index}
          onClick={() => setOpen(o => !o)}
          className="cursor-pointer"
        />
      </div>
      <div className="mt-2 flex justify-center">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className="inline-flex items-center gap-1 text-sm text-terracotta-700 hover:text-terracotta-800"
        >
          {t(open ? "ticket_less" : "ticket_more")}
          <ChevronDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2">
              <TicketDetails booking={booking} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
