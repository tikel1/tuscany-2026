# Tuscany 2026 — Family Trip App

A static, mobile-first trip companion for the family Tuscany trip, **17 – 26 August 2026**. Itinerary, interactive map, attractions, stays, nearby restaurants/supermarkets/gas stations, weather, tips, and a packing/booking checklist. Built to be opened on the phone during the trip.

Deployed to GitHub Pages: **https://tikel1.github.io/tuscany-2026/**

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4 (Tuscan palette: terracotta, olive, cream, sienna)
- Cormorant Garamond + Inter (Google Fonts)
- React Leaflet + OpenStreetMap (no API key)
- Open-Meteo for live weather (no API key)
- Lucide icons + Framer Motion for subtle animation

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # preview the production build locally
```

## Updating content

All content lives in plain TypeScript files under `src/data/` — no CMS, no database. Edit the file, push to `main`, and GitHub Actions rebuilds and redeploys automatically.

| File | What's in it |
| --- | --- |
| `src/data/itinerary.ts` | The 10-day plan, North/South split |
| `src/data/attractions.ts` | All sights with description, coords, official link, image path |
| `src/data/stays.ts` | The two Tuscany stays + the Fiumicino airport hotel |
| `src/data/services.ts` | Restaurants, supermarkets, gas stations near each base |
| `src/data/tips.ts` | Local know-how and warnings (ZTL, Saturnia, etc.) |
| `src/data/emergency.ts` | Emergency numbers, hospitals, embassy |
| `src/data/checklist.ts` | Pre-trip booking + packing checklists |

### Adding photos

Image fields point to `./images/<slug>.jpg`. Drop your own `.jpg` files into `public/images/` with matching names and they will appear automatically. Until then, each card shows a colour-coded fallback with the place name.

## Deploy (auto)

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`. To enable:

1. Push the repo to `tikel1/tuscany-2026`.
2. In **Settings → Pages**, set **Source = GitHub Actions**.
3. The first push will trigger the workflow; the live URL appears in the Actions log.

## Project layout

```
src/
  components/      UI sections (Hero, Map, Itinerary, Stays, ...)
  data/            All trip content as typed TS data
  lib/             helpers (map context, nav links)
  index.css        Tailwind + Tuscan design tokens
public/
  images/          drop-in attraction & stay photos
  favicon.svg      custom Tuscan favicon
.github/workflows/
  deploy.yml       GitHub Pages CI
```

Buon viaggio.
