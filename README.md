# Tuscany 2026 — Family Trip App

A static, mobile-first trip companion for the family Tuscany trip, **17 – 26 August 2026**. Itinerary, interactive map, attractions, stays, restaurants/supermarkets/gas stations, weather, food & wine, packing/booking checklists, an AI tour-guide chat (**Gemininio**), and pre-generated audio narration in EN/HE/IT. Built to be opened on the phone during the trip.

Deployed to GitHub Pages: **https://tikel1.github.io/tuscany-2026/**

For the full design rationale and the playbook for re-using this pattern on a new trip, see [`docs/HOW_TO_BUILD_A_VACATION_WEBSITE.md`](docs/HOW_TO_BUILD_A_VACATION_WEBSITE.md). It's the source of truth — keep both files honest when you change the code.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 (Tuscan palette: terracotta, olive, cream, sienna, gold)
- Cormorant Garamond + Inter (LTR), Frank Ruhl Libre + Rubik (RTL) — Google Fonts
- React Leaflet + CartoDB Voyager tiles (no API key)
- Open-Meteo for live weather (no API key)
- Lucide icons + Framer Motion for subtle animation
- Gemini Live API for the in-app chat assistant (Gemininio)
- Pre-generated TTS via Gemini Flash / Cloud Chirp 3 / ElevenLabs (scripts run locally only)

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # preview the production build locally
npm run lint     # ESLint flat config
```

`vite.config.ts` switches the `base` path between local dev (`/`) and the GitHub Pages deploy (`/tuscany-2026/`) automatically.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the keys you need. None of these are required to boot the site, but the AI chat and TTS scripts need them.

| Variable | Used by | Notes |
| --- | --- | --- |
| `VITE_GEMINI_API_KEY` | In-app Gemininio chat | Baked into the bundle at build time. Restrict by HTTP referrer in AI Studio. Leave blank to fall back to per-user pasted keys. |
| `GEMINI_API_KEY` | `npm run tts:*` scripts (local only) | **No `VITE_` prefix.** Defaults to Gemini Flash TTS for narration audio. Same key family as the one above; safe to reuse. |
| `ELEVEN_API_KEY` | `npm run tts:*:eleven` scripts | Optional — only needed when passing `--elevenlabs`. |
| `GOOGLE_APPLICATION_CREDENTIALS` | `npm run tts:* -- --google-chirp3` | Optional — Google Cloud service account for the Chirp 3 HD TTS fallback. |

## Updating content

All content lives in plain TypeScript files under `src/data/` — no CMS, no database. Edit the file, push to `main`, and GitHub Actions rebuilds and redeploys automatically.

| File | What's in it |
| --- | --- |
| `src/data/itinerary.ts` | The 10-day plan (`dayTips`, gear, drink/word of the day, etc.) |
| `src/data/attractions.ts` | All sights with description, coords, official link, image path |
| `src/data/stays.ts` | The two Tuscany stays + the Fiumicino airport hotel |
| `src/data/services.ts` | Restaurants, supermarkets, gas stations near each base |
| `src/data/dishes.ts` / `wineries.ts` | Food & wine catalog (own section + map layer) |
| `src/data/tips.ts` | Local know-how and warnings (ZTL, Saturnia, etc.) |
| `src/data/emergency.ts` | Emergency numbers, hospitals, embassy |
| `src/data/checklist.ts` | Pre-trip booking + packing checklists |
| `src/data/i18n/*.he.ts` | Partial Hebrew overlays for every English data module |
| `src/lib/dict.ts` | UI strings (brand, nav, sections, install, Gemininio) per language |
| `src/lib/tipsForDay.ts` | Maps which global `tips.ts` entries appear on which chapter detail page |
| `src/lib/gemininio/persona.ts` | AI guide persona, traveling party, trip facts, digests |

### Adding photos

Image fields point to `./images/<slug>.jpg`. Drop your own `.jpg` files into `public/images/` with matching names and they will appear automatically. Until then, each card shows a colour-coded fallback with the place name. Always use **relative** paths (`./images/...`, not `/images/...`) so they resolve correctly under the GH Pages base path.

## Helper scripts

`scripts/` holds local-only scripts for fetching photos and generating audio. Run from your machine, never from CI.

| Command | What it does |
| --- | --- |
| `node scripts/fetch-images.mjs` | Pulls POI/attraction images from Wikipedia / Commons / Unsplash. |
| `node scripts/fetch-hero-images.mjs` | Same idea, scoped to home-page hero shots. |
| `node scripts/fetch-food-wine-images.mjs` | Same idea, scoped to dishes + wineries. |
| `node scripts/find-hotel-images.mjs` | Helper to discover lead images for stays. |
| `npm run tts:italian-words` | Word-of-the-day MP3s in IT/EN/HE (Gemini Flash by default). |
| `npm run tts:italian-words:eleven` | Same, via ElevenLabs. Add `--examples-only` to rebuild just the example clips. |
| `npm run tts:attractions-he` | Hebrew narration for attractions (Gemini Flash by default; `:eleven` variant available). |
| `npm run repair:italian-words-audio` | Re-encodes any partially-truncated MP3 returned by a TTS provider. |
| `node scripts/smoke-test-gemini-live.mjs` | Opens a one-shot Live WebSocket to verify your Gemini key works. |

## Deploy (auto)

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`. To enable on a new fork:

1. Push the repo to `tikel1/tuscany-2026` (or whichever slug — update `vite.config.ts`'s prod `base` to match).
2. In **Settings → Pages**, set **Source = GitHub Actions**.
3. Add `VITE_GEMINI_API_KEY` as a repository secret if you want the chat enabled by default.
4. The first push triggers the workflow; the live URL appears in the Actions log.

## Project layout

```
src/
  components/      UI sections (Hero, Map, Itinerary, Stays, Gemininio, ...)
  data/            All trip content as typed TS data
    i18n/          Partial Hebrew overlays for every data module
  lib/             Helpers (i18n, dict, hash routing, install, swipe, audio bus)
    gemininio/     AI assistant — persona, Live WS, REST search, history, audio
  index.css        Tailwind + Tuscan design tokens
public/
  images/          Drop-in attraction & stay photos
  audio/           Pre-generated narration MP3s
  manifest.webmanifest, favicon.svg, og-cover.jpg
scripts/           Local-only image and audio generation scripts
docs/
  HOW_TO_BUILD_A_VACATION_WEBSITE.md   Full design playbook + new-trip guide
.github/workflows/
  deploy.yml       GitHub Pages CI
```

Buon viaggio.
