import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { ReactNode } from "react";
import { bookingsCipher } from "../data/bookings.enc";
import { decryptBookings } from "./bookingsCrypto";
import type { Booking, BookingsData } from "./bookingsTypes";

const PIN_KEY = "tuscany-unlock-v1";

/**
 * Which itinerary days have a booking. Kept UNencrypted on purpose so day
 * cards can show a "tickets booked" hint before the PIN is entered — this
 * leaks only *that a day has a ticket*, never any booking detail. Keep in
 * sync with the encrypted packet's dayNumbers.
 */
export const BOOKED_DAY_NUMBERS = new Set<number>([2, 3, 7]);

interface BookingsCtx {
  /** Decrypted packet, or null while still locked. */
  data: BookingsData | null;
  /** Try a PIN; on success stores it (per device) and reveals the data. */
  unlock: (pin: string) => Promise<boolean>;
}

const Ctx = createContext<BookingsCtx>({
  data: null,
  unlock: async () => false
});

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<BookingsData | null>(null);

  // Attempt a remembered PIN so it's a once-per-device prompt.
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

  const unlock = useCallback(async (pin: string) => {
    const d = await decryptBookings<BookingsData>(bookingsCipher, pin.trim());
    if (d) {
      localStorage.setItem(PIN_KEY, pin.trim());
      setData(d);
      return true;
    }
    return false;
  }, []);

  const value = useMemo(() => ({ data, unlock }), [data, unlock]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBookings(): BookingsCtx {
  return useContext(Ctx);
}

/** Decrypted bookings for one itinerary day (empty while locked). */
export function useBookingsForDay(dayNumber: number): Booking[] {
  const { data } = useBookings();
  if (!data) return [];
  return data.activities.filter(b => b.dayNumber === dayNumber);
}
