import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { bookingsCipher } from "../data/bookings.enc";
import { decryptBookings } from "../lib/bookingsCrypto";
import { BookingsContext } from "../lib/bookingsContext";
import type { BookingsData } from "../lib/bookingsContext";
import { useT } from "../lib/dict";

const PIN_KEY = "tuscany-unlock-v1";

/**
 * Whole-site PIN gate. Renders a PIN prompt until the shared code decrypts the
 * bookings packet, then provides the decrypted data to the tree. A remembered
 * PIN is kept in localStorage so it's a once-per-device prompt.
 */
export default function LockGate({ children }: { children: ReactNode }) {
  const t = useT();
  const [bookings, setBookings] = useState<BookingsData | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [pin, setPin] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const tryPin = useCallback(async (candidate: string): Promise<boolean> => {
    const data = await decryptBookings<BookingsData>(bookingsCipher, candidate);
    if (data) {
      setBookings(data);
      setUnlocked(true);
      return true;
    }
    return false;
  }, []);

  // On mount, attempt a remembered PIN.
  useEffect(() => {
    let cancelled = false;
    const stored = localStorage.getItem(PIN_KEY);
    (async () => {
      if (stored && (await tryPin(stored))) {
        if (!cancelled) setChecking(false);
        return;
      }
      if (!cancelled) setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [tryPin]);

  useEffect(() => {
    if (!checking && !unlocked) inputRef.current?.focus();
  }, [checking, unlocked]);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (busy || !pin) return;
      setBusy(true);
      setError(false);
      const ok = await tryPin(pin.trim());
      if (ok) {
        localStorage.setItem(PIN_KEY, pin.trim());
      } else {
        setError(true);
        setPin("");
        inputRef.current?.focus();
      }
      setBusy(false);
    },
    [busy, pin, tryPin]
  );

  if (unlocked) {
    return (
      <BookingsContext.Provider value={bookings}>
        {children}
      </BookingsContext.Provider>
    );
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <p className="text-ink-700/70 text-sm tracking-wide">{t("lock_working")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center gap-3 justify-center">
          <span className="h-px w-8 bg-terracotta-500/60" aria-hidden />
          <div className="section-eyebrow !mt-0">{t("lock_eyebrow")}</div>
          <span className="h-px w-8 bg-terracotta-500/60" aria-hidden />
        </div>
        <h1 className="mt-4 font-serif text-4xl text-ink-900 leading-tight">
          {t("lock_title")}
        </h1>
        <p className="mt-3 text-ink-700/85">{t("lock_prompt")}</p>

        <form onSubmit={onSubmit} className="mt-6">
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

        {error && (
          <p className="mt-3 text-sm text-red-700/90">{t("lock_error")}</p>
        )}
        <p className="mt-6 text-xs text-ink-700/55">{t("lock_hint")}</p>
      </div>
    </div>
  );
}
