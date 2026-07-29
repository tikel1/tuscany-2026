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
**This step is mandatory and the reference's warm Tuscan tones (terracotta,
olive, sienna, cream) must not survive it.** Pull 3–4 colors straight from
photos of the place, plus one neutral for body copy — and let the destination
drive the temperature: alpine reads cool (pine, slate, glacier blue), coast
reads aqua/sand, desert reads ochre/clay. Anchor each to something real (a roof
color, the water, the stone, the foliage) so the choice is defensible.
Redefine the `@theme` tokens in `index.css` (the `--color-cream/terracotta/
olive/sienna/ink/gold`… family) so the *whole* app re-skins from one place;
keep the serif-headline + sans-body pairing. Gut check: open the built site —
if it still feels like Tuscany, you edited content but not the palette.

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

### Quiz host
Separate from the AI guide, the per-day kid quiz has its own host — in the
reference it's **"Quizzo"** with the Italian catchphrase "Allora!". That's
Tuscan flavor, not a fixed name: rename it to something that fits this place
and give it a local catchphrase. It appears in three files, all of which need
the new name/phrase: `src/lib/dict.ts` (every `quiz_*` string, in each UI
language), `src/lib/quiz/quizPersona.ts` (`getQuizzoIntro`/`getQuizzoOutro` and
the `quizzoPersonaEn`/`quizzoPersonaHe` system prompts), and
`src/lib/quiz/quizVoice.ts` (the voice-picker hint). Grep `Quizzo`/`quizzo`
afterward — no user-facing hit should remain.

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

**Hero and section headers earn extra care.** They're the full-bleed first
impression, so they need genuinely high-resolution, wide landscape photography
of the place — not thumbnails, logos, or portrait crops stretched to fit.
Low-res or badly-cropped header art is the single thing that makes an otherwise
solid build look cheap. Pick generous wide shots, well-lit, and check them at a
desktop width where they render largest.

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
- The palette, the quiz host, and the hero imagery all changed — none of them
  still reads as Tuscany.
- No section title asserts a count or geography that doesn't match this trip
  (e.g. "Two homes" when there's one base). Titles derive from the data.
