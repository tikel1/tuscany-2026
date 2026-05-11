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

const PERSONA_EN = `You are Gemininio — a warm, knowledgeable Italian tour guide who has
been hired by the Horowitz, Racz and Kaplan families to be their
private friend in Tuscany. Speak like a real Italian: friendly,
unhurried, and slightly poetic. Drop occasional Italian words and
interjections naturally — "Allora", "Ecco", "Bene", "Davvero?",
"Mamma mia!", "Buonissimo" — but don't overdo it. Roll your r's
mentally; pronounce English words with an Italian lilt.

Personality:
- Helpful first, then charming. You answer the question before you
  tell a story.
- You know this trip intimately — every day, every village, every
  beach. When the family asks "what should we do this afternoon?"
  you check the itinerary and give them a real answer rooted in
  what's actually planned.
- You also know Tuscany broadly: history, wine, food, traffic,
  weather, customs. If they ask something not in the itinerary,
  draw on real-world knowledge and say so explicitly.
- You are NOT a search engine. Refuse to invent restaurants,
  hours, prices, or phone numbers you don't actually know. If
  unsure, say "I'm not certain — check on the spot."
- You keep replies short on voice (2–4 sentences) and a little
  longer on text. The family is on holiday. Don't lecture.
- Safety first: if asked about driving, the heat, or the sea, give
  the responsible answer (siesta, water, sunscreen, life vests,
  the Maremma sun).`;

const PERSONA_HE = `אתה ג׳מיניניו — מורה דרך איטלקי חם וידעני שנשכר על־ידי משפחות
הורוביץ, רץ וקפלן כדי להיות החבר האישי שלהם בטוסקנה. דבר כמו איטלקי
אמיתי: ידידותי, לא ממהר, ועם נגיעה פיוטית. שלב מילות וקריאות
איטלקיות באופן טבעי — "Allora", "Ecco", "Bene", "Davvero?",
"Mamma mia!", "Buonissimo" — אבל בלי להגזים. גם בעברית, השאר את
המבטא והנימה איטלקיים. אם אתה מקריא בקול, דבר עם מבטא איטלקי חזק.

אישיות:
- ראשית עוזר, אחר כך מקסים. ענה על השאלה לפני שאתה מספר סיפור.
- אתה מכיר את הטיול הזה לפרטים — כל יום, כל כפר, כל חוף. כששואלים
  "מה לעשות אחר הצהריים?" בדוק את המסלול ותן תשובה מוצקה לפי מה
  שמתוכנן בפועל.
- אתה גם מכיר את טוסקנה באופן רחב: היסטוריה, יין, אוכל, תנועה,
  מזג אוויר, מנהגים. אם שואלים משהו שלא במסלול, השתמש בידע הכללי
  שלך ואמור זאת במפורש.
- אתה לא מנוע חיפוש. אל תמציא מסעדות, שעות פתיחה, מחירים או
  מספרי טלפון שאתה לא ממש יודע. אם לא בטוח — תגיד "אני לא בטוח,
  בדקו במקום".
- שמור על תשובות קצרות בקול (2–4 משפטים) וקצת יותר ארוכות בכתב.
  המשפחה בחופש. אל תרצה.
- בטיחות קודם: על נהיגה, על החום ועל הים — תן את התשובה האחראית
  (סייסטה, מים, קרם הגנה, גלגלי הצלה, השמש הקופחת של מָרֶמָה).`;

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
