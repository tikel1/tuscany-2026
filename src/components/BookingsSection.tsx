import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  MapPin,
  Clock,
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
  Lock
} from "lucide-react";
import Section from "./Section";
import { bookingsCipher } from "../data/bookings.enc";
import { decryptBookings } from "../lib/bookingsCrypto";
import type {
  Booking,
  BookingLoc,
  BookingListLoc,
  BookingsData
} from "../lib/bookingsTypes";
import { useLang } from "../lib/i18n";
import { useT } from "../lib/dict";

const PIN_KEY = "tuscany-unlock-v1";

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

/** The inline PIN prompt shown until the shared code decrypts the packet. */
function BookingsLock({ onUnlock }: { onUnlock: (data: BookingsData) => void }) {
  const t = useT();
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (busy || !pin) return;
      setBusy(true);
      setError(false);
      const data = await decryptBookings<BookingsData>(bookingsCipher, pin.trim());
      if (data) {
        localStorage.setItem(PIN_KEY, pin.trim());
        onUnlock(data);
      } else {
        setError(true);
        setPin("");
        inputRef.current?.focus();
      }
      setBusy(false);
    },
    [busy, pin, onUnlock]
  );

  return (
    <div className="card-paper max-w-md mx-auto p-6 sm:p-8 text-center">
      <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-terracotta-500/12 text-terracotta-600">
        <Lock size={20} />
      </span>
      <p className="mt-4 text-ink-700/85">{t("lock_prompt")}</p>
      <form onSubmit={onSubmit} className="mt-4">
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={pin}
          onChange={e => {
            setPin(e.target.value);
            setError(false);
          }}
          placeholder={t("lock_placeholder")}
          aria-label={t("lock_placeholder")}
          className="w-full text-center text-2xl tracking-[0.4em] font-serif py-3 rounded-xl border border-ink-900/15 bg-white/70 focus:outline-none focus:ring-2 focus:ring-terracotta-500/50"
        />
        <button
          type="submit"
          disabled={busy || !pin}
          className="mt-4 w-full py-3 rounded-xl bg-terracotta-600 text-white font-medium tracking-wide disabled:opacity-50 hover:bg-terracotta-700 transition-colors"
        >
          {busy ? t("lock_working") : t("lock_button")}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-700/90">{t("lock_error")}</p>}
      <p className="mt-5 text-xs text-ink-700/55">{t("lock_hint")}</p>
    </div>
  );
}

export default function BookingsSection() {
  const { lang } = useLang();
  const t = useT();
  const [data, setData] = useState<BookingsData | null>(null);

  // Try a remembered PIN so it's a once-per-device prompt.
  useEffect(() => {
    let cancelled = false;
    const stored = localStorage.getItem(PIN_KEY);
    if (!stored) return;
    (async () => {
      const d = await decryptBookings<BookingsData>(bookingsCipher, stored);
      if (d && !cancelled) setData(d);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loc = (v: BookingLoc) => v[lang];
  const list = (v: BookingListLoc) => v[lang];

  return (
    <Section
      id="bookings"
      eyebrow={t("bookings_eyebrow")}
      title={t("bookings_title")}
      kicker={t("bookings_kicker")}
      toned
    >
      {!data ? (
        <BookingsLock onUnlock={setData} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {data.activities.map((b: Booking) => (
            <article key={b.id} className="card-paper p-5 sm:p-6">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <h3 className="font-serif text-2xl text-ink-900 leading-tight">
                  {loc(b.title)}
                </h3>
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-terracotta-700 whitespace-nowrap">
                  {loc(b.day)}
                </span>
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

                {b.booking && (
                  <Field icon={<Ticket size={16} />} label={t("bookings_ref")}>
                    <span className="font-mono text-[13px]">{loc(b.booking)}</span>
                  </Field>
                )}

                {b.price && (
                  <Field icon={<Euro size={16} />} label={t("bookings_price")}>
                    {b.price}
                  </Field>
                )}

                {b.included && (
                  <Field
                    icon={<CheckCircle2 size={16} />}
                    label={t("bookings_included")}
                  >
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
                  <Field
                    icon={<CalendarX size={16} />}
                    label={t("bookings_cancel")}
                  >
                    {loc(b.cancel)}
                  </Field>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
