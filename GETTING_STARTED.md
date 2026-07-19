# Make your own trip companion app

This repo is a **template** for a personal, mobile-first travel companion
website — an itinerary, interactive map, attractions, stays, food & drink,
tips, packing/booking checklists, encrypted tickets, and an in-app AI tour
guide (with optional voice). It's built with Vite + React + TypeScript +
Tailwind and deploys free to GitHub Pages.

It ships with a guided **AI skill** that interviews you and builds your version
for you. You don't need to know the code.

## What you need

- **A GitHub account** — to host your own copy free on GitHub Pages.
- **An AI coding assistant** — Cursor or Claude Code work great (the skill lives
  at `.cursor/skills/build-trip-companion-app/`).
- **(Optional) a Google Gemini API key** — free at
  https://aistudio.google.com/apikey — for the in-app AI guide and voice.
  Without one, everything else still works.
- **Your trip info** — destination, dates, who's coming, stays, any booked
  tickets. Rough is fine.

## How to start (5 minutes)

1. **Clone it** (or "Use this template" on GitHub, then clone your copy):
   ```bash
   git clone https://github.com/tikel1/tuscany-2026.git my-trip
   cd my-trip
   npm install
   ```
2. **Open the folder in Cursor** (or Claude Code).
3. **Kick off the skill** — say:
   > Build my trip app using the `build-trip-companion-app` skill.

   It will interview you (destination, dates, travellers, languages, AI
   guide + keys, voice), **reset this reference to a blank trip so none of the
   original author's data carries over**, then rebuild it as yours.
   (Not using a skill-aware tool? Open
   `.cursor/skills/build-trip-companion-app/SKILL.md` and paste the
   "First message the user can paste" block at the bottom.)
4. **Deploy** — push to your `main`, set the repo's Pages source to "GitHub
   Actions", and your site goes live at `https://<you>.github.io/<repo>/`.

## Good to know

- **It resets first.** The build wipes the reference trip (family, bookings,
  content, photos) before rebuilding — nothing personal from the original
  author survives.
- **Keys are never committed.** The in-app chat key (`VITE_GEMINI_API_KEY`) goes
  in a GitHub Actions secret; the audio-script key (`GEMINI_API_KEY`) in a local
  `.env.local`. Restrict the chat key to your Pages domain.
- **Tickets are PIN-gated + encrypted**, but a short PIN on a public site is
  casual privacy, not a vault — the skill explains the trade-off.

## Where the detail lives

- `.cursor/skills/build-trip-companion-app/SKILL.md` — the guided build (start here).
- `.cursor/skills/build-trip-companion-app/deriving-destination-flavor.md` — how to
  turn any destination into content.
- `docs/HOW_TO_BUILD_A_VACATION_WEBSITE.md` — the full design playbook.

Buon viaggio.
