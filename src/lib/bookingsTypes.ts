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
  /** Itinerary day this booking belongs to (matches Day.dayNumber). */
  dayNumber: number;
  /** ISO date (YYYY-MM-DD) — used to order tickets upcoming-first. */
  date?: string;
  /** The attraction this ticket is for — links the booking to its POI. */
  attractionId?: string;
  /** Short, indicative type shown big on the card face (e.g. "Cruise day"). */
  label?: BookingLoc;
  title: BookingLoc;
  day: BookingLoc;
  time: string;
  arriveBy?: string;
  duration?: BookingLoc;
  /** Drive to the meeting point (from the day's base). */
  drive?: BookingLoc;
  party?: BookingLoc;
  meetup: BookingLoc;
  address?: string;
  /** Free-text query for a Google Maps search link. */
  mapsQuery?: string;
  phones?: string[];
  email?: string;
  provider?: string;
  /** The primary confirmation / order number — highlighted + copyable. */
  bookingRef?: string;
  /** Secondary access code (e.g. a GetYourGuide PIN). */
  bookingPin?: string;
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
