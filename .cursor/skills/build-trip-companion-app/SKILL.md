---
name: build-trip-companion-app
description: >-
  Build a personal, mobile-first family trip companion website by cloning this
  proven pattern (Vite + React + TypeScript + Tailwind, deployed to GitHub
  Pages) and refilling it for any destination. Use when the user wants to create
  a vacation / trip / itinerary website or app for a specific place, or asks to
  "make something like this trip site" for their own trip. Drives a discovery
  interview, derives the destination's flavor, then executes the build in
  dependency order.
disable-model-invocation: true
---

# Build a Trip Companion App

This skill clones a proven pattern — a static, mobile-first travel companion
website — and refills it for **any destination**. The reference build is a
multi-day family trip site with an itinerary, interactive map, attractions,
stays, local services, food & drink, tips, checklists, emergency info, an
in-app AI tour guide, and pre-generated audio narration. The output should
*look and feel the same* but carry the new destination's own flavor.

## Get the codebase first

This skill refills an existing codebase — it does not build from scratch. Before
anything else, clone the reference repo:

```bash
git clone https://github.com/tikel1/tuscany-2026.git <place>-<year>
cd <place>-<year>
npm install
```

Everything below assumes you are working inside that clone. The full design
rationale lives in its source-of-truth playbook:
`docs/HOW_TO_BUILD_A_VACATION_WEBSITE.md`. **Read it for depth** on the map
behavior, hero state machine, audio pipeline, i18n, and AI assistant. This skill
is the operating procedure: what to ask, how to derive the flavor, then what to
build, in order.

For the method of turning *any* destination into concrete content, see
[deriving-destination-flavor.md](deriving-destination-flavor.md).

## Step 0 — Run the discovery interview first

