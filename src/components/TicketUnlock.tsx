import { useCallback, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Lock } from "lucide-react";
import { useBookings } from "../lib/bookingsStore";
import { useT } from "../lib/dict";

/**
 * Shared PIN prompt. Unlocks the app-wide bookings store, so entering the
 * code anywhere (the Tickets section or a day card) reveals it everywhere.
 * `compact` trims it down for inline use inside a day card.
 */
export default function TicketUnlock({ compact = false }: { compact?: boolean }) {
  const { unlock } = useBookings();
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
      const ok = await unlock(pin);
      if (!ok) {
        setError(true);
        setPin("");
        inputRef.current?.focus();
      }
      setBusy(false);
    },
    [busy, pin, unlock]
  );

  return (
    <div
      className={`card-paper mx-auto text-center ${
        compact ? "max-w-sm p-4" : "max-w-md p-6 sm:p-8"
      }`}
    >
      <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-terracotta-500/12 text-terracotta-600">
        <Lock size={compact ? 18 : 20} />
      </span>
      <p className={`text-ink-700/85 ${compact ? "mt-3 text-sm" : "mt-4"}`}>
        {t("lock_prompt")}
      </p>
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
      <p className={`text-ink-700/55 ${compact ? "mt-3 text-xs" : "mt-5 text-xs"}`}>
        {t("lock_hint")}
      </p>
    </div>
  );
}
