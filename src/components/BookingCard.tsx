import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import {
  MapPin,
  Clock,
  Car,
  Phone,
  Mail,
  Ticket,
  Users,
  Euro,
  CheckCircle2,
  Backpack,
  Info,
  CalendarX,
  Navigation,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import type { Booking, BookingLoc, BookingListLoc } from "../lib/bookingsTypes";
import { getAttraction } from "../data/attractions";
import { useLocalizePoi } from "../data/i18n";
import { useLang } from "../lib/i18n";
import { useT } from "../lib/dict";

function mapsHref(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
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

/** One booking rendered as a card. `showDay` hides the day badge when the
 *  card is already shown inside that day's context. */
export default function BookingCard({
  booking: b,
  showDay = true
}: {
  booking: Booking;
  showDay?: boolean;
}) {
  const { lang } = useLang();
  const t = useT();
  const localizePoi = useLocalizePoi();
  const loc = (v: BookingLoc) => v[lang];
  const list = (v: BookingListLoc) => v[lang];

  const [copied, setCopied] = useState(false);
  const rawAttraction = b.attractionId ? getAttraction(b.attractionId) : undefined;
  const venue = rawAttraction ? localizePoi(rawAttraction) : undefined;

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
    <article className="card-paper p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h3 className="font-serif text-2xl text-ink-900 leading-tight">
          {loc(b.title)}
        </h3>
        {showDay && (
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-terracotta-700 whitespace-nowrap">
            {loc(b.day)}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <Field icon={<Clock size={16} />} label={t("bookings_time")}>
          {b.time}
          {b.arriveBy && (
            <span className="text-ink-700/70">
              {" "}
              · {t("bookings_arrive")} {b.arriveBy}
            </span>
          )}
          {b.duration && (
            <span className="text-ink-700/70"> · {loc(b.duration)}</span>
          )}
        </Field>

        <Field icon={<MapPin size={16} />} label={t("bookings_meetup")}>
          {loc(b.meetup)}
          {b.address && (
            <div className="text-ink-700/70 text-sm">{b.address}</div>
          )}
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
            <a
              href={`mailto:${b.email}`}
              className="text-terracotta-700 hover:underline"
            >
              {b.email}
            </a>
          </Field>
        )}

        {b.provider && (
          <Field icon={<Info size={16} />} label={t("bookings_provider")}>
            {b.provider}
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

        {b.bookingRef && (
          <div className="rounded-xl bg-terracotta-500/8 ring-1 ring-terracotta-500/25 p-3">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-terracotta-700/80">
              <Ticket size={13} /> {t("bookings_ref")}
            </div>
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <code className="font-mono text-lg sm:text-xl font-semibold text-ink-900 tracking-wide break-all">
                {b.bookingRef}
              </code>
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
            </div>
            {b.bookingPin && (
              <div className="mt-1.5 text-sm text-ink-700/80">
                {t("bookings_pin")}:{" "}
                <code className="font-mono font-medium text-ink-900">
                  {b.bookingPin}
                </code>
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
    </article>
  );
}
