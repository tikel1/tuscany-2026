export type Region = "north" | "south" | "transit";

export type Category =
  | "attraction"
  | "stay"
  | "restaurant"
  | "supermarket"
  | "gas"
  | "airport"
  | "hospital"
  // Wineries from data/wineries.ts get projected onto the map as POIs
  // under this category (off by default in the filter UI).
  | "winery";

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
  /** Drive time from this stop to the NEXT activity, rendered as a small
   *  inline connector on the chapter detail page. Only set when there's a
   *  meaningful drive between stops — skip for sub-5-minute hops or when
   *  the next activity is at the same place. Examples: "45 min", "1 h 15".
   *  `note` is a short hint like "via A1" or "winding mountain road". */
  rideToNext?: { duration: string; note?: string };
  /** When true, render this activity with an "Optional" badge and slightly
   *  muted styling — signal to the family that the day's plan still works
   *  if they skip this one. When undefined, the chapter page applies a
   *  rule-of-thumb: on a day with more than 2 attractionId-bearing
   *  activities, the 3rd-and-later ones are treated as optional (you can
   *  realistically only fit ~2 multi-hour stops in a day with drives).
   *  Set explicitly to `false` to opt a specific activity OUT of the
   *  auto-rule (e.g. Day 9's Civita is always part of the plan). */
  optional?: boolean;
}

/** A single item on the per-day pack list. `item` is the description that
 *  gets translated; `for` (optional) is the attraction id this item is
 *  there for, so the UI can show a "for Canyon Park" chip and let the
 *  reader jump to that activity. Items without `for` are general-purpose
 *  (think: hat, water, cash) and apply to the whole day. */
export interface GearItem {
  item: string;
  for?: string;
}

/** A small phrase-of-the-day flashcard, picked to fit the day's mood
 *  (water words on water days, "arrivederci" on departure day, etc.).
 *  Italian and the spoken pronunciation are universal; meaning + the
 *  example translation get translated per language. */
export interface ItalianWord {
  /** The Italian word or short phrase, e.g. "Acqua". */
  word: string;
  /** Pronunciation in plain phonetics, e.g. "AH-kwah". Universal. */
  pronounce: string;
  /** Plain-language meaning in the active language ("Water" / "מים"). */
  meaning: string;
  /** Optional example sentence in Italian — "L'acqua è fresca!". */
  example?: string;
  /** Translation of the example in the active language. */
  exampleMeaning?: string;
}

/** Categories for the "drink of the day" closing flourish — drives the
 *  card's icon and accent color. `other` is the catch-all for anything
 *  exotic (grappa, vermouth, vin santo, etc.). */
export type DrinkType =
  | "wine"
  | "cocktail"
  | "beer"
  | "aperitif"
  | "digestif"
  | "coffee"
  | "other";

/** An adults-only "what to pour tonight" suggestion that closes each
 *  chapter — picked to match the day's mood and to lean into local
 *  Tuscan / Maremmano grapes & rituals where possible. */
export interface DayDrink {
  /** The drink's name — "Aperol Spritz", "Chianti Classico DOCG". The
   *  Italian / proper-noun part stays universal across languages. */
  name: string;
  /** Italian-friendly category — drives icon + chip color. */
  type: DrinkType;
  /** One or two sentences on why this drink fits this specific day. */
  pairing: string;
  /** Optional serving / glassware note ("tall glass with ice and an orange
   *  slice", "served chilled, never with ice"). */
  servingNote?: string;
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
  /** Suggested clothing & gear for this day's mix of activities.
   *  Items can optionally reference the specific attraction they're for. */
  gear?: GearItem[];
  /** Day-specific advice (timing, money, mood) that doesn't belong to
   *  a single attraction — the things you'd whisper at breakfast. */
  dayTips?: string[];
  /** A small Italian word or phrase picked to fit the day — rendered as
   *  a magazine-style flashcard near the top of the chapter page. */
  wordOfTheDay?: ItalianWord;
  /** Curated list of `Service.id` values (restaurants only) that make
   *  sense to eat at on this day — typically the lunch spot mentioned
   *  in an activity, plus a dinner option near base. Looked up via
   *  `getService` and rendered in the chapter detail page. */
  restaurants?: string[];
  /** Adults-only "what to pour tonight" suggestion — closes the chapter
   *  with a small drink card after the tips. */
  drinkOfTheDay?: DayDrink;
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
  /** Optional CC photo of the dish, served from /public/images/. */
  image?: string;
  imageCredit?: ImageCredit;
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
  /** Optional CC photo — vineyard, cellar, the village it sits in. */
  image?: string;
  imageCredit?: ImageCredit;
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
