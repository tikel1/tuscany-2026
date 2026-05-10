export type Region = "north" | "south" | "transit";

export type Category =
  | "attraction"
  | "stay"
  | "restaurant"
  | "supermarket"
  | "gas"
  | "airport"
  | "hospital";

export type AttractionTag =
  | "water"
  | "extreme"
  | "nature"
  | "culture"
  | "family"
  | "food"
  | "view"
  | "cave"
  | "village";

export interface ImageCredit {
  /** Display name of the photographer / source. */
  author: string;
  /** Short license id, e.g. "CC BY-SA 4.0", "CC BY 2.0", "Public Domain". */
  license: string;
  /** URL to the original source page (e.g. Wikimedia Commons). */
  source?: string;
  /** URL to the license terms. */
  licenseUrl?: string;
}

export interface POI {
  id: string;
  name: string;
  category: Category;
  region: Region;
  description: string;
  shortDescription?: string;
  image?: string;
  imageCredit?: ImageCredit;
  website?: string;
  address?: string;
  coords: [number, number];
  tags?: AttractionTag[];
  openingNote?: string;
  bookingNote?: string;
}

export interface Stay extends POI {
  category: "stay";
  checkIn: string;
  checkOut: string;
  nights: number;
  bookingLink?: string;
  highlights: string[];
  warnings?: string[];
}

export interface Service extends POI {
  category: "restaurant" | "supermarket" | "gas";
  hours?: string;
  base: "north" | "south";
}

export interface DayActivity {
  time?: string;
  title: string;
  description: string;
  attractionId?: string;
  tag?: AttractionTag;
}

export interface Day {
  dayNumber: number;
  date: string;
  weekday: string;
  region: Region;
  title: string;
  subtitle?: string;
  base?: string;
  activities: DayActivity[];
  driveNotes?: string;
  /** Lead photo for the chapter when no activity in the day has an image. */
  leadImage?: string;
  leadImageCredit?: ImageCredit;
}

export interface ChecklistItem {
  id: string;
  text: string;
  detail?: string;
  link?: string;
  urgent?: boolean;
}

export interface Tip {
  id: string;
  title: string;
  body: string;
  severity: "info" | "warning" | "critical";
  icon?: string;
}

export interface EmergencyContact {
  label: string;
  value: string;
  detail?: string;
  link?: string;
  type: "phone" | "address" | "website";
}

export interface EmergencyGroup {
  title: string;
  items: EmergencyContact[];
}
