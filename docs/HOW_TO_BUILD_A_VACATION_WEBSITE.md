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

**Starting your next trip?** Open [§0 — AI-led onboarding](#0-next-trip-ai-led-onboarding): load this file into your assistant, paste the trip skeleton, and work the checklist in order (itinerary, stays, flights, **AI persona & party** [§15](#15-ai-assistant--persona--traveling-party), keys, deploy).

---

## Table of contents

0. [Next trip: AI-led onboarding](#0-next-trip-ai-led-onboarding)
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
15. [AI assistant — persona & traveling party](#15-ai-assistant--persona--traveling-party)
16. [AI tour guide — implementation (Gemini Live, no backend)](#16-ai-tour-guide--implementation-gemini-live-no-backend)
17. [Routing & persistence](#17-routing--persistence)
18. [SEO & social sharing](#18-seo--social-sharing)
19. [Deployment (GitHub Pages)](#19-deployment-github-pages)
20. [Common gotchas](#20-common-gotchas)
21. [If you only do five things](#21-if-you-only-do-five-things)

---

## 0. Next trip: AI-led onboarding

This section is the **fast path** for cloning the pattern to another
destination without re-discovering every decision buried in §§1–21.
Your workflow should be: **open this markdown in Cursor (or similar),
say where you are going, paste the skeleton below, and let the model
execute the checklist** — still grounded in the rest of this document
for depth (map behaviour, hero state machine, audio pipeline, etc.).

### Tomorrow morning execution checklist

Use this as the short runbook before diving into the detailed sections:

1. **Clone / fork the previous trip app** — start from the same
   Vite + React + Tailwind repo shape unless you have a reason to
   rebuild from scratch.
2. **Rename the project shell** — package name, repo slug,
   `vite.config.ts` `base`, GitHub Pages workflow, install label,
   manifest, `<title>`, OG/Twitter metadata, and favicon/cover assets.
3. **Replace trip identity** — destination, dates, traveler group,
   languages, countdown labels, hero copy, and every old destination /
   family reference found by grep.
4. **Fill the data source of truth** — update `src/data/types.ts` only
   if the new trip needs new fields, then work through `itinerary.ts`,
   `attractions.ts`, `stays.ts`, `services.ts`, `tips.ts`,
   `emergency.ts`, `checklist.ts`, and optional food / winery modules.
5. **Add translations and UI copy** — update `src/data/i18n/*`,
   `src/data/i18n/index.ts`, and `src/lib/dict.ts`; verify RTL layout
   if Hebrew or another RTL language is enabled.
6. **Refresh media** — replace photos under `public/images`, keep image
   paths relative (`./images/...`), update credits, generate `og-cover`,
   and optionally regenerate pre-built audio clips.
7. **Rewrite the AI guide** — replace `src/lib/gemininio/persona.ts`
   with the new destination persona, traveling party, trip facts, and
   tone rules; set `.env.local` / GitHub secrets if Gemini is enabled.
8. **Run validation locally** — `npm install` if dependencies changed,
   then `npm run lint`, `npm run build`, and a quick mobile viewport
   pass for hero, chapter detail, map, language switch, install prompt,
   and chat.
9. **Deploy and verify** — push to `main`, confirm Pages uses GitHub
   Actions, open the production URL, test asset loading under the repo
   base path, and check the shared-link preview image.

### First message you can paste (fill the brackets)

Use verbatim structure so the assistant knows what to ask next.

```text
I'm building the next family vacation site using the guide at
docs/HOW_TO_BUILD_A_VACATION_WEBSITE.md (same stack as tuscany-2026).

TRIP
- Destination / region: [e.g. Sicily, Hokkaido, Dolomites]
- Dates (local): [YYYY-MM-DD] → [YYYY-MM-DD]
- Travellers: [names, ages of kids if relevant]
- Site languages: [e.g. EN primary, HE bilingual UI]

LOGISTICS (as much as you have now)
- Flights: [airports, times, record locators if useful]
- Car / trains: [pickup & dropoff, company, caveats]
- Stays: [property names, towns, check-in/out]
- Hard bookings / tickets: [museums, boats, guides]

TECH
- GitHub repo slug (for Pages): [e.g. sicily-2027]
- Install / home-screen label I want: [short string, e.g. Sicily '27]

Walk me through updates in dependency order. Start with repo/Vite
base + trip dates, then data files, i18n, dict, branding, Gemininio
persona + keys, then deploy checks.
```

The assistant should **not** improvise away from the architecture
here—fork the repo or scaffold the same Vite+React+Tailwind shape,
then mutate data and copy.

### Master checklist (what "done" looks like)

Work top to bottom; each row depends on the ones above.

| # | Area | What to touch |
|---|------|----------------|
| 1 | **Vite / GitHub Pages** | `vite.config.ts` → `base: '/<repo>/'` matches the repo name. Every asset path under `public/` is referenced as `./…` from HTML/JSON, never root-absolute `/…` (see §20). |
| 2 | **Trip clock** | Trip start/end constants consumed by hero, chapter picker, stats (§5). Use **local** `YYYY-MM-DD` for "today" — never `toISOString().slice(0,10)` for itinerary keys (§20). |
| 3 | **Typed data (source of truth)** | `src/data/types.ts` first, then English modules: `itinerary.ts`, `attractions.ts`, `stays.ts`, `services.ts`, `tips.ts`, `emergency.ts`, `checklist.ts`, optional `dishes.ts` / `wineries.ts`. |
| 4 | **i18n overlays** | Parallel files under `src/data/i18n/` (`itinerary.he.ts`, `attractions.he.ts`, …) plus `i18n/index.ts` lookup wiring. |
| 5 | **UI strings** | `src/lib/dict.ts` — brand, nav, sections, install copy, Gemininio strings. Grep `brand_`, `nav_`, `gem_`, `install_` in the previous trip repo as a template list. |
| 6 | **Page composition** | `src/App.tsx` (and section components) — reorder sections to match the new trip's rhythm (§4). |
| 7 | **Map** | Defaults: centre, zoom, bounding behaviour, country filter for "you are here" (§6, §11). |
| 8 | **Install / PWA metadata** | `public/manifest.webmanifest` (`name`, `short_name`), `index.html` meta (`apple-mobile-web-app-title`, OG/Twitter). Short install label ≠ long `<title>` (e.g. **"Tuscany '26"** on the home-screen icon vs a longer browser-tab title). |
| 9 | **Gemininio** | **Persona & party:** §15 (`persona.ts`). **Keys, Live, REST:** §16. `.env.local` `VITE_GEMINI_API_KEY` + GitHub Actions secret; restrict key by **HTTP referrer** in AI Studio. |
| 10 | **Optional audio** | Pre-generated MP3s + scripts (§14) — run locally, never commit TTS secrets. Scripts read **`GEMINI_API_KEY`** (no `VITE_` prefix), separate from the in-app key. |
| 11 | **Deploy** | `.github/workflows/deploy.yml`; Pages **Source = GitHub Actions** (§19). |

### Where flights, car, and paperwork belong

There is no dedicated `flights.ts` in the reference project—spread
logistics across the structures readers already open:

- **Itinerary day 1 & last day** — airport ↔ car counter ↔ first/last
  stay, realistic times, toll / ZTL notes.
- **`tips.ts` / `checklist.ts`** — documents, insurance, "photograph
  the rental return form" class reminders.
- **`emergency.ts`** — roadside, consulate, insurer **phone** numbers.

Tell the assistant your preference: some families want every leg in
the day-by-day; others keep flights only in tips.

### Files the coding assistant should read first

| Priority | Path | Reason |
|----------|------|--------|
| 1 | `docs/HOW_TO_BUILD_A_VACATION_WEBSITE.md` | Full playbook (you are here). |
| 2 | `src/data/types.ts` | Shapes for days, POIs, stays, lists. |
| 3 | `src/App.tsx` | Section order and composition. |
| 4 | `src/lib/gemininio/persona.ts` | Persona + traveling party + digests ([§15](#15-ai-assistant--persona--traveling-party)). |
| 5 | `src/components/Gemininio.tsx` | Live vs REST, toggles, history ([§16](#16-ai-tour-guide--implementation-gemini-live-no-backend)). |

### Optional "session script" for the AI

Ask for numbered responses so you can stop between steps:

1. Confirm **repo slug**, **`vite.config.ts` `base`**, and **install
   short name** (manifest + `apple-mobile-web-app-title`).
2. Emit a **diff-style todo** mapping your rough itinerary → concrete
   `itinerary.ts` / `attractions.ts` edits.
3. List every **`dict.ts` key** that still mentions the old destination
   or family name.
4. Rewrite **`persona.ts`** per [§15](#15-ai-assistant--persona--traveling-party),
   then **Gemini key** setup ([§16](#16-ai-tour-guide--implementation-gemini-live-no-backend)):
   `.env.local`, GitHub secret, referrer allow-list, send a test message.
5. **Deploy dry-run**: `npm run build` locally, then push to `main`
   and verify Pages + OG image URL.

When something in the codebase disagrees with this guide, **the code
wins**—but then update this markdown in the same PR so the next trip
stays honest.

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
| Lint | **ESLint 9** (`eslint.config.js`, flat config) + TypeScript ESLint + `eslint-plugin-react-hooks` (React Compiler rules) + `eslint-plugin-react-refresh` | Run `npm run lint` locally before merging; keeps hooks valid and aligns with Vite Fast Refresh expectations. |

What we deliberately **didn't** add:
- A backend.
- A CMS.
- A state library (React `useState` + a small `MapFocusContext` was
  enough for ~5 cross-component interactions).
- A router library (a tiny `useHashRoute` hook handled `#chapter/N`).
- A **service worker** — we still ship a **Web App Manifest** + install
  UX (§13) for Add to Home Screen; we simply do not use a caching SW
  layer. Add Workbox later only if offline-first becomes a requirement.

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
7. **Good to know** — a single merged section that renders the day's
   own `dayTips` first and then any global `tips.ts` entries mapped to
   this chapter via `src/lib/tipsForDay.ts` (see below). Use the same
   detailed card style for both kinds so the section reads as one
   thing, not two.

Use `sessionStorage` to remember the last viewed chapter so the
browser back-button feels natural.

##### `src/lib/tipsForDay.ts` — per-chapter tip routing

Global trip tips live in `src/data/tips.ts` (ZTL warnings,
self-service fuel, water shoes, etc.) and render in the home page's
"Tips" section. Some of those tips are situational — they only matter
on a specific day — and you want them to surface inside that day's
"Good to know" block on the chapter detail page rather than buried in
the global list.

A tiny mapping does the routing without duplicating data:

```ts
// src/lib/tipsForDay.ts
const TIP_IDS_PER_DAY: Record<number, string[]> = {
  1: ["self-service-fuel"],
  8: ["ztl"],
  9: ["car-return-night-before"],
  /* days with no situational tips can be omitted or set to [] */
};

export function tipsForDay(dayNumber: number): Tip[] {
  const ids = TIP_IDS_PER_DAY[dayNumber] ?? [];
  return ids.map(id => tips.find(t => t.id === id)).filter(Boolean) as Tip[];
}
```

Two rules to keep this clean:

- **Don't double-source the same advice.** If `dayTips` on the day
  already says "wear closed-toe shoes for the cave hike", do not also
  map the global `water-shoes` tip into that chapter — readers will
  see two near-identical bullets and assume one is wrong.
- **The home page tips section still shows everything.** Mapping a tip
  to a day does not remove it from the global list; it adds an entry
  to that chapter's "Good to know". Use the global list for advice
  that's true across the trip; use day mapping for advice with a
  specific day attached.

When you start a new trip, audit `gear`, `dayTips`, and the global
`tips` list together for each chapter and prune duplicates before
mapping anything new.

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

### Language modules (`lang.ts` vs `i18n.tsx`)

Split responsibilities so **Vite Fast Refresh** and ESLint stay happy:

- **`src/lib/lang.ts`** — `Lang`, `Loc`, `loc()`, and static label maps
  (`LANG_LABELS`, `LANG_SHORT`). No React imports; safe to use from
  scripts, utilities, and `dict.ts`-like modules.
- **`src/lib/i18n.tsx`** — `LangProvider`, `useLang()`, and `useLoc()`
  only. Import `type { Lang }` from `./lang` in any file that only
  needs the type (e.g. `audioUrl.ts`, `persona.ts`).
- **`eslint.config.js`** turns off `react-refresh/only-export-components`
  for `i18n.tsx` only, because context files legitimately export hooks
  alongside the provider.

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

### Carousels: swipe on mobile, arrows on desktop

Hero photo carousel, chapter detail carousel, and the Italian Word of
the Day card all need horizontal swipe on phones — tapping a tiny
arrow with your thumb feels broken when the rest of the OS is
gesture-driven. Centralize the gesture in `src/lib/useCarouselSwipe.ts`
so every carousel behaves the same way:

```ts
const { swipeHandlers, swipeTouchAction } = useCarouselSwipe({
  onPrev: () => step(-1),
  onNext: () => step(+1),
  // Default: only active below 640px (Tailwind `sm`).
  // Pass maxWidthPx: 767 to enable on small tablets too.
});

<article {...swipeHandlers} style={{ touchAction: swipeTouchAction }}>
  …
</article>
```

Three details that make it feel right and not fight the page:

- **Capture-phase listeners** (`onTouchStartCapture` /
  `onTouchEndCapture` / `onTouchCancelCapture`) so a swipe that
  starts on a nested button or link still registers — bubble-phase
  listeners get eaten by interactive children.
- **Horizontal-dominance check** (`|dx| > |dy| * 1.15`) plus a
  ~48px threshold, so vertical scroll always wins ties and tiny
  finger jitter doesn't fire a swipe.
- **`touch-action: pan-y`** on the swipeable element so the browser
  still handles vertical scroll natively while we capture the
  horizontal axis. Without this, iOS sometimes hijacks the gesture
  and the page won't scroll while you're inside the carousel.

Ship the same hook for every carousel; consistency is the whole
point of a swipeable surface.

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

1. **`public/manifest.webmanifest`** — `name` + **`short_name`** (these
   are the **installed app label** on Android/desktop—pick something
   short like **"Tuscany '26"**, not the full marketing title), theme
   color, background color, `display: "standalone"`, `start_url: "./"`,
   `scope: "./"`, plus **PNG** icons (`192` + `512`, `purpose: "any
   maskable"` helps Android circular masks).
2. **iOS-specific meta in `index.html`** — `apple-touch-icon`,
   `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`,
   **`apple-mobile-web-app-title`** (must mirror the short install
   label—iOS ignores `manifest` for the home-screen name). Keep a
   longer `<title>` / OG title for browser tabs and link previews.
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

#### Manual re-trigger from a menu

The auto-open path respects "Don't show again" and a 14-day soft
snooze, which is the right default — but users change their mind.
A family member taps "Maybe later" two weeks before the trip, then
the night before flying actually wants the icon on their phone, and
hunts through your settings for it. Make sure they can find it.

The pattern: a tiny event bus inside `install.ts` instead of lifting
state into a React Context (which would force every consumer to wrap
with a provider for one button).

```ts
// install.ts
const FORCE_OPEN_EVENT = "tuscany:a2hs:force-open";

export function triggerInstallPrompt(): void {
  window.dispatchEvent(new Event(FORCE_OPEN_EVENT));
}

export function canShowInstallOption(): boolean {
  if (isStandalone()) return false;
  const p = detectPlatform();
  return p === "ios-safari" || p === "ios-other" || p === "android";
}

// inside useInstallPrompt():
useEffect(() => {
  const onForce = () => {
    if (isStandalone()) return; // already installed — nothing to offer
    setOpen(true);
  };
  window.addEventListener(FORCE_OPEN_EVENT, onForce);
  return () => window.removeEventListener(FORCE_OPEN_EVENT, onForce);
}, []);
```

Then in the More menu (or Navbar, or wherever):

```tsx
const [showInstall] = useState(() => canShowInstallOption());
// ...
{showInstall && (
  <button onClick={() => { closeMenu(); triggerInstallPrompt(); }}>
    {t("install_menu_label")}
  </button>
)}
```

Two non-obvious rules baked into this:

- **Manual trigger ignores snooze + never-show.** If they explicitly
  tapped "Install app", they want the prompt — past dismissals are
  irrelevant. The standalone gate stays, because there's nothing to
  install when you're already installed.
- **Hide the menu entry when there's nothing useful to show.** Don't
  let a user tap "Install app" and have nothing happen — gate the
  entry on `canShowInstallOption()` so it's hidden in standalone mode
  and on platforms where we have no install path (`other`,
  `desktop-chromium`).

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
3. **Run it locally**, never in CI. API keys live in `.env.local`
   (gitignored) or are exported into the shell for the duration of
   the run only — they never enter the repo or the browser bundle.
4. **Commit the MP3s** alongside the code. They're tiny (~300KB
   each at 128kbps) and serve straight off GitHub Pages.

> **Heads-up — script env vars are NOT prefixed with `VITE_`.** The
> in-app Gemini chat reads `VITE_GEMINI_API_KEY` (baked into the
> bundle). The TTS scripts read **`GEMINI_API_KEY`** (server-side
> only). Same key family, but the unprefixed one is what `npm run
> tts:*` looks for. If your script fails with "missing key" when
> `VITE_GEMINI_API_KEY` is set, that's why — set the unprefixed
> version too. `.env.example` documents both.

**Italian “word of the day” clips** (`npm run tts:italian-words`) default to
**Gemini 3.1 Flash TTS** (`GEMINI_API_KEY` in `.env.local` or the shell — same
key family as the in-app Gemini features). Model and prebuilt voice names are
configurable (`GEMINI_TTS_MODEL`, `GEMINI_TTS_VOICE_NAME`, per-language
`GEMINI_TTS_VOICE_IT` / `_EN` / `_HE`); see `scripts/fetch-italian-word-audio.mjs`.
For **legacy Cloud Chirp 3 HD** instead, pass **`--google-chirp3`** and use
`gcloud auth application-default login` or `GOOGLE_APPLICATION_CREDENTIALS`.
**`--elevenlabs`** (with `ELEVEN_API_KEY`) switches to ElevenLabs.

**Hebrew attraction narration** (`npm run tts:attractions-he`) also defaults to
Gemini Flash TTS (`scripts/fetch-attraction-audio-he.mjs`); tune with
`GEMINI_TTS_ATTRACTION_VOICE` or the shared `GEMINI_TTS_VOICE_HE` vars.
**`--google-chirp3`** uses Cloud Chirp3 (`GOOGLE_TTS_ATTRACTION_HE_VOICE` /
`GOOGLE_TTS_ATTRACTION_SPEAKING_RATE`). **`--elevenlabs`** uses ElevenLabs.

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

### `scripts/` index

A flat one-line cheat sheet so a new trip knows what's in the box
before re-implementing anything. All scripts are local-only (run from
your machine, never CI) and read API keys from `.env.local` or the
shell:

| Script | What it does |
|---|---|
| `fetch-images.mjs` | Pulls every POI/attraction image from Wikipedia / Commons / Unsplash to `public/images/`. Idempotent; skips files already on disk. |
| `fetch-hero-images.mjs` | Same idea, scoped to the home-page hero carousel set. |
| `fetch-food-wine-images.mjs` | Same idea, scoped to dishes + wineries. |
| `find-hotel-images.mjs` | Helper to discover a usable lead image for each stay (interactive — you eyeball results before committing). |
| `fetch-attraction-audio.mjs` | English narration MP3s for attractions (legacy ElevenLabs flow). |
| `fetch-attraction-audio-he.mjs` | Hebrew narration MP3s for attractions. Defaults to Gemini Flash TTS; `--google-chirp3` or `--elevenlabs` to switch backends. |
| `fetch-italian-word-audio.mjs` | "Word of the day" audio in IT/EN/HE per language. `--examples-only` rebuilds just the example sentence clips. |
| `repair-italian-word-mp3.mjs` | Re-encodes a malformed MP3 in place — useful when a TTS provider returns a partially-truncated file. |
| `smoke-test-gemini-live.mjs` | Opens a one-shot Live WebSocket against Gemini to confirm a key works before debugging the in-app flow. |
| `lib/gemini-tts.mjs`, `lib/google-tts.mjs` | Internal helpers shared by the audio scripts; not run directly. |

When porting to a new trip, the only scripts you usually run are
`fetch-images.mjs` (after the data files are filled), then
`fetch-italian-word-audio.mjs` and the attraction audio scripts if
you keep the audio feature. Everything else stays in the repo for
when you need it.

---

## 15. AI assistant — persona & traveling party

The difference between a **generic travel bot** and a **family guide**
is not the API — it is the **system prompt**: role, boundaries, who
is on the trip, and how much "colour" the model is allowed to use.
In **tuscany-2026** almost all of that lives in one file:
`src/lib/gemininio/persona.ts`. Wire-up (keys, WebSocket, REST,
globe toggle) is [§16](#16-ai-tour-guide--implementation-gemini-live-no-backend);
this section is **what to write** before you touch the socket code.

### Stack the layers in this order

`buildSystemPrompt(lang)` concatenates **fixed blocks** — order matters
because models obey constraints better when related rules sit together:

1. **Public persona** — `PERSONA_EN` or `PERSONA_FOR_HEBREW_RESPONSES`:
   who the assistant is (e.g. Italian tour guide for *these* families),
   **ABSOLUTE RULES** (1–3 sentences, no markdown, no preamble,
   reply language follows the user's message), plus **good vs bad**
   example replies. Keep it short; the model imitates examples more
   reliably than adjectives.
2. **Traveling party / private colour** — `FAMILY_PROFILES` (see below).
3. **Trip facts line** — dates, traveller sentence, car, bases (small
   `TRIP_FACTS` constant); then **digests** pulled from the same data
   modules as the website (`digestItinerary`, `digestAttractions`,
   `digestStays`, …) so the AI never drifts from the itinerary JSON.
4. **Live audio delivery** — `LIVE_SPOKEN_DELIVERY` steers native-audio
   tone (e.g. playful Italian-accented *delivery* while words stay in
   the user's language).
5. **Reply-language closing** — explicit "same language in / same out",
   UI-language default if ambiguous, and "not on our plan" behaviour.

Channel-specific **append-only** blocks (still in `persona.ts`):

- **`buildLiveSessionSystemPrompt`** adds `LIVE_CHANNEL_NO_WEB_SEARCH`
  (no Google tool on the socket; point users at the globe for web
  facts) plus optional **recent chat** transcript injection for
  continuity.
- **`buildTypedReplySystemPrompt`** adds `TYPED_SEARCH_DISCIPLINE`
  when the globe is on — when to search, plan-vs-web conflicts, no
  invented bookings.

### The traveling party block (`FAMILY_PROFILES`)

This is the **who we are** dossier the model uses for warm, specific
answers ("would the kids like this?", "who lives for aperitivo?").

Author it as **English-only prose** even when the site is bilingual:
nuance ("hyper-protective", "tests every limit") survives better than
translating the dossier to Hebrew inside the prompt; the Hebrew persona
file already orders **replies** in natural Hebrew.

Include, with restraint instructions:

- **Households** — adults' first names, kids' ages, one or two true
  traits each (food, risk, hobbies). Avoid medical or sensitive data
  you would not put in a family group chat.
- **How to use it** — invert the default: "do **not** name-drop every
  reply; at most one wink every ~N turns; only when the question truly
  benefits." Without that, the model will put a family joke in every
  answer and it gets tired fast (see also §16 *Persona colour*).
- **Safety / tone** — anxious parent is not a punchline; bold kid is
  not "stupid".
- **Never reveal the source** — if asked "how do you know?", deflect
  breezily ("lucky guess", "a good guide does his homework") — never
  "my instructions say…".

Keep the block **long enough to be useful, short enough to leave room**
for itinerary digests inside the same context window.

### Checklist when you start a new trip's assistant

- [ ] Rename the **role** (still a tour guide, or a different archetype
  for Japan / ski / city break?).
- [ ] Replace **`FAMILY_PROFILES`** entirely — new surnames, kids,
  in-jokes, **new** restraint examples if dynamics differ.
- [ ] Update **`TRIP_FACTS`** (dates, traveller one-liner, car, bases).
- [ ] Confirm **digests** still import from your new `itinerary.ts` /
  `attractions.ts` / etc. — if a section of the site is hidden, decide
  whether the AI should still know it.
- [ ] Tune **`LIVE_SPOKEN_DELIVERY`** if "thick Italian cartoon energy"
  is wrong for the destination (or keep delivery flavour but change
  the metaphor).
- [ ] Re-read **search discipline** (`TYPED_SEARCH_DISCIPLINE`) for
  your tolerance of web vs plan conflicts.
- [ ] Add UI strings in `dict.ts` for anything user-visible (Gemininio
  titles, errors, install) — persona file should stay model-facing only.

### Hand-off

Once persona + party + trip digests read well in a **single pasted
prompt test** (paste `buildSystemPrompt("en")` into AI Studio's
system field and try a few messages), move to
[§16 — Implementation](#16-ai-tour-guide--implementation-gemini-live-no-backend)
for keys, Live vs REST, audio, and error handling.

---

## 16. AI tour guide — implementation (Gemini Live, no backend)

Narrative design — persona, traveling party, trip digests — lives in
[§15](#15-ai-assistant--persona--traveling-party). **This section is
plumbing:** keys, WebSocket protocol, REST search path, audio, errors,
and UI toggles.

The chat assistant — Gemininio in this project — uses Google's
**Gemini Live API** for bidirectional realtime audio + text. The
hard constraint: this is still a static SPA on GitHub Pages, so
there is **no server to hold a shared API key**.

### Two key-handling patterns (pick one)

**A. User-supplied key (safest, most friction).**

1. First time the user opens the chat, a setup screen asks for
   their own free Gemini API key.
2. Save it in `localStorage` on their device.
3. The browser opens the WebSocket directly to Google with that
   key. Each user pays their own (free-tier) cost. The repo never
   sees a key.

Best when the site is open to the public and you don't want to be
on the hook for strangers' usage.

**B. Build-time env key (most convenient, leakable).**

1. Put the key in `.env.local` as `VITE_GEMINI_API_KEY=…` for
   local dev; `.env.local` is gitignored.
2. Add a GitHub Actions secret of the same name and inject it in
   the workflow's `Build` step:

   ```yaml
   - name: Build
     run: npm run build
     env:
       VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
   ```

3. Vite replaces `import.meta.env.VITE_GEMINI_API_KEY` with a
   string literal at build time. The key ships inside the
   minified bundle.
4. The setup screen never appears for visitors — the chat just
   works.

The catch: anyone who view-sources the deployed site can grep the
bundle for `AIza…` and steal your key. **Mitigate, don't ignore:**

- In AI Studio → API key → Application restrictions → HTTP
  referrers, allow only `https://yourname.github.io/your-repo/*`.
  Casual scrapers stop here. Determined attackers can spoof the
  referer, so don't put a paid key behind this without quotas.
- Set a hard daily quota cap on the key.
- Treat any key that's been pasted into a chat / commit / Slack
  as compromised — regenerate it.

**The implementation supports both.** The resolution order in
`storage.ts::getApiKey()` is:

1. localStorage entry (user paste) — wins if present, so a family
   member can override the default with their own account.
2. `import.meta.env.VITE_GEMINI_API_KEY` (build-time) — used when
   no override exists.
3. `null` — falls through to the setup screen.

The Settings panel hides the "Forget my key" button when there's
no localStorage override (otherwise the button would be a confusing
no-op against the build-time default).

### Panel height (~70vh), flex scroll chain, and pull-to-refresh

On mobile, a full-bleed bottom sheet that grows with content never
gives the inner message list a bounded height — `flex-1` children
default to `min-height: auto`, so they absorb all vertical space
and `overflow-y: auto` never scrolls; swipes then hit the document
and Chrome Android fires pull-to-refresh.

Fix pattern:

1. Cap the sheet: `h-[70dvh] max-h-[70dvh]` (70% of the dynamic
   viewport — leaves room to see the page behind it).
2. After the header, wrap settings/chat in `flex flex-1 min-h-0
   flex-col overflow-hidden` so the flex child can shrink below its
   content height.
3. Message list: `flex-1 min-h-0 overflow-y-auto` **plus** a small
   CSS helper (`.gem-chat-scroll`) with `-webkit-overflow-scrolling:
   touch`, `overscroll-behavior: contain`, and `touch-action: pan-y`.
4. While open: `overflow: hidden` on both `<html>` and `<body>`,
   `overscroll-behavior: contain` on `body`, and `overscroll-
   behavior: none` on `<html>` — restore all four on close.
5. Backdrop: `touch-none` so drags on the dimmed area do not scroll
   the page underneath.

### Globe: trip-only Live vs REST + Google Search

Live `bidiGenerateContent` is the wrong place to bolt on search
grounding for most accounts, so the UI exposes a **globe toggle**
(default **off**):

- **Globe OFF** — typed sends and the mic use **Gemini Live**
  (`gemini-3.1-flash-live-preview`, fallback `gemini-2.5-flash-native-audio-latest`).
  Trip context only; no `google_search` tool on the wire.
- **Globe ON** — typed sends use REST `generateContent` on
  `gemini-2.5-flash` (fallback `gemini-2.0-flash`) with optional
  `tools: [{ google_search: {} }]`. The **model** decides whether a
  search actually runs; the system prompt says to search only when
  fresh external facts would materially help, and that **our plan wins**
  if the web disagrees. Mic stays on Live (trip-grounded).

**Chat continuity across toggles:** REST requests include prior
completed turns in `contents` (`groundedSearch.ts`). Each new Live
`setup` appends a **recent transcript block** into the system
instruction (`chatHistory.ts` + `buildLiveSessionSystemPrompt`).
Toggling the globe **closes** the Live socket so the next Live session
rebuilds setup with anything that happened on the REST path—no more
silent context loss mid-trip.

### User-visible errors (family-friendly)

Do **not** stream raw API or WebSocket errors into the chat bubble.
Pattern: generate a short numeric **reference code**, `console.error`
the real payload tagged with that code, and show a single translated
line ("something went wrong, try later, ref #______"). Same string in
the status bar when `status === "error"`. (`logUserFacingError.ts`.)

`.env.example` lives in the repo as a documentation-only file
that teaches new clones which variables exist. Real values go in
`.env.local`, which `.gitignore` blocks via both `*.local` and an
explicit `.env.*` rule (defense in depth).

### Why Gemini Live, not REST + ElevenLabs?

- **One vendor, one bill, one key.** Live handles streaming text
  AND audio output natively. No separate TTS contract for the live
  replies (the pre-generated narration in §14 is a separate use
  case where ElevenLabs is fine).
- **Realtime bidi.** Push 16 kHz mic PCM up; receive 24 kHz voice
  PCM down. Latency ~500–800 ms feels conversational.
- **Free tier.** Gemini 2.5 Flash native-audio is generous enough
  for a 10-day family trip.
- **Built-in input transcription.** Gemini does ASR on the audio
  you send it and sends back the transcript — no extra Whisper.

### The protocol in 30 seconds

It's WebSocket + JSON envelopes:

1. Connect to `wss://generativelanguage.googleapis.com/ws/…BidiGenerateContent?key=API_KEY`.
2. Send `{ setup: { model, system_instruction, generation_config: { response_modalities, speech_config: { voice_config, language_code } }, input_audio_transcription, output_audio_transcription } }`.
3. Wait for `{ setupComplete: {} }`.
4. Stream user audio: `{ realtime_input: { media_chunks: [{ mime_type: "audio/pcm;rate=16000", data: "<base64>" }] } }`.
5. Or send text: `{ client_content: { turns: [{ role: "user", parts: [{ text: "..." }] }], turn_complete: true } }`.
6. Receive interleaved `{ serverContent: { inputTranscription, outputTranscription, modelTurn: { parts: [{ text }, { inlineData: { mimeType, data } }] }, turnComplete } }`.

### Browser audio plumbing (the part nobody warns you about)

- **Sample rate mismatch.** Browser mic defaults to 44.1 / 48 kHz;
  Gemini wants 16 kHz. Resample on the way out (linear-interp is
  fine for speech). The OUTPUT side is easier — create the
  `AudioContext` with `{ sampleRate: 24000 }` so the model's
  audio plays without resampling.
- **PCM ↔ Float32.** Float32 [-1, 1] → Int16 LE bytes for upload;
  Int16 LE bytes → Float32 for playback (`Math.max(-1, Math.min(1, x))`
  before scaling, or you'll click).
- **base64 chunking.** `btoa()` chokes on bytes outside Latin-1 and
  blows the stack on big buffers. Encode in 32 KB chunks.
- **Seamless playback.** Don't `new Audio()` per chunk — that gives
  you a stuttering robot. Schedule each PCM chunk on a Web Audio
  `AudioBufferSourceNode` with a running `playTime` cursor. When
  the tab was backgrounded, resync `playTime = ctx.currentTime`
  before scheduling the next one.
- **ScriptProcessorNode is "deprecated"** but works fine for low-
  rate speech; `AudioWorklet` is the modern path but needs a
  separate worklet file. Pick your battles.
- **Push-to-talk beats VAD** for predictability — voice-activity
  detection on the server is good but can clip the start of a
  sentence on a quiet sigh.

### Persona + system prompt: ground it in the trip data

The trick that makes Gemininio actually useful (vs a generic AI
chatbot) is feeding **the entire trip data as the system prompt**:
itinerary, attractions, stays, services, food. ~25K tokens —
trivial for Gemini's 1M context. Now when the family asks "what
should we do tomorrow?" he answers from the actual plan, not from
hallucinated travel-brochure prose.

Build the prompt **at session-open time** so any itinerary edit
applied since the last chat is immediately known. Don't cache it.
Append the **recent chat transcript** into the Live system text when
opening a new socket (see §0 / globe toggle) so reconnects stay aligned
with the on-screen history.

For an Italian-tour-guide voice:
- Pick a warm prebuilt voice (`Charon` worked best for our taste).
- Set `language_code: "en-US"` (or `"he-IL"`) on the speech config.
- In the system prompt, instruct the model to "speak with a warm
  Italian accent" and to "drop occasional Italian interjections".
  Prompt-driven accent is imperfect but the model leans into it.

### Lifecycle: lazy connect, eager disconnect

- Don't open the WebSocket on `useEffect` mount. Open on the first
  user message.
- Close on panel-close to free the socket and stop the user's
  free-tier minutes from quietly draining.
- Keep an `isOpen()` getter so subsequent sends in the same
  session reuse the socket instead of reopening.

### Default to muted; mute client-side (TEXT modality is broken)

Voice replies are louder than people expect, and most chat-bot
usage in practice is read-and-tap, not listen. Default
`audioEnabled` to `false` and surface a small speaker toggle in
the header. Persist the preference in `localStorage`.

**The seductive idea that does not work today:** "I'll switch
`responseModalities` between `["TEXT"]` (muted) and `["AUDIO"]`
(unmuted) so the server doesn't synthesize audio at all when
muted." Lovely in theory, dead in practice — as of writing,
every `bidiGenerateContent` model on the v1beta endpoint rejects
TEXT modality:

- `gemini-2.5-flash-native-audio-*` → 1007 *"Cannot extract
  voices from a non-audio request"* (these are audio-out only).
- `gemini-3.1-flash-live-preview` → 1011 *"Internal error
  encountered"* even with a minimal payload (TEXT is documented
  as supported but currently broken).
- `gemini-live-2.5-flash-preview` and `gemini-2.0-flash-live-001`
  were retired on 2025-12-09 — they return 1008 *"model not
  found"*. Don't put them in your fallback list.

**What actually works.** Always open the WebSocket in AUDIO
modality, and gate the `onAudio` callback client-side on the
`audioEnabled` flag. Drop the bytes on the floor when muted; the
text reply arrives just fine through `outputTranscription` either
way. Mic input also still works — voice in, text-on-screen out.

Two implementation gotchas:

1. **Closure staleness on the toggle.** The `onAudio` callback is
   created when the session is opened and closes over whatever
   `audioEnabled` value existed at that moment. A later toggle
   does nothing unless you read from a `useRef` that you keep in
   sync via a `useEffect`. Use the ref inside the callback,
   never the state directly.
2. **Stop playback when muting.** Just flipping the flag means
   anything currently in the `PcmPlayer` queue will keep playing
   for another ~5 seconds. Call `playerRef.current?.stop()`
   immediately on mute so the toggle feels instant.

Trade-off you're making: server still synthesizes audio when
muted, so you pay the audio quota cost regardless. For a personal
trip site this is fine; for a public app you'd want a real backend
that proxies a TEXT-modality model (which works fine on the REST
`generateContent` endpoint — just not on Live).

### Live API model graveyard (as of writing)

The Live model lineup churns fast. Anything you read in a tutorial
older than three months is probably wrong. Current state:

- ✓ `gemini-3.1-flash-live-preview` — primary, AUDIO works,
  TEXT broken (1011)
- ✓ `gemini-2.5-flash-native-audio-latest` — audio-out only,
  good fallback
- ✓ `gemini-2.5-flash-native-audio-preview-09-2025` / `-12-2025`
  — also audio-out only, dated previews of the above
- ✗ `gemini-live-2.5-flash-preview` — RETIRED 2025-12-09
- ✗ `gemini-2.0-flash-live-001` — RETIRED 2025-12-09

When in doubt, hit
`GET /v1beta/models?key=…` and grep for `bidiGenerateContent` in
`supportedGenerationMethods` to see what your account actually
has access to today.

Also: when `setupComplete` doesn't arrive and the socket closes,
the WebSocket close event has both a `code` and a `reason`. The
reason carries the actionable detail (*"thinking_config is not
supported"*, *"Cannot extract voices from a non-audio request"*).
Log **code + reason + model id** verbosely for developers; keep the
**family-facing** copy generic (see "User-visible errors" above).

### Model fallback

`LiveSession.connect()` tries **`gemini-3.1-flash-live-preview`**
first, then on setup failure retries once with
**`gemini-2.5-flash-native-audio-latest`**. Do not reference retired
Live ids (`gemini-live-2.5-flash-preview`, `gemini-2.0-flash-live-001`)
—they return 1008 *model not found*.

### When this pattern stops working

- You want a single shared API key (privacy / business).
- You want server-side guardrails or logging.
- Free tier isn't enough.

For all three: stand up a Cloudflare Worker that proxies the same
WebSocket protocol with the key as a secret. The browser code
barely changes — same JSON envelopes.

### Killing the chain-of-thought leak

Gemini 2.5's "thinking" models love to narrate their reasoning into
the response stream. Out of the box you'll get bubbles like:

> **Assessing Itinerary Deviation** I have determined that the
> Colosseum visit represents a substantial deviation from the
> direct route north to Larciano…

Three layers of defense (mix and match by channel):

1. **Setup-time (REST only):** `thinking_config.thinking_budget = 0` on
   `generateContent` can suppress thinking leakage where the API
   accepts it. **Do not blindly send this on Gemini Live** — current
   `gemini-3.1-flash-live-preview` setup rejected `thinking_config`
   with a policy / 1008-style failure; Live relies on the client
   filters below instead.
2. **Client filter:** preview models sometimes still emit parts tagged
   `thought: true`. Skip them in the WebSocket / REST message handler.
3. **Don't double-source for AUDIO sessions.** When response
   modality is `AUDIO`, the canonical visible text is
   `outputTranscription` (the ASR'd version of what the voice is
   saying). The `modelTurn.parts[].text` you also receive is
   usually internal scratch. Pick one source per modality:
   - AUDIO: use `outputTranscription`, ignore `modelTurn.text`.
   - TEXT: use `modelTurn.text`, there is no `outputTranscription`.

### Persona discipline > prompt verbosity

*High-level persona layering is in [§15](#15-ai-assistant--persona--traveling-party);
below is what we learned from iteration once the plumbing existed.*

The first version of Gemininio's persona was 12 paragraphs of
"warm, knowledgeable, slightly poetic Italian guide" prose. The
model dutifully wrote five-paragraph answers full of preamble.

What actually worked:

- A short list of **ABSOLUTE RULES** ("1–3 sentences. NEVER more.").
- Concrete **good** and **bad** examples baked into the prompt.
  The model imitates structure better than it follows adjectives.
- A separate paragraph of voice / personality, kept terse.
- An explicit "never say `my response will…`, `let me think…`,
  `assessing…`" — calling out the exact filler phrases stops them.

### Persona colour: restraint is the actual instruction

The first pass at the FAMILY_PROFILES block said "name-drop freely
whenever it fits". The model interpreted that as "name-drop in
every reply", and within ten messages every answer had a Marina
joke. Fun for two minutes; exhausting for the trip.

What actually worked: **invert the default**. The new instruction
is structured around restraint:

- "DEFAULT to no family reference."
- "AT MOST one family wink every ~10 turns."
- "If you're searching for a way to fit a name in, you've already
  lost — answer the question and move on."
- A list of question shapes that *do* earn a wink ("Which wine
  would they love?", "Anything to watch out for on this trail?")
  vs. shapes that don't ("What's the drive time to Florence?").

You can't make the model count past turns reliably, but reframing
the rule as "don't, except when X / Y / Z" produces a much
sparser, much funnier output than "do whenever it fits". Same
applies to any "fun colour" prompt: the LLM defaults to "always
fun" unless you defaults-flip it.

### Language purity in non-Latin scripts

Italian persona + Hebrew user = a model that happily mixes
"Allora!" (Latin) with "סָטוּרְנְיָה פתוח 24/7" (Hebrew) inside
one sentence. Looks broken. The fix is a hard rule, with explicit
transliteration examples for the categories the model actually
slips on:

```
שפה אחידה — חוק קשיח. כשהתשובה בעברית, כל המילים בעברית. זה כולל:
  • קריאות איטלקיות → "אללוֹרָה", "ממה מיה", "דאי", "אקו"
    (לא "Allora", לא "Mamma mia").
  • שמות אנשים → "ג׳ני", "מייק", "מרינה", "נועם" (לא "Jenny").
  • שמות מקומות → "סָטוּרְנְיָה", "פִּיֶנְצָה", "פירנצה",
    "לוּקה" (לא "Saturnia", לא "Florence").
חריג יחיד: ראשי תיבות בינלאומיים סטנדרטיים כמו FCO. אסור
לערבב כתבים באותו משפט מעבר לכך.
```

Three pieces are doing the work:

- **The categories**: the model needs to be told *which kinds*
  of words it might leave in Latin (interjections, names of
  people, place names) — generic "use Hebrew" doesn't catch
  these cases because the model considers them already-localised.
- **Worked transliterations** of the exact words in your data,
  not invented ones. The model copies what it sees.
- **One explicit exception** (`FCO`) so the model doesn't
  overcorrect and try to write "אף-סי-או".

Mirror the rule in the English persona too, just with the polarity
flipped ("don't mix Hebrew script into an English reply") — the
model is otherwise prone to throwing in a stray word in the
"other" script when it remembers something from the system prompt.

### Typing animation

Streaming text already arrives in chunks, but there's a 0.5–2 s
gap between "user pressed send" and "first token lands". An empty
bubble during that gap looks broken. Fix:

1. The instant the user sends, push BOTH the user message AND a
   placeholder `{ role: "model", text: "", streaming: true }` into
   the message list. Atomically — same `setMessages` call — so
   they appear together.
2. Render rules in the bubble component:
   - `streaming && !text` → three bouncing CSS-animated dots.
   - `streaming && text` → text + a blinking caret at the end.
   - `!streaming` → text only.
3. On `turnComplete`, walk the list and flip `streaming: false`
   on every model bubble. On `onError`, ALSO strip any empty
   placeholder so users don't see eternal dots after a connection
   failure.

The same trick applies to the voice flow — drop the placeholder
in `stopMic()` so the dots show up the moment they release the
mic, then `outputTranscription` flows into the same bubble.

### Pull-to-refresh hijacks scroll inside fixed bottom-sheets

The very first mobile test of the chat panel had a maddening bug:
swipe down inside the message list and the whole page refreshed
instead of scrolling. The chat is a fixed-position bottom-sheet,
the body is technically still scrollable underneath, and Chrome
Android happily routed the gesture to the body's pull-to-refresh.

Two-layer fix that any modal / bottom-sheet on mobile needs:

1. **`overscroll-behavior: contain`** on every internal scroll
   container (chat list, setup view, settings view). This stops
   a scroll that hits a top/bottom extreme from chaining up to
   the body — no chain, no pull-to-refresh.

   ```tsx
   <div className="flex-1 overflow-y-auto overscroll-contain ...">
   ```

2. **Lock body scroll while the panel is open.** Belt-and-suspenders
   for iOS Safari (which sometimes routes touches to the body even
   when a fixed element is on top) and for the case where the user
   touches the panel's background area, not a scroll container:

   ```tsx
   useEffect(() => {
     if (status === "closed") return;
     const prevHtml = document.documentElement.style.overflow;
     const prevBody = document.body.style.overflow;
     const prevOverscroll = document.body.style.overscrollBehavior;
     document.documentElement.style.overflow = "hidden";
     document.body.style.overflow = "hidden";
     document.body.style.overscrollBehavior = "contain";
     return () => {
       document.documentElement.style.overflow = prevHtml;
       document.body.style.overflow = prevBody;
       document.body.style.overscrollBehavior = prevOverscroll;
     };
   }, [status]);
   ```

   Stash and restore the previous values on cleanup — never
   hard-code `""` back, because something else might legitimately
   want `hidden` (a parent modal, a dev-tool, etc.).

This combo also stops "rubber-banding" on iOS where the page
jiggles behind your modal as you drag — the whole thing now feels
like a native sheet.

### Chat bubble corners: logical, not physical

Chat bubbles classically have three rounded corners and one sharp
"tail" corner pointing toward the speaker's side. Tailwind has
both physical (`rounded-br-md`, "bottom-right") and logical
(`rounded-ee-md`, "end-end") classes, and the difference is
invisible until the page flips to RTL.

CSS flexbox already does the right thing with `justify-end` /
`justify-start` — in a `dir="rtl"` parent they swap visual
sides automatically. So the user bubble that lived on the right
in English now sits on the LEFT in Hebrew. But its *sharp
corner*, locked in with `rounded-br-md`, stays on the bottom-
**right** physically — i.e. on the wrong side of the bubble.

Logical radius classes fix this in one swap:

| Bubble | Was (physical)   | Now (logical)     | LTR result    | RTL result   |
| ------ | ---------------- | ----------------- | ------------- | ------------ |
| User   | `rounded-br-md`  | `rounded-ee-md`   | bottom-right  | bottom-left  |
| Model  | `rounded-bl-md`  | `rounded-es-md`   | bottom-left   | bottom-right |

Same trick for any margin/padding that should follow the writing
direction (`ms-*` / `me-*` instead of `ml-*` / `mr-*`). Bake the
habit in early — chasing down physical-vs-logical bugs after the
fact is tedious because nothing breaks loudly, it just looks a
bit "off".

---

## 17. Routing & persistence

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

## 18. SEO & social sharing

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

## 19. Deployment (GitHub Pages)

### Vite config

The base path differs between local dev and production: GH Pages
serves under `/<repo>/`, but `npm run dev` only opens at the root
(`http://localhost:5173/`). Hard-coding `base: '/<repo>/'` makes the
local dev URL 404 — the asset graph is rewritten with the repo prefix
that doesn't exist on `localhost`. Switch on the Vite `command`:

```ts
// vite.config.ts
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // GH Pages needs `/your-repo-name/`; local dev uses `/` so opening
  // http://localhost:5173/ works the way Vite users expect.
  base: command === "serve" ? "/" : "/your-repo-name/",
}));
```

Without `base`, your production assets resolve to `/assets/...` and
404 on Pages. With it, **all data file references must be relative**
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

## 20. Common gotchas

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

## 21. If you only do five things

Compressed, in priority order:

0. **For trip #2+:** load [§0](#0-next-trip-ai-led-onboarding) into your
   assistant first—paste destination, dates, flights, stays, repo slug,
   and let it drive the checklist so you do not miss keys, `base`, or
   manifest renames.
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
checklists, geolocation pulses, sharing previews, Gemininio ([§15](#15-ai-assistant--persona--traveling-party) + [§16](#16-ai-tour-guide--implementation-gemini-live-no-backend)) —
adds love but won't decide whether the site gets used. Items 1–5 above will.

---

*Born on the Horowitz × Racz × Kaplan Tuscany 2026 build; §0 exists so
your next destination ships faster—steal the pattern, update this file
when the code moves ahead of the prose, have a great holiday.*
