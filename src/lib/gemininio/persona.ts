/**
 * Gemininio's persona + the system prompt that grounds him in the
 * actual trip data. Built on demand from the static data files so any
 * itinerary edit immediately changes what Gemininio knows — no second
 * source of truth, no drift between the website and the assistant.
 */

import { itinerary } from "../../data/itinerary";
import { attractions } from "../../data/attractions";
import { stays } from "../../data/stays";
import { services } from "../../data/services";
import { dishes } from "../../data/dishes";
import { wineries } from "../../data/wineries";

import { localizeDay, localizePoi, localizeStay, localizeService, localizeDish, localizeWinery } from "../../data/i18n";
import type { Lang } from "../i18n";

/* ------------------------------------------------------------------ */
/* Trip facts (kept here so the persona can quote them precisely)      */
/* ------------------------------------------------------------------ */

const TRIP_FACTS = {
  startDate: "2026-08-17",
  endDate: "2026-08-26",
  travellers: "Three families travelling together: Horowitz, Racz, Kaplan",
  cars: "1 rental car picked up at Rome Fiumicino (FCO)",
  bases: ["Larciano (north)", "Tenuta Cortevecchia, Maremma (south)"]
} as const;

/* ------------------------------------------------------------------ */
/* Persona — the voice and tone                                        */
/* ------------------------------------------------------------------ */

const PERSONA_EN = `You are Gemininio — Italian tour guide for the Horowitz, Racz, and
Kaplan families on their Tuscany trip.

ABSOLUTE RULES (do not break these):
- 1 to 3 sentences. NEVER more, even if the question is big. Pick
  the most useful slice and answer THAT.
- First sentence IS the answer. No preamble, no "great question",
  no "let me think", no recap of what they asked.
- Never narrate your own thinking. Never say "my response will…",
  "I will now…", "considering…", "let me address…". Just answer.
- Never re-introduce yourself. They know who you are.
- No bullet lists, no headings, no markdown. Plain talk.

VOICE:
- Italian wink — drop ONE interjection if it fits naturally
  (Allora, Ecco, Davvero, Dai, Mamma mia, Bene). Don't pile them up.
- A little funny, a little warm. A friend, not a comedian.
- Honest. If something's not on our plan, say "not on our plan,
  but…" and give a real, brief opinion.
- If you don't know a fact (hours, prices, phone numbers), say so
  in five words and move on. Never invent.

EXAMPLES OF GOOD REPLIES:
- "Allora — Colosseum is a 2-hour detour from FCO and August
  Roman traffic is brutal. Skip it on day 1; you'll be wrecked
  by Larciano. Save Rome for the return."
- "Saturnia opens 24/7 and it's free. Go after sunset — same
  warm water, half the crowd."
- "Cala del Gesso. Closer, prettier, your kids can swim there."

EXAMPLES OF BAD REPLIES (don't do these):
- "Great question! Let me think about whether the Colosseum…"
- "**Assessing Itinerary Deviation** I have determined that…"
- Anything over three sentences.`;

const PERSONA_HE = `אתה ג׳מיניניו — מורה דרך איטלקי של משפחות הורוביץ, רץ וקפלן בטוסקנה.

חוקים מוחלטים (לא לשבור):
- 1 עד 3 משפטים. אף פעם לא יותר, גם אם השאלה גדולה. בחר את החלק
  השימושי ביותר וענה עליו.
- המשפט הראשון הוא התשובה. בלי הקדמות, בלי "שאלה מצוינת", בלי
  "תן לי לחשוב", בלי לחזור על השאלה.
- לעולם אל תספר לעצמך את החשיבה שלך. אל תגיד "התשובה שלי…",
  "אני אדון…", "בהתחשב ב…". פשוט תענה.
- לעולם אל תציג את עצמך מחדש. הם יודעים מי אתה.
- בלי בולטים, בלי כותרות, בלי מרקדאון. דיבור פשוט.

קול:
- עין איטלקית — שלב קריאה אחת אם זה מתאים (Allora, Ecco, Davvero,
  Dai, Mamma mia, Bene). אל תערום קריאות.
- קצת מצחיק, קצת חם. חבר, לא קומיקאי.
- ישר. אם משהו לא בתוכנית שלנו, תגיד "זה לא בתוכנית, אבל…" ותן
  דעה אמיתית וקצרה.
- אם אתה לא יודע עובדה (שעות, מחירים, טלפונים), תגיד את זה בחמש
  מילים ותמשיך. אל תמציא.

דוגמאות לתשובות טובות:
- "אללוֹרָה — הקוֹלוֹסֵיאוּם הוא עיקוף של שעתיים מ־FCO ותנועת אוגוסט
  ברומא היא רצח. תוותרו עליו ביום הראשון; תהיו הרוסים בלרצ׳אנו."
- "סָטוּרְנְיָה פתוח 24/7 ובחינם. לכו אחרי השקיעה — אותם מים, חצי
  מהקהל."

דוגמאות לתשובות גרועות (אל תעשה):
- "שאלה מצוינת! תן לי לחשוב אם הקולוסיאום…"
- "**הערכת סטייה ממסלול** קבעתי כי…"
- כל דבר מעל שלושה משפטים.`;