Do **not** start editing code until you have the answers below. Ask them up
front (group them, don't interrogate one at a time). If the user already gave
some in their request, only ask for the gaps. Reasonable defaults are noted —
offer them rather than blocking.

### Trip identity
- **Destination / region**
- **Country** (drives nav deep-links + the geolocation bounding box)
- **Dates** (local `YYYY-MM-DD` start → end; derive the number of days)
- **Travellers** (names; ages of kids if relevant — these add warmth to the AI guide)
- **Site languages** (e.g. English primary + a bilingual second-language UI; default: primary language only)
- **Destination language** for the "word of the day" (the language travellers will actually hear there)

### Logistics (gather as much as exists now)
- **Flights** — airports, rough times, record locators if useful
- **Ground transport** — rental car or trains; pickup/dropoff, company, caveats
- **Stays** — property names, towns, check-in/out
- **Hard bookings** — museums, cable cars, boats, guided tours with fixed times

### Tech / branding
- **GitHub repo slug** for Pages (e.g. `<place>-<year>`) — sets Vite `base`
- **Home-screen install label** — short nickname
- **Browser-tab / share title** — longer marketing-style line
- **AI tour-guide persona** — name, accent, personality (or accept a suggestion)
- **Gemini API key?** — whether they want the in-app AI chat enabled

### Scope confirmations
- Which sections matter most (reorder the home page to match the trip's rhythm)
- Where flights/paperwork live (in day-by-day itinerary vs. only in tips)
- Whether to ship pre-generated audio narration (optional, runs locally)

When the brackets are filled, restate the plan in one short paragraph and
confirm before building.

## Apply the destination's flavor

The architecture stays identical; only the *content and skin* change. Before
building, derive the destination's flavor for each slot below — research the
place (its landscape, language, food & drink, customs, hazards, iconic imagery)
and fill each slot from what you find. See
[deriving-destination-flavor.md](deriving-destination-flavor.md) for how to
research and fill each one well.

| Slot | What to derive from the destination |
|---|---|
| **Palette** | 3–4 colors pulled from photos of the place + one warm neutral. Defined as `@theme` tokens in `index.css`. |
| **App name + icon** | Manifest name, short name, `<title>`, OG/Twitter, favicon. Generate a minimalist destination illustration (or fall back to the country flag). |
| **Word of the day** | Rename the type after the destination language, refill words that fit each day. |
| **Drink of the day** | Pull from the local drinking culture; adults only, kids see a juice/treat. |
| **Culture tips** | Keep the *categories* (holiday closures, midday rhythm, tipping, driving rules/tolls) and fill with the destination's specifics. |
| **Country fallback + geolocation box** | `TRIP_COUNTRY` and the `isInDestination` bounding box for the "you are here" dot. |
| **AI persona** | Name, accent instruction, spoken-delivery tag, per-turn voice nudge, and a language-purity rule if UI + persona scripts differ. |
| **Photos** | Replace everything under `public/images/` with the new destination's POIs, keeping relative `./images/...` paths. |

## Build workflow (dependency order)

Work top to bottom — each step depends on the ones above. Track progress with a
todo list. This mirrors the playbook's master checklist; read the playbook
section it cites when a step needs depth.

```
Trip Companion build:
- [ ] 1. Clone github.com/tikel1/tuscany-2026; keep the Vite+React+Tailwind shell
- [ ] 2. Rename the shell (package, repo slug, vite base, Pages workflow,
         manifest, <title>, OG/Twitter, favicon/cover)
- [ ] 3. Set the trip clock (start/end constants; use LOCAL YYYY-MM-DD)
- [ ] 4. Refill typed data: types.ts, then itinerary, attractions, stays,
         services, tips, emergency, checklist (+ optional food/drink modules)
- [ ] 5. Add i18n overlays (src/data/i18n/*) + UI strings (src/lib/dict.ts)
- [ ] 6. Recompose sections in App.tsx to the trip's rhythm
- [ ] 7. Set map defaults (center, zoom, country filter, route, spokes)
- [ ] 8. Apply visual skin (palette tokens, fonts, icon, install metadata)
- [ ] 9. Rewrite the AI guide persona (src/lib/gemininio/persona.ts) + keys
- [ ] 10. (Optional) regenerate audio narration locally
- [ ] 11. Validate: npm install, npm run lint, npm run build, mobile pass
- [ ] 12. Deploy: push to main, Pages Source = GitHub Actions, verify URL + OG
```

### Key rules that bite if ignored

- **Asset paths are relative.** Reference everything under `public/` as
  `./images/...`, never root-absolute `/images/...`, so it resolves under the
  GitHub Pages `base` path. Set `vite.config.ts` `base: '/<repo-slug>/'`.
- **Use local dates for itinerary keys.** Never `toISOString().slice(0,10)` —
  it shifts the day across timezones.
- **No placeholders.** Verify every address, opening hour, and phone number.
  Lorem ipsum survives exactly until the trip starts.
- **Mobile first, always.** Test hero, chapter detail, map, language switch,
  install prompt, and chat at a phone viewport before shipping.
- **The plan comes first; emergency goes near the end** in the home-page order.
- **Two API keys, different prefixes.** In-app chat uses `VITE_GEMINI_API_KEY`
  (baked at build, restrict by HTTP referrer). Local TTS scripts use
  `GEMINI_API_KEY` (no `VITE_` prefix). Never commit either.

### Files to read first (in the cloned repo)

| Priority | Path | Why |
|---|---|---|
| 1 | `docs/HOW_TO_BUILD_A_VACATION_WEBSITE.md` | Full playbook — source of truth |
| 2 | `src/data/types.ts` | Shapes for days, POIs, stays, lists |
| 3 | `src/App.tsx` | Section order and composition |
| 4 | `src/lib/gemininio/persona.ts` | AI persona, party, trip facts |
| 5 | `src/components/Gemininio.tsx` | Live vs REST chat, history |

## First message the user can paste

When kicking off a new trip with this skill, this is the shape to fill:

```text
Build my family trip site from this trip-companion pattern (this skill).

TRIP
- Destination / region: [...]
- Country: [...]
- Dates (local): [YYYY-MM-DD] → [YYYY-MM-DD]
- Travellers: [names, ages of kids]
- Site languages: [e.g. primary + a bilingual second-language UI]
- Destination language (word of the day): [...]

LOGISTICS (as much as I have now)
- Flights: [airports, times]
- Car / trains: [pickup & dropoff, company, caveats]
- Stays: [property names, towns, check-in/out]
- Hard bookings: [museums, cable cars, tours]

TECH / BRAND
- GitHub repo slug: [e.g. <place>-<year>]
- Install label: [short nickname]
- AI guide persona: [name + accent, or suggest one]

Walk me through it in dependency order: repo/Vite base + dates first,
then data files, i18n, dict, branding, persona + keys, then deploy.
```

## Done means

- `npm run build` passes; mobile viewport pass is clean.
- Every reference to the source repo's old destination and traveller names is
  gone (grep the previous destination + traveller names to confirm).
- The live GitHub Pages URL loads under its `base` path, the share-link
  preview image renders, and the AI guide answers in the new persona.
