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

/** Casual three-tier rating for how demanding an attraction is for a
 *  family of mixed ages. We try to keep most of the trip "easy" and
 *  flag anything with a real climb, scramble, or specific gear. */
export type Difficulty = "easy" | "moderate" | "challenging";

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
  /** How demanding the visit is — Easy / Moderate / Challenging. */
  difficulty?: Difficulty;
  /** Practical "insider" notes for the place — parking, what to wear,
   *  opening tricks, kid age limits. Short bullets, not paragraphs. */
  tips?: string[];
}

export interface Stay extends POI {
  category: "stay";
  checkIn: string;
  checkOut: string;
  nights: number;
  bookingLink?: string;
  highlights: string[];
  warnings?: string[];
  /** Optional extra photos shown in the stay-card carousel.
   *  When present, the card crossfades through `[image, ...gallery]`. */
  gallery?: string[];
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
  /** Suggested clothing & gear for this day's mix of activities. */
  gear?: string[];
  /** Day-specific advice (timing, money, mood) that doesn't belong to
   *  a single attraction — the things you'd whisper at breakfast. */
  dayTips?: string[];
}

/* ---------- Food & Wine ---------- */

export type DishCategory =
  | "pasta"
  | "starter"
  | "main"
  | "dessert"
  | "drink"
  | "snack";

export interface Dish {
  id: string;
  /** English name of the dish. */
  name: string;
  /** The original Italian name (rendered in italics on the card). */
  italianName?: string;
  /** "north" = best in the Larciano / Garfagnana zone,
   *  "south" = best in the Maremma / Pitigliano zone,
   *  "tuscany" = found everywhere we travel. */
  region: "north" | "south" | "tuscany";
  category: DishCategory;
  description: string;
  /** Short hint at where to try it — "Trattoria Verdi in Manciano". */
  tryIt?: string;
}

export interface Winery {
  id: string;
  name: string;
  region: "north" | "south";
  /** The DOC / DOCG denomination, e.g. "Carmignano DOCG". */
  appellation: string;
  description: string;
  website?: string;
  address?: string;
  coords?: [number, number];
  /** "Book ahead — small family operation" etc. */
  bookingNote?: string;
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