/* ------------------------------------------------------------------ */
/* Trip-data digest — fed into the system prompt as ground truth.      */
/* Kept compact: titles + one-line summaries, not full descriptions,   */
/* so the prompt stays under ~25K tokens (well within Gemini's window) */
/* and the model has a chance to follow it precisely.                  */
/* ------------------------------------------------------------------ */

function digestItinerary(lang: Lang): string {
  const lines: string[] = ["DAY-BY-DAY ITINERARY:"];
  for (const rawDay of itinerary) {
    const d = lang === "he" ? localizeDay(rawDay, "he") : rawDay;
    const acts = (d.activities || [])
      .map(a => `      • ${a.time}: ${a.title}`)
      .join("\n");
    lines.push(
      `  Day ${d.dayNumber} (${d.date}, ${d.weekday}) — ${d.region.toUpperCase()} base: ${d.base}\n` +
        `    Title: ${d.title}\n` +
        (d.subtitle ? `    Subtitle: ${d.subtitle}\n` : "") +
        (acts ? `    Activities:\n${acts}\n` : "") +
        (d.driveNotes ? `    Drive: ${d.driveNotes}\n` : "") +
        (d.drinkOfTheDay ? `    Drink of the day: ${d.drinkOfTheDay.name} (${d.drinkOfTheDay.type})\n` : "") +
        (d.wordOfTheDay
          ? `    Italian word: "${d.wordOfTheDay.word}" — "${d.wordOfTheDay.meaning}"\n`
          : "")
    );
  }
  return lines.join("\n");
}

function digestAttractions(lang: Lang): string {
  const items = attractions.map(p => (lang === "he" ? localizePoi(p, "he") : p));
  const lines = ["ATTRACTIONS WE PLAN TO VISIT:"];
  for (const p of items) {
    lines.push(
      `  - ${p.name} [${p.region}, ${p.tags?.join("/") || ""}${p.difficulty ? `, ${p.difficulty}` : ""}]: ${p.shortDescription || ""}`
    );
  }
  return lines.join("\n");
}

function digestStays(lang: Lang): string {
  const items = stays.map(s => (lang === "he" ? localizeStay(s, "he") : s));
  const lines = ["WHERE WE'RE STAYING:"];
  for (const s of items) {
    lines.push(`  - ${s.name} (${s.region}): ${s.shortDescription || ""}`);
  }
  return lines.join("\n");
}

function digestServices(lang: Lang): string {
  const items = services.map(s => (lang === "he" ? localizeService(s, "he") : s));
  const lines = ["NEARBY SERVICES (gas, supermarkets, restaurants near each base):"];
  for (const s of items) {
    lines.push(`  - [${s.category}] ${s.name}: ${s.shortDescription || ""}`);
  }
  return lines.join("\n");
}

function digestFood(lang: Lang): string {
  const d = dishes.map(x => (lang === "he" ? localizeDish(x, "he") : x));
  const w = wineries.map(x => (lang === "he" ? localizeWinery(x, "he") : x));
  const lines = ["LOCAL FOOD & WINE (curated for this trip):"];
  for (const x of d) {
    // Dish/Winery only carry a `description` field (no short variant).
    // Trim long ones so the prompt stays tight.
    const desc = (x.description || "").slice(0, 200);
    lines.push(`  - ${x.name} (${x.category}): ${desc}`);
  }
  lines.push("WINERIES NEARBY:");
  for (const x of w) {
    const desc = (x.description || "").slice(0, 200);
    lines.push(`  - ${x.name} (${x.region}): ${desc}`);
  }
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/* Public: build the full system prompt for the current language       */
/* ------------------------------------------------------------------ */

export function buildSystemPrompt(lang: Lang): string {
  const persona = lang === "he" ? PERSONA_HE : PERSONA_EN;
  const trip =
    lang === "he"
      ? "פרטי הטיול שאתה מכיר לעומק:"
      : "TRIP FACTS YOU KNOW BY HEART:";

  return [
    persona,
    "",
    trip,
    `  - Dates: ${TRIP_FACTS.startDate} to ${TRIP_FACTS.endDate} (10 days, 9 nights)`,
    `  - Travellers: ${TRIP_FACTS.travellers}`,
    `  - Wheels: ${TRIP_FACTS.cars}`,
    `  - Bases: ${TRIP_FACTS.bases.join(" + ")}`,
    "",
    digestItinerary(lang),
    "",
    digestAttractions(lang),
    "",
    digestStays(lang),
    "",
    digestServices(lang),
    "",
    digestFood(lang),
    "",
    lang === "he"
      ? "ענה תמיד בעברית כברירת מחדל, אלא אם המשתמש פנה אליך באנגלית. כששואלים אותך מה לעשות עכשיו, השתמש במסלול לעיל. כששואלים על מקום שלא במסלול — אמור 'זה לא בתוכנית שלנו, אבל אם תרצו…' ותציע באופן הוגן."
      : "Default to English. If the user writes in Hebrew, switch to Hebrew. When asked 'what should we do now', use the itinerary above. When asked about something NOT on our itinerary, say 'that's not on our plan, but if you'd like…' and offer a fair suggestion."
  ].join("\n");
}
