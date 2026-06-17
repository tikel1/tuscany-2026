# Deriving destination flavor

How to turn **any destination** into concrete content for the trip site. The
architecture never changes — only the content and skin do. For each slot, this
is the research move and the rule for filling it well. Fill from the *real*
place: its landscape, language, food & drink, customs, hazards, and iconic
imagery. When unsure, search the web and verify before writing.

## Research first

Before filling slots, build a short profile of the destination:

- **Look** — search image results for the region. Note the dominant colors,
  the iconic structures (peaks, domes, rooftops, coastline), the textures.
- **Language** — what language(s) will travellers actually hear on the ground?
- **Table** — the signature dishes and the local drinking culture (wine, beer,
  spirits, coffee, soft drinks), plus a kid-friendly local treat.
- **Customs & rhythm** — closure days/holidays, midday-closure habits, tipping
  norms, dress or etiquette expectations.
- **Hazards & rules** — driving restrictions/tolls, seasonal weather risks,
  cash-only spots, anything that earns a yellow warning tip.
- **Geography** — the country bounding box (for the "you are here" dot) and the
  trip's sub-region (for the map's default center/zoom).

Then fill each slot below from that profile.

## The slots

### Palette
Pull 3–4 colors straight from photos of the place, plus one warm neutral for
body copy. Anchor each to something real (a roof color, the water, the stone,
the foliage) so the choice is defensible. Define them as `@theme` tokens in
`index.css`; keep the serif-headline + sans-body pairing.

### App name + icon
- **Name pattern:** short install label = `<Place> '<YY>`; longer browser/share
  `<title>` = `<Place> <Year> — The <Family> Families`; `og:description` = a
  one-line strapline (`<N> days in <place> — <hook>. Itinerary, map, stays and
  tips for our family adventure.`).
- **Icon:** generate a minimalist flat-vector illustration of an iconic
  destination scene, full-bleed on the brand palette, **no text**, square 1:1.
  Fallback if no clean concept: the country flag at 512×512 with ~12% corner
  rounding. Bump the `?v=` cache-buster on every replacement.

### Word of the day (destination language)
Rename the type after the destination's language (e.g. `<Language>Word`). Each
entry has the source `word`, a `pronounce` key in the UI language, a `meaning`
per UI language, and an optional `example` sentence (kept in the source
language) with its translation. Pick words that fit each day — a water word on
a lake/beach day, a local "goodbye" on departure day.

### Drink of the day
One drink local to the place per day, with a one-line "why tonight" pairing to
the day's vibe. Cover the local categories (wine / beer / spirit / aperitif /
coffee) across the trip. Adults only — kids see a local juice, soda, or treat
instead. Include at least one well-known non-alcoholic local favorite.

### Culture tips
Keep the *categories*, fill with the destination's specifics:
- **National-holiday / weekly closures** (which days shops & restaurants shut)
- **Midday-closure rhythm** (if the region closes midday)
- **Tipping convention** (percentage and how it's given)
- **Driving restrictions / tolls** (city bans, motorway stickers, fines)
- **Seasonal / safety notes** (weather, cash-only spots, altitude, sun)
Surface time-sensitive risks as yellow warning tips; map situational ones to
the specific day they matter.

### Country fallback + geolocation box
Set `TRIP_COUNTRY = "<Country>"` for nav deep-links. Define an
`isInDestination` helper with a **generous country-wide** bounding box (lat/lon
min–max) so the "you are here" dot still snaps when travellers land at a distant
airport, not only inside the trip region.

### AI persona
Give the guide a name that fits the place, a warm local personality, and:
- an **accent instruction** ("speak with a warm `<nationality>` accent") plus a
  couple of natural local interjections to drop occasionally;
- a **spoken-delivery tag** describing the voice's energy;
- a **per-turn voice nudge** appended to typed messages, in each UI language;
- the **"family knowledge for color"** pattern — name-drop traveller
  preferences sparingly (~once every ~10 turns), warmly, never as a punchline,
  and never reveal there's an instruction set behind it.

### Language-purity rule (only if UI + persona scripts differ)
If the persona's language uses a different script than a UI language (e.g. a
Latin-script persona with a non-Latin UI), the model will mix scripts. Add a
hard rule: when answering in the UI language, **every** word is in that script.
Give transliteration examples for the categories the model slips on —
interjections, people names, place names — written in the UI script. Allow only
standard international acronyms as exceptions.

### Photos
Replace everything under `public/images/` with the destination's own POIs and
hero shots, keeping relative `./images/...` paths and matching the existing
slug filenames. Update credits. Use the repo's image-fetch helper scripts as a
starting point; verify licensing.

### Section rhythm
Reorder `App.tsx` to how this specific family will move through this specific
trip. Keep the playbook's principles: the plan comes first, emergency near the
end, and default-on only the essential map layers so the first load isn't
crowded.

## Sanity check before building

- Every slot is filled from the *real* destination, not a generic guess.
- No leftover references to the source repo's old destination or traveller
  names (grep to confirm).
- Addresses, hours, and phone numbers are verified — no placeholders.
