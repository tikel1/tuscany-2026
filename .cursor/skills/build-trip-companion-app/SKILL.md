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
- **Booking confirmations** — order numbers, references/PINs, provider phones,
  addresses, meetup points + arrival times, what's included / to bring. These
  can be surfaced in-app as a **Tickets & Logistics** section, optionally behind
  a shared PIN (see *Sensitive info behind a shared PIN* below). Confirmations
  usually live in the traveller's email — read them there, don't retype from
  memory.

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

## Sensitive info behind a shared PIN (optional)

Trips accumulate real booking data — order numbers, GetYourGuide-style
reference + PIN pairs, prices, provider phones. Families want it handy in the
app, but this site is a **static app in a public GitHub repo**: everything it
renders also ships in the public source and JS bundle. A plain "enter PIN to
view" screen is therefore cosmetic — the data is still readable via View Source.

**The honest pattern (implemented in the reference repo):**

1. Author the sensitive packet as plaintext JSON **outside the repo** (a
   scratch dir), bilingual where the app is bilingual.
2. Encrypt it with the shared PIN — AES-256-GCM, key via PBKDF2-SHA256 — using a
   small offline Node step. Commit **only** the ciphertext
   (`src/data/bookings.enc.ts`). The plaintext and the PIN are never committed.
3. Decrypt client-side with the Web Crypto API when the PIN is entered
   (`src/lib/bookingsCrypto.ts`). Wrong PIN = GCM auth-tag failure = no data.
4. Gate **only the sensitive section**, not the whole site
   (`BookingsSection.tsx` renders an inline PIN prompt until unlocked; remember
   the unlock per device in `localStorage`). The rest of the trip stays open.

**State the security honestly to the user.** A short PIN (e.g. 4 digits) is
brute-forceable by anyone who grabs the ciphertext — this is casual privacy for
a family trip, not a vault. Its real value: the data is **not plaintext** in the
public repo/bundle (can't be grepped or indexed), and it's gated by a code you
share out-of-band. For anything whose exposure is genuinely harmful (a
credential that can *cancel* a booking), prefer leaving it out, or use a longer
PIN. Never publish booking reference + PIN pairs as plaintext on a public site.

**Surfacing it well (what makes it useful on the day):**

- **One shared unlock state.** Put the decrypted packet in a `BookingsProvider`
  context (`src/lib/bookingsStore.tsx`), not local component state — so the
  Tickets section, the day views, and any chips all read the same unlock, and a
  PIN entered anywhere reveals it everywhere (remembered per device).
- **Reach it from everywhere it's relevant:** a nav entry (desktop + mobile
  "More"), a per-day Tickets block on the day-detail view filtered by a
  `dayNumber` on each booking, and a small ticket chip on the itinerary day
  cards. Drive which days show a ticket with a tiny UNencrypted
  `BOOKED_DAY_NUMBERS` set (leaks only *that* a day has a booking, never detail).
- **Make the confirmation number a first-class thing:** store it as its own
  `bookingRef` field (separate from prose) and render it large, monospace, with
  a copy-to-clipboard button — that's what people scramble for at a counter. Keep
  a secondary `bookingPin` beside it.
- **Link each ticket to the attraction it's for** (`attractionId` → the POI's
  `website`/name) and show the **drive time + a directions link** to the meeting
  point, so the ticket answers "where, when, how do I get there, what's my
  number" in one card. Keep the itinerary day's `driveNotes` leading with the
  *first* drive to that meetup, since the day card shows the first segment.

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
- [ ] 6b. (Optional) Add the PIN-gated Tickets & Logistics section from real
         booking confirmations — encrypt the packet, commit ciphertext only
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
- **A password on a public static site is not real security.** Everything the
  app renders is in the public source + bundle. If you surface booking
  credentials, encrypt the packet and commit ciphertext only (never plaintext,
  never the PIN) — and tell the user plainly what a short PIN does and doesn't
  protect. See *Sensitive info behind a shared PIN*.

### Files to read first (in the cloned repo)

| Priority | Path | Why |
|---|---|---|
| 1 | `docs/HOW_TO_BUILD_A_VACATION_WEBSITE.md` | Full playbook — source of truth |
| 2 | `src/data/types.ts` | Shapes for days, POIs, stays, lists |
| 3 | `src/App.tsx` | Section order and composition |
| 4 | `src/lib/gemininio/persona.ts` | AI persona, party, trip facts |
| 5 | `src/components/Gemininio.tsx` | Live vs REST chat, history |
| 6 | `src/components/BookingsSection.tsx` + `src/lib/bookingsCrypto.ts` | PIN-gated, encrypted Tickets & Logistics section |

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
