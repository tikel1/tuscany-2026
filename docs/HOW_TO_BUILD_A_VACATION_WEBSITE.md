# How to Build a Vacation Website

A field guide distilled from building **tuscany-2026** — a personal,
mobile-first travel companion for a 10-day family trip. Every choice
in here was made and re-made under real use (planning, packing, and
actually-on-the-ground driving), so the guidance is practical first
and elegant second.

If you're starting from scratch and want a site that's beautiful,
useful before the trip, indispensable during it, and easy to update
between trips — read this top to bottom. If you're just looking for
one pattern (the map, the itinerary, geolocation, i18n…) skip to the
section.

---

## Table of contents

1. [North star](#1-north-star)
2. [Tech stack](#2-tech-stack)
3. [Visual system](#3-visual-system)
4. [Information architecture](#4-information-architecture)
5. [The plan / itinerary — your headline section](#5-the-plan--itinerary--your-headline-section)
6. [The map](#6-the-map)
7. [Data modeling](#7-data-modeling)
8. [Internationalization](#8-internationalization)
9. [Images](#9-images)
10. [Navigation deep links (Maps + Waze)](#10-navigation-deep-links-maps--waze)
11. [Geolocation ("you are here")](#11-geolocation-you-are-here)
12. [Content guidelines](#12-content-guidelines)
13. [Mobile-first UX](#13-mobile-first-ux)
14. [Audio narration (pre-generated TTS)](#14-audio-narration-pre-generated-tts)
15. [Routing & persistence](#15-routing--persistence)
16. [SEO & social sharing](#16-seo--social-sharing)
17. [Deployment (GitHub Pages)](#17-deployment-github-pages)
18. [Common gotchas](#18-common-gotchas)
19. [If you only do five things](#19-if-you-only-do-five-things)

---

## 1. North star

Set these out loud before you write a line of code. They will quietly
end every "should we do X?" debate later.

- **Mobile first, always.** The site is read on a phone in the back
  of a car, on Wi-Fi in a villa, in bright Italian sun outside a
  trattoria. Desktop is a courtesy, not the default.
- **Real, verified data — no placeholders.** Lorem ipsum survives
  exactly until the trip starts. Spend the time to verify every
  address, opening hour, and phone number.
- **Static but updatable.** No backend. Just a Vite app deployed to
  GitHub Pages so you can push tiny edits from your phone.
- **"Magazine guide" feel.** Earthy, editorial, photographic. Big
  serif headings, lots of white space, photographs that earn their
  bytes. Think *Cereal* or *Condé Nast Traveler*, not a SaaS dashboard.
- **Useful both before and during the trip.** Pre-trip: a checklist,
  a countdown, a packing list. During: a live map dot, the day's
  plan, where to eat, emergency numbers. After: photos and memories
  (optional but think about it).
- **Bilingual when relevant.** Even if the family speaks English
  fluently, a Hebrew (or your second-language) overlay makes the site
  feel like *theirs*.

---

## 2. Tech stack

Boring is good. Pick stable, well-documented tools and let the design
do the talking.

| Layer | Pick | Why |
|---|---|---|
| Build | **Vite** | Instant dev server, no Webpack. Use `base: '/repo-name/'` for GH Pages. |
| Framework | **React + TypeScript** | Familiarity, strong types for travel data. |
| Styling | **Tailwind CSS v4** | Atomic classes scale well; great for mobile-first sizing. |
| Animation | **Framer Motion** | Crossfades, Ken Burns hero, AnimatePresence on chapter change. |
| Map | **React Leaflet + CartoDB Voyager tiles** | Free, key-less, warm editorial tiles that pair with the palette. |
| Icons | **Lucide React** | Hairline weight, huge catalog, easy to tint. |
| Weather | **Open-Meteo** | Free, no key, accurate enough for casual planning. |
| Hosting | **GitHub Pages** via Actions | Zero ops, custom domain optional, deploys on push. |
| Fonts | **Google Fonts** — Cormorant Garamond, Inter, Rubik (HE), Frank Ruhl Libre (HE) | Editorial pairing in both scripts. *Avoid David Libre — it reads as "old school cheap" the way Times/Arial do.* |

What we deliberately **didn't** add:
- A backend.
- A CMS.
- A state library (React `useState` + a small `MapFocusContext` was
  enough for ~5 cross-component interactions).
- A router library (a tiny `useHashRoute` hook handled `#chapter/N`).
- Service workers / PWA. (Tempting; not worth the complexity for a
  10-day trip.)

---

## 3. Visual system

A handful of decisions, applied consistently, give the site its
"magazine guide" feel.

### Palette

Define everything in `index.css` as `@theme` tokens so Tailwind
classes like `text-terracotta-600` and `bg-cream-50` Just Work:

```css
@theme {
  --color-cream-50: #FBF7EC;
  --color-cream-100: #F5EFE0;
  --color-terracotta-500: #C45A3D;
  --color-terracotta-600: #A8472D;
  --color-olive-500: #6B7A4B;
  --color-olive-600: #525E39;
  --color-ink-700: #4A3A30;
  --color-ink-900: #1A120E;
  --color-gold-500: #B8862C;
  /* ... */
}
```

Pick colors **from the destination**: Tuscany is terracotta + olive +
cream; Greece would be Aegean blue + whitewash + bougainvillea pink.
Three or four families with 2–3 shades each is plenty.

### Typography

```css
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
--font-serif: "Cormorant Garamond", "Georgia", ui-serif, serif;

html[dir="rtl"] {
  --font-sans: "Rubik", "Inter", ...;
  --font-serif: "Frank Ruhl Libre", "Cormorant Garamond", ...;
}
```

- **Serif for headings**, eyebrows, italic captions.
- **Sans for body** and chrome.
- One Hebrew serif + one Hebrew sans, swapped automatically by
  `[dir="rtl"]`. This is a one-line change with massive payoff —
  Hebrew rendered in default browser fonts looks alien on a magazine.
- **Frank Ruhl Libre** is the right Hebrew serif: contemporary
  proportions, real italic weight. Avoid David Libre / Times / Arial-
  style Hebrew faces — they read as "default Office document, 2003"
  and undercut the magazine feel.

### Mobile font scaling

Bump the root font-size on phones so every `text-sm`, `text-base` etc.
gets a free legibility boost without touching components:

```css
@media (max-width: 640px) {
  html { font-size: 18px; } /* desktop default 16px */
}
```

Then scale the arbitrary `text-[Npx]` classes too — they don't follow
`rem`:

```css
@media (max-width: 640px) {
  .text-\[10px\]   { font-size: 12px;   line-height: 1.35; }
  .text-\[11px\]   { font-size: 13px;   line-height: 1.4;  }
  /* ... */
}
```

For UI chrome that should *stay small* on mobile (weather widget,
photo credits, filter chip counts), opt out with `data-compact-ui`:

```css
@media (max-width: 640px) {
  [data-compact-ui] .text-\[10px\] { font-size: 10px; line-height: 1.3; }
  [data-compact-ui] .text-\[11px\] { font-size: 11px; line-height: 1.4; }
  /* ... */
}
```

```tsx
<div data-compact-ui className="text-[10px]">99°F · breezy</div>
```

### Reusable card surface

One Tailwind utility, applied everywhere a "card on cream paper"
appears, gives the whole site a consistent material:

```css
.card-paper {
  @apply bg-cream-50 border border-cream-200/80 rounded-2xl
         shadow-[0_2px_4px_rgba(42,31,26,0.04),0_8px_24px_-12px_rgba(42,31,26,0.12)];
}
.card-paper-hover {
  @apply transition-all duration-300
         hover:shadow-[0_2px_4px_rgba(42,31,26,0.06),0_16px_32px_-12px_rgba(42,31,26,0.18)]
         hover:-translate-y-0.5;
}
```

### Section pattern

Every top-level section uses the same skeleton:

- `eyebrow` — small uppercase label with letter-spacing
- `title` — big serif headline
- `kicker` — italic single-sentence subtitle
- optional `intro` paragraph
- contents

Wrap it in a `<Section>` component so spacing, max-width and the
ornamental rule between sections come for free.

---

## 4. Information architecture

The order of sections on the home page is the trip's **rhythm**.
Re-derive yours; ours, after several rounds with the family:

```
Hero (countdown / live day card)
  ↓
Plan / Itinerary  ← the headline, biggest space
  ↓
Map               ← navigation hub
  ↓
Highlights (10 photos / moments teaser)
  ↓
Places (attractions catalog)
  ↓
Local services (restaurants / supermarkets / gas)
  ↓
Food & wine (dishes & wineries)
  ↓
Neighborhood (where we stay)
  ↓
Tips
  ↓
Lists (packing & checklist)
  ↓
Emergency
  ↓
By the numbers (statistical pat-on-the-back)
  ↓
Footer
```

Two principles:
- **The plan comes first.** It's what the user came for. Don't bury it
  under "10 reasons to visit Tuscany".
- **Emergency goes near the end** — you only look for it when something's
  wrong, and it should still be one scroll-tap away on mobile.

The desktop **navbar** doesn't have to mirror the home page order — pick
the 7-or-so links that matter most for jump-navigation. Ours:

```
Plan · Places · Food · Map · Neighborhood · Tips · Lists · Emergency
```

The mobile **bottom nav** can only fit 4–5 primary tabs + a "More"
overlay. Pick the four exploration-essential tabs (Plan, Places,
Food, Map for us) and tuck the rest behind More.

---

## 5. The plan / itinerary — your headline section

This is the section your family will open most. Give it real weight.

### Magazine-chapter pattern

Each day is a "chapter" with:
- Roman numeral (`I`, `II`, …)
- Eyebrow with date + weekday
- Big serif title
- Italic kicker
- Hero image (or a small carousel)
- Activity list with times + descriptions
- Drive notes
- A "Read more →" link to a dedicated chapter page

### Sticky chapter ribbon

A horizontal-scrolling "table of contents" at the top of the section,
showing all 10 chapters as small pills with their dates. Tap one →
scrolls to that chapter. Add a sticky compact version that shows
once you scroll past the original ribbon.

### "Show the right day" logic

```ts
function getCurrentChapterIndex(today: Date): number {
  if (today < TRIP_START) return 0;       // pre-trip → show day 1
  if (today > TRIP_END)   return DAYS - 1; // post-trip → show last day
  return daysBetween(TRIP_START, today);
}
```

On first load, scroll the ribbon (and the chapter cards) so the
current/upcoming day is centered.

### Hero state machine: before, during, after

The hero is the only piece of UI that genuinely changes character
across the trip's phases. Model it explicitly with a `TripState`:

```ts
type TripState =
  | { phase: "before"; daysUntil: number; day1: Day }
  | { phase: "during"; today: Day; tomorrow?: Day;
      featured: Day; isFeaturingTomorrow: boolean }
  | { phase: "after";  lastDay: Day };
```

- **Before** — show the live countdown, the iconic destination photos,
  and "Until Tuscany …" (or your equivalent kicker).
- **During** — drop the countdown entirely. Replace the carousel with
  photos pulled from **the featured day's** attractions. Show the
  day's title + base + activities preview.
- **After** — gracefully degrade to the last day, or a "thank you"
  card.

The clever bit is `featured`: it's `today` until **20:00 local time**,
then flips to `tomorrow`. By the time the family is at dinner, the
hero is already previewing where they're going in the morning — gear,
drive time, word of the day, the whole thing. On the very last day
of the trip, `featured` stays as `today` (no tomorrow to flip to).

```ts
function isAfterEveningCutoff(now: Date) {
  return now.getHours() >= 20;
}
```

**Build hero photos from the featured day**, not from a static array,
when in `"during"` phase:

```ts
function buildDayHeroPhotos(day: Day, getPoi: (p: POI) => POI): HeroPhoto[] {
  const photos: HeroPhoto[] = [];
  for (const a of day.activities) {
    if (!a.attractionId) continue;
    const att = getAttraction(a.attractionId);
    if (!att?.image) continue;
    photos.push({ src: att.image, caption: getPoi(att).name, ... });
  }
  if (day.leadImage) photos.push({ src: day.leadImage, ... });
  return photos;
}
```

Reset the carousel index to 0 with a `useEffect` whenever the photos
array reference changes — otherwise the hero stays paused on the
"correct" index from yesterday's photos.

### Chapter detail page

Tapping "Read more" navigates to `#chapter/3` (hash routing — no
router library needed). The detail page has its own image carousel,
back arrow, and a content order designed for **the day of**:

1. **Italian word of the day** — fun, sets the mood
2. **The plan** — activities, drive notes, and inline ride times
   between stops (see "Activity rows" below)
3. **Restaurants nearby** — curated by day, not just by region. A
   restaurant in northern Maremma is useless on a Lucca day.
4. **Suggested end-of-day drink** — one Italian drink (wine, aperitif,
   cocktail, beer, digestif) with a one-line "why tonight" pairing
   to the day's vibe and an optional serving note. Adults only.
5. **Mini map** — the day's stops
6. **What to bring** — gear list (with "for X" chips that link to the
   activity below)
7. **Good to know** — day-specific tips
8. **Things to know** — global tips relevant to the chapter

Use `sessionStorage` to remember the last viewed chapter so the
browser back-button feels natural.

#### Activity rows

The day's activity list reads top-to-bottom like a magazine timeline:
small index + time + tag in an eyebrow line, big serif title, body
paragraph, optional "more about this place" disclosure.

Two patterns are easy to get wrong and make a huge difference:

- **Time labels live in the eyebrow, NOT below the icon.** Putting
  "Morning" / "Lunch" *under* the icon (with `position: absolute;
  bottom: -16px`) floats them right into the gap between rows, where
  they read as labeling the *next* item. Inline them in the eyebrow
  alongside the index and tag (`01 · MORNING · WATER`) so the time
  is unambiguously attached to its activity.
- **"Optional" attractions** get a small olive pill in the eyebrow
  and a slightly muted icon palette. Body, ride times, and
  more-info disclosure stay full-strength so the activity is still
  useful, just clearly marked as "skip if you're tired" (see the
  data-modeling section for the auto-rule).

#### Inline ride connectors

Between two activity rows, slip a small `RideConnector` with a tiny
`Car` icon in the timeline column and "Drive · 45 min · winding
mountain road" in the content column. The dashed border continues
the timeline rail through the connector so it reads as part of the
day, not a sibling of the activities. Only render it when the
preceding activity has a `rideToNext` field — skip for sub-5-minute
hops or when the next activity is at the same place.

### Italian word of the day

A magazine-style flashcard at the top:

```ts
interface ItalianWord {
  word: string;          // "Acqua"
  pronounce: string;     // "AH-kwah"
  meaning: string;       // "Water"
  example?: string;      // "L'acqua è fresca!"
  exampleMeaning?: string;
}
```

Pick words that fit the day (water words on water days, "arrivederci"
on departure day). Translate `meaning` and `exampleMeaning` per
language; the Italian itself stays universal.

---

## 6. The map

The map is the second-most-used section. Make it loud and useful, not
a decoration.

### Tiles

```tsx
<TileLayer
  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
  subdomains="abcd"
/>
```

CartoDB Voyager is warm, editorial, free, and key-less. Stamen
Watercolor is pretty but blocks non-localhost without a Stadia
account — don't get bitten by this one in production.

### Markers

Don't use the default Leaflet pins. Build a custom `divIcon` with a
gradient, a glyph, and a soft drop-shadow. Color by category:

```ts
const CATEGORY_CONFIG = {
  stay:        { color: "#A23E2A", Icon: Home,         glyph: "&#8962;" },
  attraction:  { color: "#C68A2A", Icon: Star,         glyph: "&#9733;" },
  restaurant:  { color: "#5C7244", Icon: Utensils,     glyph: "&#127860;" },
  winery:      { color: "#7A2E3F", Icon: Grape,        glyph: "&#127815;" },
  supermarket: { color: "#587A8E", Icon: ShoppingCart, glyph: "&#128722;" },
  gas:         { color: "#8B6F4A", Icon: Fuel,         glyph: "&#9981;"  },
  airport:     { color: "#3D4F65", Icon: Plane,        glyph: "&#9992;"  }
};
```

### Filter chips

A horizontal-scrolling row of category chips above the map. Each
chip shows the count and toggles its layer. **Default-on** the
essentials (stays, attractions, airport); leave the rest off so the
map doesn't look crowded on first load.

### The route

Draw your trip's big movements as dashed `Polyline`s in
category-matching colors:
- Arrival (airport → north base)
- Transfer (north base → south base)
- Departure (south base → airport)

Add a hover/tap state that thickens the segment and dims the others.

### Spokes

For each base stay, draw a thin dashed spoke to every attraction in
that region. Hides nicely under the main route, adds a "this is what
belongs to which half" reading at a glance. Toggle with a button.

### Floating buttons

Top-end of the map:
- **Fit-all** (`Maximize2`) — `flyToBounds` on every visible POI.
- **Locate me** (`Locate`) — see the geolocation section below.

---

## 7. Data modeling

Static TypeScript files in `src/data/` are the entire database. Keep
them strongly typed and freely commented.

```ts
// src/data/types.ts
export type Region = "north" | "south" | "transit";
export type Category =
  | "attraction" | "stay" | "restaurant" | "supermarket"
  | "gas" | "airport" | "hospital" | "winery";

export type Difficulty = "easy" | "moderate" | "challenging";

export interface ImageCredit {
  author: string;
  license: string;        // "CC BY-SA 4.0", "Public Domain", …
  source?: string;        // URL on Wikimedia / Unsplash
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
  difficulty?: Difficulty;
  tips?: string[];        // insider notes
}

export interface Stay extends POI {
  category: "stay";
  checkIn: string;
  checkOut: string;
  nights: number;
  bookingLink?: string;
  highlights: string[];
  warnings?: string[];
  gallery?: string[];     // extra photos for the carousel
}

export interface DayActivity {
  time?: string;          // "Morning", "07:30", "Late afternoon"
  title: string;
  description: string;
  attractionId?: string;
  tag?: AttractionTag;
  /** Drive from this stop to the NEXT one. Renders as an inline
   *  connector between activity rows. Only set for meaningful drives. */
  rideToNext?: { duration: string; note?: string };
  /** Override for the optional badge. Leave undefined to let the
   *  3rd-attraction-and-later auto-rule decide; set explicitly
   *  to true / false to force the answer. */
  optional?: boolean;
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
  leadImage?: string;
  leadImageCredit?: ImageCredit;
  gear?: GearItem[];
  dayTips?: string[];
  wordOfTheDay?: ItalianWord;
  restaurants?: string[];   // service ids — curated for THIS day
  drinkOfTheDay?: DayDrink;
}

export interface GearItem {
  item: string;
  for?: string;           // attraction id — renders as a clickable chip
}

export type DrinkType =
  | "wine" | "cocktail" | "aperitif" | "digestif"
  | "beer" | "coffee" | "other";

export interface DayDrink {
  name: string;           // "Aperol Spritz", "Chianti Classico DOCG"
  type: DrinkType;        // drives the icon + accent color
  pairing: string;        // one-liner "why tonight"
  servingNote?: string;   // "served over ice with an orange wheel"
}

export interface Dish { /* … */ }
export interface Winery { /* … */ }
export interface Tip { /* … */ }
export interface ChecklistItem { /* … */ }
export interface EmergencyContact { /* … */ }
```

A few patterns worth stealing:

- **`for` references on gear items.** Linking a packing-list entry to
  the specific activity it's for ("water shoes — *for Canyon Park*")
  makes the list feel hand-crafted.
- **Optional `tips: string[]` on every POI.** A short list of the
  things you'd whisper to the next family that visits.
- **`shortDescription` separate from `description`.** Map popups need
  one short sentence; cards have room for a paragraph. Don't try to
  reuse one for both.
- **`gallery: string[]` on stays.** Most Airbnb hosts give you 5+
  great photos. Build a card carousel that crossfades through them.
- **`rideToNext` on activities, not as separate timeline rows.** Keeps
  the data dense (a drive without a destination doesn't make sense)
  and the rendering trivial — slip a small `RideConnector` between
  rows when the field is present.
- **`restaurants: string[]` referencing service ids.** Don't duplicate
  restaurant data inline on the day; just list ids and look them up
  via a memoized `getService(id)` helper. That way the same
  restaurant on two days shares one source of truth.

#### The Optional auto-rule

A day can realistically only fit ~2 multi-hour attractions with
drives in between. Encode this as a tiny waterfall on the activity row:

```ts
function isActivityOptional(a: DayActivity, index: number, day: Day): boolean {
  if (a.optional !== undefined) return a.optional;       // explicit override wins
  if (!a.attractionId)          return false;            // not a "real" stop
  const attractionCount = day.activities.filter(x => x.attractionId).length;
  if (attractionCount <= 2)     return false;            // not a busy day
  const positionAmongAttractions = day.activities
    .slice(0, index + 1)
    .filter(x => x.attractionId).length;
  return positionAmongAttractions > 2;                   // 3rd-and-later
}
```

This lets the data stay terse — most days are correct for free —
while still allowing per-activity overrides where the heuristic
doesn't fit (e.g. when the day's title literally calls out the
3rd activity, set `optional: false` to opt out).

---

## 8. Internationalization

Don't bolt this on at the end. Write the dictionary scaffolding on
day one and use it from the first component.

### The dictionary

```ts
// src/lib/dict.ts
export const DICT = {
  brand_short:       { en: "Tuscany",    he: "טוסקנה" },
  hero_before_lead:  { en: "Until …",    he: "עד …" },
  nav_plan:          { en: "Plan",       he: "תוכנית" },
  /* ~200 entries by the end */
} as const;

export type DictKey = keyof typeof DICT;

export function useT() {
  const { lang } = useLang();
  return (key: DictKey, vars?: Record<string, string | number>) => {
    let s = DICT[key][lang];
    if (vars) for (const [k, v] of Object.entries(vars)) {
      s = s.replace(`{${k}}`, String(v));
    }
    return s;
  };
}
```

### Data translations

Don't duplicate the English data. Use **partial overlays** keyed by
id:

```ts
// src/data/i18n/attractions.he.ts
export const attractionsHE: Record<string, Partial<Pick<POI,
  "name" | "description" | "shortDescription" | "tips"
>>> = {
  "canyon-park": {
    name: "פארק הקניון",
    description: "...",
    tips: ["...", "..."]
  },
  /* ... */
};
```

Then a `localizePoi(p, lang)` function merges the partial onto the
English base. `undefined` values are stripped so partial translations
don't accidentally clobber English. Same pattern for stays, services,
days, dishes, wineries, tips, checklist, emergency.

For days, gear items have a special merge: Hebrew translations are
strings (just the `item`), positionally merged onto the English
`GearItem` objects so the `for: "canyon-park"` reference is preserved.

### Direction handling

```tsx
useEffect(() => {
  document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
}, [lang]);
```

Then everywhere in your CSS, **use logical properties** (`start`,
`end`, `ms-*`, `me-*`, `ps-*`, `pe-*`) instead of `left`/`right`.
Tailwind v4 has full logical-property support — embrace it from day
one.

Two important exceptions:
- **The top navbar** stays LTR (`dir="ltr"`) so the brand mark stays
  on the left and the language switcher stays on the right regardless
  of language. Hebrew labels still render correctly inside it.
- **Map popup attributions** stay LTR so OSM/Carto credits don't
  mirror weirdly.

### Directional icons

Conditionally swap `ChevronLeft`/`ChevronRight` and `ArrowLeft`/
`ArrowRight` when in RTL — or use a small helper:

```tsx
const Chevron = dir === "rtl" ? ChevronLeft : ChevronRight;
```

### Pin elements that should NOT swap fonts per language

The Hebrew serif (Frank Ruhl Libre) and the Latin serif (Cormorant
Garamond) have noticeably different tabular numerals and italic
shapes. Most prose should swap — that's the whole point — but a few
elements look better staying in the Latin serif regardless of
language. The big one is **the live countdown**: when the digits
swap to the Hebrew serif, the design loses continuity and the
"99 : 23 : 59 : 42" stops feeling like the same component you saw
in English. The fix is a one-line CSS utility:

```css
.font-latin-serif {
  font-family: "Cormorant Garamond", "Georgia", ui-serif, serif;
}
```

Apply it to the digits and separator while letting the unit labels
(days/hrs/min/sec) translate normally:

```tsx
<DigitCell className="font-latin-serif" /> { /* numbers */ }
<Sep      className="font-latin-serif" /> { /* the colon */ }
<Label    className="">                   { t("countdown_days") } </Label>
```

The same trick is useful for any number-heavy chrome (clocks,
temperature widgets, file sizes, version numbers in a footer).

**One more thing about serif numerals in tight backgrounds:** they
look optically high inside an evenly-padded pill or chip, because the
font's line-box reserves space below the baseline for descenders
(`g`, `p`, `y`) that digits never have. With `padding: 4px 4px` you
end up with a visible empty band below the digit. Bias the padding
upward without changing total height — e.g. `pt-2 pb-0` instead of
`py-1` — and the visible glyph drops back to the visual center.
Only worth fussing over at large display sizes (the live countdown,
big stat cards); body-size numerals don't need the correction.

### Persist the choice

```ts
localStorage.setItem("tuscany.lang", lang);
```

Read it on mount, default to `en`. Never auto-detect from
`navigator.language` — your readers' browsers might be set to all
sorts of things and a confident default is friendlier than a guess.

---

## 9. Images

Images are 80% of why the site feels good and 80% of the bytes.

### Source: Wikipedia + Wikimedia Commons + Unsplash

All three are CC-friendly and have great APIs. Build a Node.js fetch
script (`scripts/fetch-images.mjs`) that pulls every image once and
commits the JPGs to the repo:

```js
const TARGETS = [
  ["canyon-park.jpg",       { wiki: "Ponte_della_Maddalena" }],
  ["pisa.jpg",              { commons: "File:The_Leaning_Tower_of_Pisa.jpeg", width: 2000 }],
  ["tel-aviv-skyline.jpg",  { url: unsplash("photo-1547483036-24bc77c79804") }],
  /* ... */
];
```

The script needs three helpers:
- `getWikiLeadImage(title)` — `GET /api/rest_v1/page/summary/{title}`,
  returns `originalimage.source` (or widen the thumbnail).
- `getCommonsFile(file, width)` — `action=query&prop=imageinfo`, asks
  for a server-side resized thumbnail.
- `unsplash(photoId, w)` — `https://images.unsplash.com/${id}?fm=jpg
  &q=85&w=${w}&auto=format&fit=crop`.

Add **retry with exponential backoff** for 429 / 5xx — Wikimedia
rate-limits aggressively. Add a **fallback UA** (Googlebot string) for
hosts that block default UAs. Skip files that already exist on disk
so re-running the script is cheap.

### Render with a fallback component

```tsx
<PoiImage src={poi.image} alt={poi.name} region={poi.region}
          category={poi.category} tags={poi.tags} />
```

`PoiImage` renders an `<img>` with `onError` swapping to a styled
gradient placeholder (region color + category icon + the alt text in
serif). This means missing images **never** show a broken-image icon
in production.

### Hero photo carousel

The hero section rotates through 6–10 of your most beautiful
"screensaver" shots, each captioned with the place + the day you'll
visit it ("Pitigliano (Day 7)"). Crossfade with `AnimatePresence`,
add a Ken Burns drift with `motion.div`, **lazy-preload the next
image** so the network only carries 1 photo at a time:

```ts
useEffect(() => {
  const next = (idx + 1) % HERO_PHOTOS.length;
  const img = new Image();
  img.src = HERO_PHOTOS[next].src;
}, [idx]);
```

### Photo credit overlay

Keep it tiny. We landed on a `© BY-SA` glyph at 9px in the corner of
showcase photos, with the full author + license in the link's
`title` and `aria-label`:

```tsx
<a href={credit.source} target="_blank" rel="noopener noreferrer"
   title={`${credit.author} · ${credit.license}`}>
  <span data-compact-ui className="text-[9px] tracking-wide opacity-85">
    © {credit.license.replace(/^CC\s+/, "")}
  </span>
</a>
```

**Remove the credit overlay from small thumbnails** (dish banners,
winery thumbnails, small attraction thumbnails). Keep it on
showcase-sized photos: hero, day lead, chapter carousel, stay
carousel. The license obligations are met by the link existing in
the data file.

### Important: image paths must be **relative**

GitHub Pages serves at `/repo-name/`. `<img src="/images/foo.jpg">`
404s; `<img src="./images/foo.jpg">` resolves correctly under the
configured `base`. **Use `./images/...` everywhere in data files.**
This is the single most common dumb bug — guard against it with a
type check or a quick `rg '"/images'` before you commit.

---

## 10. Navigation deep links (Maps + Waze)

Drivers have a strong default app preference. Offer both, and make
each open in **active turn-by-turn mode** (not the preview screen):

```ts
// Google Maps — universal cross-platform URL, dir_action=navigate
// skips the preview and starts driving immediately.
export function googleMapsNavUrl([lat, lon]: [number, number]): string {
  return "https://www.google.com/maps/dir/?api=1"
       + `&destination=${lat},${lon}`
       + "&travelmode=driving"
       + "&dir_action=navigate";
}

// Waze — navigate=yes starts nav immediately
export function wazeNavUrl([lat, lon]: [number, number]): string {
  return `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`;
}
```

Render them as a tight `Maps · Waze` pair in a small `<NavigateLinks
coords={...} />` component. Use it everywhere — POI cards, map popups,
chapter detail pages. Different tints for the two (terracotta for
Maps, cyan `#33CCFF` for Waze) help your eye pick one.

Lucide doesn't ship a Waze icon — draw one inline as a tiny SVG of
the speech-bubble silhouette.

---

## 11. Geolocation ("you are here")

The single feature that turns the site from a "guide" into a "live
companion" during the trip.

```tsx
const [userLocation, setUserLocation] = useState<[number,number] | null>(null);
const hasAutoCentered = useRef(false);

useEffect(() => {
  if (!navigator.geolocation) return;
  const id = navigator.geolocation.watchPosition(
    pos => {
      const c: [number, number] = [pos.coords.latitude, pos.coords.longitude];
      setUserLocation(c);
      // Only fly to the dot the first time we see it inside Italy —
      // don't snap the map away from Tuscany when the user is still
      // pre-trip in Tel Aviv.
      if (!hasAutoCentered.current && isInItaly(c[0], c[1])) {
        hasAutoCentered.current = true;
        flyRef.current?.flyToCoords(c, 11);
      }
    },
    err => { /* silently ignore */ },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
  );
  return () => navigator.geolocation.clearWatch(id);
}, []);
```

Three rules that make this feel right:
- **`watchPosition`, not `getCurrentPosition`.** The marker should
  follow you as you drive across Tuscany.
- **Only auto-center inside the destination country.** Use a generous
  bounding box. Otherwise pre-trip taps yank the map to the user's
  home city.
- **Show but don't insist.** A pulsing blue dot with a popup
  ("You are here · LAT, LON"). A "Locate me" floating button so
  consent can be re-requested if denied.

The **pulse animation** lives in `index.css` as a global keyframes
(so the inline divIcon HTML can reference it). Add a
`prefers-reduced-motion` fallback that shows a static halo.

---

## 12. Content guidelines

Real, dense, opinionated content is what turns a website into a
keepsake. Some things we wish we'd written down sooner:

### Copy voice

- **Magazine, not marketing.** "A long-running family trattoria; pici
  with wild boar, grilled lamb, good house wine." — not "Don't miss
  this hidden gem!"
- **No periods at the end of titles or eyebrows.** They look heavy.
- **Italics in the serif** for kickers and italianized phrases —
  Cormorant Garamond italic is gorgeous.
- **No emoji unless the user asks.** Lucide icons cover everything.

### Per-day enrichment

For every day, include:
- **Italian word of the day** — the flashcard at the top.
- **Gear list** with `for: <activity-id>` references where applicable.
- **Day tips** — short bullets only, one or two sentences each.
- **Ride times** — populate `rideToNext` on activities with a
  meaningful drive ("45 min · winding mountain road"). Skip the
  trivial hops — the goal is to set the family's expectations, not
  catalog every 200 metres.
- **Restaurants for the day** — 2–4 ids from the services list.
  Curate by **the day's location**, not just region — a restaurant
  in southern Maremma is useless on a Lucca day.
- **Drink of the day** — one Italian drink (wine, cocktail, beer,
  aperitif, digestif, coffee) with a one-line "why tonight" pairing.
  Keep `name` and `type` universal across languages; localize only
  `pairing` and `servingNote`.

### Per-attraction enrichment

For every attraction:
- **Difficulty** — easy / moderate / challenging.
- **Insider tips** — short, unsentimental ("park down by the river,
  not at the church — €0 vs €4 and 3 minutes' walk").

### Global tips

Don't forget the cultural ones that make or break a trip:
- **August closures** — many family restaurants close for Ferragosto
  (mid-August). Worth surfacing as a yellow warning tip.
- **Crowds & timing** — go early or late, avoid the noon golden hours.
- **Riposo / siesta** — shops & kitchens closed midday in small
  villages.
- **Tipping etiquette** — Italians round up; service is included.

### Food & wine

A separate "Food & Wine" section with two subsections:
- **Signature dishes** — categorized (pasta, starter, main, dessert,
  snack), with `tryIt` field naming a real restaurant.
- **Wineries** — DOC/DOCG appellation, address, booking note. Project
  them onto the map under a `winery` category (off by default).

---

## 13. Mobile-first UX

A grab-bag of patterns that make the site feel native on a phone.

### Sticky chrome

- **Top navbar** — `position: fixed`, fades in a backdrop blur once
  you've scrolled past 16px. Stays LTR even in RTL.
- **Bottom nav** — 4 primary tab + a "More" overlay. Active tab
  detection by scrolling through `getElementById(...)?.offsetTop`.

### Tap targets

`min-h-11` (~44px) on every button. iOS HIG / Material both want
this; squeezing tap targets is the #1 reason buttons feel broken
on mobile.

### Horizontal-scrolling chip rows

Filter chips, region selectors, chapter ribbon — wrap them in a
horizontally-scrolling container with `overflow-x-auto`,
`scrollbar-hide`, and `min-w-max` so they never wrap on narrow
screens. Feels native.

### Floating action buttons

Two on the map (Fit-all + Locate). Always cream-on-blur, with a
hover-fill in the brand color. `z-[400]` to sit above Leaflet's
default chrome.

### CC chips on small thumbnails

Just remove them. The license info is in the data file; on a 140px
photo the credit is louder than the photo.

### Add to Home Screen / PWA install prompt

The site lives or dies by whether the family pins it to their home
screen. Don't make them hunt through Safari's share menu — surface
the prompt yourself:

1. **`public/manifest.webmanifest`** — name, short_name, theme color,
   background color, `display: "standalone"`, `start_url: "./"`,
   `scope: "./"`, plus an icon (the SVG favicon works fine for now).
2. **iOS-specific meta in `index.html`** — `apple-touch-icon`,
   `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`,
   `apple-mobile-web-app-title`. iOS Safari ignores the manifest for
   A2HS, so these are required.
3. **`src/lib/install.ts`** — a small `useInstallPrompt` hook that:
   - Detects platform: iOS Safari, iOS non-Safari (Chrome, FB browser),
     Android Chrome, other.
   - **Hard-gates on viewport width first.** This is the *primary*
     "is it desktop?" signal — UA strings and touch capability lie
     constantly (Cursor / Electron preview panes, Windows touch
     laptops, touchscreen monitors, "Request desktop site" mode all
     fool UA-based detection). A simple `window.innerWidth < 1024`
     check beats every heuristic. Listen to `resize` too — close the
     prompt if the user widens the window past the threshold.
   - Layered defense: also skip on `platform === "desktop-chromium"`
     (UA-based) and `!isLikelyMobile()` (coarse pointer + touch +
     viewport, all three). Belt and suspenders.
   - Skips standalone mode (`navigator.standalone` on iOS;
     `display-mode: standalone` media query elsewhere) — already
     installed.
   - Captures the `beforeinstallprompt` event (Android Chrome) so you
     can fire it from your own button.
   - Persists "Don't show again" + a 14-day snooze via `localStorage`.
   - Waits ~6 seconds before showing — let the page calm down first.
4. **`src/components/InstallPrompt.tsx`** — animated bottom-sheet
   with **platform-specific copy**:
   - **Android Chrome** → "Install" button that triggers the captured
     `beforeinstallprompt`.
   - **iOS Safari** → illustrated 2-step instructions: tap Share →
     tap "Add to Home Screen".
   - **iOS non-Safari** → "Open this page in Safari first" hint.

The prompt mounts at the root so it shows whether you're on the home
page or a chapter detail page.

---

## 14. Audio narration (pre-generated TTS)

A static site has no backend, so there's no safe place to keep an
ElevenLabs / OpenAI / Gemini API key at runtime — anything you ship
in the JS bundle is public. The trick: **pre-generate the audio
locally, commit MP3s as static assets, and stream them at runtime
with no key in sight.**

### When to use this pattern

- The text doesn't change often (place descriptions, intros).
- You want voice in the product without the runtime cost or risk.
- Total characters per refresh fit your TTS plan (~5K characters
  for ~15 attractions; well under most paid tiers).

### Pipeline

1. **Pick a voice.** ElevenLabs has a `shared-voices` library
   filterable by language. For an "Italian tour guide who speaks
   English", search `language=it&category=professional` and pick a
   warm, broadcast-tone male/female voice. Keep the `voice_id`.
2. **Author a generator script** that:
   - Reads your data files (here: regex over `attractions.ts` —
     fragile but fine for a controlled schema; for arbitrary code
     reach for `tsx` and import the TS module directly).
   - Calls the TTS endpoint with the description text.
   - Writes the MP3 to `public/audio/<topic>/<id>.mp3`.
   - Skips files that already exist unless `--force` is passed.
3. **Run it locally**, never in CI. The API key lives in your
   shell env (`$env:ELEVEN_API_KEY = "..."`) for the duration of
   the run only — it never enters the repo.
4. **Commit the MP3s** alongside the code. They're tiny (~300KB
   each at 128kbps) and serve straight off GitHub Pages.

### Voice settings that work for narration

```json
{
  "stability": 0.55,
  "similarity_boost": 0.85,
  "style": 0.35,
  "use_speaker_boost": true
}
```

`stability` too low → wobbly cadence; too high → flat. `style`
around `0.35` adds a guide-like lilt without going theatrical.

### Sanity-check the response

ElevenLabs returns JSON on errors but with a 2xx body looks like
audio bytes — easy to silently write a 158-byte error file as
`canyon-park.mp3`. Always check the first three bytes:

- `49 44 33` (`"ID3"`) → MP3 with ID3 metadata. ✅
- `FF Fx`            → raw MPEG sync. ✅
- anything else      → throw and surface the body.

### Two regex gotchas baked in by experience

1. **CRLF vs LF.** Normalize the file to LF before regexing or
   half your matches silently miss on Windows.
2. **Lazy match consumes the next start.** A pattern like
   `\n  \{([\s\S]*?)\n  \}` walks past the `\n` it needs to find
   the *next* `\n  {`. The fix: use a lookahead for the closing —
   `\n  \},?(?=\n)` — so the trailing newline stays available.
   Tell-tale sign: you extract every other item.

### Playback: a tiny audio bus

Multiple cards on a page each get their own `<audio>` element, but
without coordination two `Listen` taps layer voices. A trivial
module-level singleton fixes it:

```ts
let currentAudio: HTMLAudioElement | null = null;

function claimPlayback(audio: HTMLAudioElement) {
  if (currentAudio && currentAudio !== audio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  currentAudio = audio;
}
```

Each `ListenButton` calls `claimPlayback(this.audio)` before it
plays, and `releasePlayback(this.audio)` on `ended` / unmount.
Two clicks, one voice — always.

### Asset URL (Vite + GitHub Pages)

The deployed base is `/tuscany-2026/`, not `/`. Compose the audio
URL with `import.meta.env.BASE_URL` so the same code works in dev
and on Pages:

```ts
const url = `${import.meta.env.BASE_URL}audio/attractions/${id}.mp3`;
```

`BASE_URL` always ends in `/` per Vite contract — no slash-juggling.

### When NOT to pre-generate

- Generative chat replies (the words are different every time).
- Long-form audio that would explode the repo size.
- Per-user content.

For those you need a backend (Cloudflare Worker / Vercel Function)
that holds the TTS key as a secret and streams audio to the client.
That's the next step beyond static narration.

---

## 15. Routing & persistence

### Hash routing

A 30-line `useHashRoute()` hook is enough. URL `#chapter/3` →
ChapterDetailPage, no router library needed. Browser back/forward
work for free because hash changes go through `window.history`.

### Persistence

- `sessionStorage` — last-viewed chapter, so back from a chapter
  detail page lands you at the right ribbon position.
- `localStorage` — language preference, anything else "set once,
  stays set".
- `localStorage` (with TTL) — weather data, cached for 1 hour to
  keep Open-Meteo polite.

### Cross-component map control

A small React Context (`MapFocusContext`) lets any card, anywhere,
say "focus the map on POI X". The map registers the actual
implementation; cards just call `focusOn(id)`. No prop drilling.

---

## 16. SEO & social sharing

The site is personal but you'll share the link in a family WhatsApp,
maybe a status update. A nice link preview is worth 5 minutes:

```html
<!-- index.html -->
<meta property="og:title"       content="Tuscany 2026 — Horowitz × Racz × Kaplan" />
<meta property="og:description" content="A summer guide for our 10 days in Tuscany — plan, places, food, map." />
<meta property="og:image"       content="https://tikel1.github.io/tuscany-2026/og-cover.jpg" />
<meta property="og:url"         content="https://tikel1.github.io/tuscany-2026/" />
<meta name="twitter:card"       content="summary_large_image" />
```

Make `og-cover.jpg` 1200×630, gorgeous, and **lives inside `public/`**
so the path resolves under your GH Pages base.

---

## 17. Deployment (GitHub Pages)

### Vite config

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/your-repo-name/',
});
```

Without `base`, your assets resolve to `/assets/...` and 404 in
production. With it, **all data file references must be relative**
(`./images/foo.jpg`, not `/images/foo.jpg`). See gotchas below.

### Workflow

`.github/workflows/deploy.yml` — standard Vite → Pages actions,
nothing custom needed:

```yaml
name: Deploy
on:
  push: { branches: [main] }
  workflow_dispatch:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: ./dist }
  deploy:
    needs: build
    permissions: { pages: write, id-token: write }
    runs-on: ubuntu-latest
    environment: { name: github-pages }
    steps:
      - uses: actions/deploy-pages@v4
```

In the repo settings: **Pages → Source: GitHub Actions**.

---

## 18. Common gotchas

A list of things that bit us so they don't bite you.

### Asset paths

`/images/foo.jpg` works on `localhost` and silently 404s on GH Pages.
**Use `./images/foo.jpg`.** Grep for `"/images/` before every commit.

### Tailwind arbitrary values don't scale with `rem`

`text-[10px]` is hard-coded 10px; the mobile font-size bump won't
touch it. Add explicit `@media (max-width: 640px)` overrides for the
ones you use heavily, and use `data-compact-ui` to opt out specific
widgets.

### Wikipedia article 404s

Many specific Wikipedia articles you'd guess (`Bacchereto`,
`Schiacciata_alla_fiorentina`, `Villa_di_Artimino`) don't exist.
The fetch script should:
- Treat 404 as a soft fail (log + continue).
- Allow easy fallback chains in your TARGETS list:
  `wiki: "Schiacciata"` → `wiki: "Focaccia"` → placeholder.

### Two wineries, one image

Wikipedia article lead images are sometimes shared (the village's
church appears on both `Carmignano` and `Artimino`). After running
the fetch script, **eyeball the gallery** — it's faster than
deduping programmatically.

### Geolocation requires HTTPS

Localhost is fine; deployed must be HTTPS. GH Pages is HTTPS by
default, so this just works. If you add a custom domain, make sure
it serves HTTPS too.

### PowerShell vs bash

If you're on Windows, multi-line `git commit -m "$(cat <<EOF)..."`
heredocs don't work. Write the commit message to a temp file:

```pwsh
git add -A
git commit -F .git/COMMIT_MSG_TMP.txt
git push origin main
```

(Then delete the temp file. Don't commit `.git/COMMIT_MSG_TMP.txt`.)

### Backslashes in quoted paths

On Windows shells, never put backslashes inside quoted paths in
terminal commands — `\"` becomes an escape sequence and breaks things.
Use forward slashes (Git Bash and PowerShell both accept them) or
keep paths unquoted when possible.

### Map auth

Stamen Watercolor needs a Stadia account. CartoDB Voyager doesn't.
Default to keyless tiles unless you're sure you want the dependency.

### `toISOString().slice(0, 10)` lies in non-UTC timezones

Classic trap when picking "today's day" out of an itinerary keyed by
date. `new Date().toISOString()` is **always UTC**, so for users east
of UTC (Israel, Italy in summer, anywhere east of London after
midnight), `toISOString().slice(0, 10)` returns *yesterday's* date
for the first hours of the local day, and the hero shows the wrong
chapter.

Build the local-day string from the local components instead:

```ts
const y = today.getFullYear();
const m = String(today.getMonth() + 1).padStart(2, "0");
const d = String(today.getDate()).padStart(2, "0");
const localISO = `${y}-${m}-${d}`;
```

### Time labels positioned below an icon read as the next item

If you have a vertical timeline of activities and put the time label
*below* the icon (`position: absolute; bottom: -16px`), the label
floats into the gap before the next row and the eye attaches it to
the next icon. Inline the time in the activity's eyebrow line
instead — `01 · MORNING · WATER` — so it's structurally part of the
row it labels.

---

## 19. If you only do five things

Compressed, in priority order:

1. **Real verified data on day one.** Address, opening hours, phone,
   coords, website. Lorem ipsum dies hard.
2. **One typography pairing, one palette, one card surface.** Re-use
   them ruthlessly across every section.
3. **The plan / itinerary is the headline section** — magazine
   chapters, sticky chapter ribbon, "show the right day" logic.
4. **Map with custom markers, route polylines, filter chips, and a
   live "you are here" dot** that only auto-centers inside the
   destination country.
5. **Mobile-first chrome** — top navbar, bottom nav, FABs on the map,
   tap targets ≥ 44px, horizontal-scrolling chip rows everywhere.

Everything else — i18n, deep navigation links, food & wine,
checklists, geolocation pulses, sharing previews — adds love but
won't decide whether the site gets used. The five above will.

---

*Built for the Horowitz × Racz × Kaplan family Tuscany 2026 trip.
Steal the pattern, change the destination, have a great holiday.*
