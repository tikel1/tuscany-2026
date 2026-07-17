import { createContext, useContext } from "react";

/** A localized string pair for booking prose. */
export interface BookingLoc {
  en: string;
  he: string;
}

/** A localized list pair. */
export interface BookingListLoc {
  en: string[];
  he: string[];
}

export interface Booking {
  id: string;
  title: BookingLoc;
  day: BookingLoc;
  time: string;
  arriveBy?: string;
  duration?: BookingLoc;
  party?: BookingLoc;
  meetup: BookingLoc;
  address?: string;
  /** Free-text query for a Google Maps search link. */
  mapsQuery?: string;
  phones?: string[];
  email?: string;
  provider?: string;
  /** Order numbers / booking references — the "handle it" info. */
  booking?: BookingLoc;
  price?: string;
  included?: BookingListLoc;
  bring?: BookingListLoc;
  notes?: BookingListLoc;
  cancel?: BookingLoc;
}

export interface BookingsData {
  version: number;
  activities: Booking[];
}

/** Null until the PIN gate decrypts the packet. */
export const BookingsContext = createContext<BookingsData | null>(null);

export function useBookings(): BookingsData | null {
  return useContext(BookingsContext);
}
