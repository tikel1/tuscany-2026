import { useLang, type Lang } from "./i18n";

/**
 * The full UI dictionary. Every visible string in the shell of the app
 * lives here, keyed by short identifiers. To use a key in a component:
 *
 *   const t = useT();
 *   t("plan.read_more");
 */
export const DICT = {
  /* ---------- Brand / hero ---------- */
  brand: { en: "Tuscany 2026", he: "טוסקנה 2026" },
  brand_short: { en: "Tuscany", he: "טוסקנה" },
  brand_year: { en: "'26", he: "'26" },
  family_edition: {
    en: "Family edition · Issue 01",
    he: "מהדורת המשפחה · גליון 01"
  },
  families_byline: {
    en: "The Horowitz × Racz × Kaplan families · August 2026",
    he: "משפחות הורוביץ × רץ × קפלן · אוגוסט 2026"
  },
  hero_before_lead: {
    en: "Counting down to summer in the Tuscan hills",
    he: "סופרים לאחור לקיץ בגבעות טוסקנה"
  },
  hero_today_lead: { en: "Today in Tuscany", he: "היום בטוסקנה" },
  hero_after_lead: { en: "That summer in Tuscany", he: "אותו קיץ בטוסקנה" },
  hero_after_title: { en: "Buon ritorno", he: "ברוכים השבים" },
  hero_after_sub: {
    en: "17 — 26 August 2026 · the family edition",
    he: "17 — 26 באוגוסט 2026 · מהדורת המשפחה"
  },
  hero_close_almost: {
    en: "Buon viaggio — almost there",
    he: "בון ויאג'ו — כמעט שם"
  },
  hero_one_week: {
    en: "One week to go · time to pack the dry bag",
    he: "שבוע נשאר · הגיע הזמן לארוז את התיק האטום"
  },
  hero_one_month: {
    en: "Less than a month · confirm the chef and the boat",
    he: "פחות מחודש · לאשר את השף ואת הסירה"
  },
  hero_far: {
    en: "An Italian summer, on the horizon",
    he: "קיץ איטלקי, באופק"
  },
  hero_today_day: { en: "Day", he: "יום" },
  hero_of_ten: { en: "of ten", he: "מתוך עשרה" },
  scroll_to_plan: { en: "the plan", he: "התוכנית" },
  hero_photo_day: { en: "Day {n}", he: "יום {n}" },

  /* ---------- Navbar ---------- */
  nav_plan: { en: "Plan", he: "תוכנית" },
  nav_map: { en: "Map", he: "מפה" },
  // The two stays — Larciano & Cortevecchia — are the trip's two
  // "neighborhoods", which is what we surface in the nav.
  nav_stays: { en: "Neighborhood", he: "שכונה" },
  nav_attractions: { en: "Places", he: "מקומות" },
  // Services (gas / supermarket / nearby restaurants) is no longer in
  // the nav, but the section still lives on the page; keeping a clean
  // label here in case it returns later.
  nav_services: { en: "Local", he: "מקומי" },
  nav_food: { en: "Food", he: "אוכל" },
  nav_tips: { en: "Tips", he: "טיפים" },
  nav_checklist: { en: "Lists", he: "רשימות" },
  nav_emergency: { en: "Emergency", he: "חירום" },

  badge_done: { en: "Done", he: "סיום" },
  badge_day_n: { en: "Day {n}", he: "יום {n}" },
  badge_d_until: { en: "{n}d", he: "{n} ימים" },

  /* ---------- Itinerary section ---------- */
  plan_eyebrow: { en: "The plan · day by day", he: "התוכנית · יום אחר יום" },
  plan_kicker: {
    en: "Swipe through ten chapters · click Read more for the full chapter",
    he: "החלק בין עשרה פרקים · הקש על קרא עוד לפרק המלא"
  },
  plan_chapter_x_of_y: {
    en: "Chapter {x} / {y}",
    he: "פרק {x} / {y}"
  },
  read_more: { en: "Read more", he: "קרא עוד" },
  more_about_place: {
    en: "More about this place",
    he: "עוד על המקום הזה"
  },
  hide_details: { en: "Hide details", he: "הסתר פרטים" },
  about_this_place: { en: "About this place", he: "על המקום הזה" },
  on_the_road: { en: "On the road", he: "על הדרך" },
  more_stop_one: { en: "more stop", he: "עצירה נוספת" },
  more_stop_many: { en: "more stops", he: "עצירות נוספות" },

  /* ---------- Chapter detail ---------- */
  back_to_plan: { en: "Back to the plan", he: "חזרה לתוכנית" },
  todays_plan: { en: "Today's plan", he: "תוכנית היום" },
  hour_by_hour: { en: "Hour by hour", he: "שעה אחרי שעה" },
  on_the_map: { en: "On the map", he: "על המפה" },
  the_days_stops: { en: "The day's stops", he: "תחנות היום" },
  ordered_visit: {
    en: "Numbered in the order you'll visit them",
    he: "ממוספרות לפי סדר הביקור"
  },
  things_to_know: { en: "Things to know", he: "טוב לדעת" },
  tips_for_chapter: { en: "Tips for this chapter", he: "טיפים לפרק הזה" },
  no_locations_for_chapter: {
    en: "No locations on the map for this chapter.",
    he: "אין מיקומים על המפה לפרק הזה."
  },
  previous: { en: "Previous", he: "קודם" },
  next: { en: "Next", he: "הבא" },

  /* Severity labels */
  severity_critical: { en: "Critical", he: "קריטי" },
  severity_warning: { en: "Heads up", he: "שימו לב" },
  severity_info: { en: "Good to know", he: "טוב לדעת" },

  /* Today badge */
  today: { en: "Today", he: "היום" },

  /* ---------- Region / chapter labels ---------- */
  region_north_long: { en: "North Tuscany", he: "צפון טוסקנה" },
  region_south_long: { en: "South Tuscany", he: "דרום טוסקנה" },
  region_transit_long: { en: "Transit", he: "מעבר" },
  region_north_short: { en: "North", he: "צפון" },
  region_south_short: { en: "South", he: "דרום" },
  region_transit_short: { en: "Transit", he: "מעבר" },

  /* Tag labels */
  tag_water: { en: "Water", he: "מים" },
  tag_extreme: { en: "Adrenaline", he: "אדרנלין" },
  tag_nature: { en: "Nature", he: "טבע" },
  tag_culture: { en: "Culture", he: "תרבות" },
  tag_family: { en: "Family", he: "משפחה" },
  tag_food: { en: "Food", he: "אוכל" },
  tag_view: { en: "View", he: "נוף" },
  tag_cave: { en: "Cave", he: "מערה" },
  tag_village: { en: "Village", he: "כפר" },

  /* ---------- Map section ---------- */
  map_eyebrow: { en: "The atlas", he: "האטלס" },
  map_title: {
    en: "The whole trip on one map",
    he: "כל הטיול על מפה אחת"
  },
  map_kicker: {
    en: "Tap a pin · trace the route · filter the rest",
    he: "הקש על סיכה · עקוב אחר המסלול · סנן את השאר"
  },
  map_intro: {
    en: "Every stay, attraction, restaurant, supermarket and gas station — color-coded by category. The dashed line is our actual journey: Rome to Larciano, Larciano to Cortevecchia, Cortevecchia back to Rome.",
    he: "כל אכסניה, אטרקציה, מסעדה, סופרמרקט ותחנת דלק — בקוד צבעים לפי קטגוריה. הקו המקווקו הוא המסלול שלנו: רומא ללרצ'יאנו, לרצ'יאנו לקורטווקיה, וחזרה לרומא."
  },
  map_route_on: { en: "Route on", he: "מסלול מוצג" },
  map_route_off: { en: "Route off", he: "מסלול מוסתר" },
  map_spokes_on: { en: "Day trips on", he: "טיולי יום מוצגים" },
  map_spokes_off: { en: "Day trips off", he: "טיולי יום מוסתרים" },
  map_seg_arrival: {
    en: "Day 1 · Land in Rome, drive north",
    he: "יום 1 · נחיתה ברומא, נסיעה צפונה"
  },
  map_seg_arrival_short: { en: "Mon · 17 Aug", he: "ב' · 17 באוגוסט" },
  map_seg_transfer: {
    en: "Day 5 · Transfer to the south, via Sentierelsa",
    he: "יום 5 · מעבר לדרום, דרך סנטיירלסה"
  },
  map_seg_transfer_short: { en: "Fri · 21 Aug", he: "ו' · 21 באוגוסט" },
  map_seg_departure: {
    en: "Day 9–10 · Final loop to Fiumicino",
    he: "ימים 9–10 · הלולאה האחרונה לפיומיצ'ינו"
  },
  map_seg_departure_short: {
    en: "Tue/Wed · 25–26 Aug",
    he: "ג'/ד' · 25–26 באוגוסט"
  },
  map_zoom_fit: { en: "Zoom to fit all locations", he: "התאם תצוגה לכל המיקומים" },

  /* Map categories */
  cat_stay: { en: "Stays", he: "לינה" },
  cat_attraction: { en: "Attractions", he: "אטרקציות" },
  cat_restaurant: { en: "Restaurants", he: "מסעדות" },
  cat_supermarket: { en: "Supermarkets", he: "סופרמרקטים" },
  cat_gas: { en: "Gas", he: "דלק" },
  cat_airport: { en: "Airport", he: "שדה תעופה" },
  cat_hospital: { en: "Hospital", he: "בית חולים" },
  cat_winery: { en: "Wineries", he: "יקבים" },

  /* Map popup */
  navigate: { en: "Navigate", he: "ניווט" },
  website: { en: "Website", he: "אתר" },
  show_on_map: { en: "Show on the map", he: "הצג על המפה" },
  on_the_map_short: { en: "On the map", he: "על המפה" },

  /* ---------- Stays section ---------- */
  stays_eyebrow: { en: "Where we sleep", he: "איפה אנחנו ישנים" },
  stays_title: { en: "Two homes, two halves", he: "שני בתים, שני חצאים" },
  stays_kicker: {
    en: "Five nights up north, five nights down south",
    he: "חמישה לילות בצפון, חמישה לילות בדרום"
  },
  stays_intro: {
    en: "We split the trip between a private home in northern Tuscany and a restored estate in the southern Maremma — each chosen as the perfect base for the days around it.",
    he: "אנחנו מחלקים את הטיול בין בית פרטי בצפון טוסקנה לאחוזה משוחזרת במרמה הדרומית — כל אחד נבחר כבסיס מושלם לימים שסביבו."
  },
  stay_check_in: { en: "Check in", he: "צ'ק־אין" },
  stay_check_out: { en: "Check out", he: "צ'ק־אאוט" },
  stay_nights_one: { en: "{n} night", he: "{n} לילה" },
  stay_nights_many: { en: "{n} nights", he: "{n} לילות" },
  stay_highlights: { en: "Why we picked it", he: "למה בחרנו בו" },
  stay_warnings: { en: "Worth knowing", he: "כדאי לדעת" },
  stay_open_booking: { en: "Open booking", he: "פתח הזמנה" },

  /* ---------- Highlights / TripStats ---------- */
  highlights_eyebrow: { en: "In this issue", he: "בגליון הזה" },
  highlights_title: {
    en: "Ten moments worth flying for",
    he: "עשרה רגעים ששווה לטוס בשבילם"
  },
  trip_stats_eyebrow: { en: "By the numbers", he: "במספרים" },
  trip_stats_days: { en: "Days", he: "ימים" },
  trip_stats_chapters: { en: "Chapters", he: "פרקים" },
  trip_stats_attractions: { en: "Highlights", he: "שיאים" },
  trip_stats_stays: { en: "Stays", he: "לינות" },

  /* ---------- Attractions grid ---------- */
  attr_eyebrow: { en: "Postcards from Tuscany", he: "גלויות מטוסקנה" },
  attr_title: { en: "Places we'll fall for", he: "מקומות שנתאהב בהם" },
  attr_kicker: {
    en: "Sixteen stops — water, walls, cliffs, caves, and a few good meals",
    he: "שש־עשרה תחנות — מים, חומות, צוקים, מערות וכמה ארוחות טובות"
  },
  attr_filter_all: { en: "All", he: "הכול" },
  attr_filter_north: { en: "North", he: "צפון" },
  attr_filter_south: { en: "South", he: "דרום" },
  attr_filter_water: { en: "Water", he: "מים" },
  attr_filter_culture: { en: "Culture", he: "תרבות" },
  attr_filter_extreme: { en: "Adrenaline", he: "אדרנלין" },
  attr_filter_nature: { en: "Nature", he: "טבע" },

  /* ---------- Services section ---------- */
  services_eyebrow: { en: "The neighborhood", he: "השכונה" },
  services_title: { en: "Eat, shop, refuel", he: "אוכל, קניות, תדלוק" },
  services_kicker: {
    en: "Hand-picked spots near both bases — saves you the panic-Google",
    he: "מקומות שנבחרו בקפידה ליד שני הבסיסים — חוסכים גוגל בלחץ"
  },
  services_filter_north: { en: "North base", he: "בסיס צפוני" },
  services_filter_south: { en: "South base", he: "בסיס דרומי" },
  services_filter_restaurant: { en: "Restaurants", he: "מסעדות" },
  services_filter_supermarket: { en: "Supermarkets", he: "סופרמרקטים" },
  services_filter_gas: { en: "Gas", he: "דלק" },

  hours: { en: "Hours", he: "שעות" },

  /* ---------- Tips section ---------- */
  tips_eyebrow: { en: "Local intelligence", he: "מודיעין מקומי" },
  tips_title: { en: "Tips & quiet warnings", he: "טיפים ואזהרות שקטות" },
  tips_kicker: {
    en: "What we learned the hard way, so you don't have to",
    he: "מה שלמדנו בדרך הקשה — כדי שלא תצטרכו"
  },

  /* ---------- Checklist ---------- */
  checklist_eyebrow: { en: "Before we fly", he: "לפני הטיסה" },
  checklist_title: { en: "Pre-trip checklist", he: "צ'קליסט לפני הטיול" },
  checklist_kicker: {
    en: "Two lists: book it now, pack it later",
    he: "שתי רשימות: להזמין עכשיו, לארוז אחר כך"
  },
  checklist_booking: { en: "Book ahead", he: "להזמין מראש" },
  checklist_packing: { en: "Pack the bag", he: "לארוז את התיק" },
  checklist_progress: {
    en: "{done} of {total} done",
    he: "{done} מתוך {total} בוצעו"
  },
  checklist_urgent: { en: "Urgent", he: "דחוף" },

  /* ---------- Emergency ---------- */
  emergency_eyebrow: { en: "When things go sideways", he: "כשמשהו משתבש" },
  emergency_title: { en: "Emergency & medical", he: "חירום ורפואה" },
  emergency_kicker: {
    en: "One number to remember: 112",
    he: "מספר אחד לזכור: 112"
  },
  emergency_call_112: { en: "Call 112", he: "התקשר ל־112" },
  emergency_112_lead: {
    en: "Single emergency number across the EU — works from any phone, English available",
    he: "מספר חירום אחיד באיחוד האירופי — עובד מכל טלפון, כולל אנגלית"
  },

  /* ---------- Weather ---------- */
  weather_eyebrow: { en: "Right now in Tuscany", he: "עכשיו בטוסקנה" },
  weather_north: { en: "North · Larciano", he: "צפון · לרצ'יאנו" },
  weather_south: { en: "South · Maremma", he: "דרום · מרמה" },
  weather_loading: { en: "Loading…", he: "טוען…" },
  weather_error: { en: "Weather unavailable", he: "מזג אוויר לא זמין" },
  weather_high_low: { en: "H {high}° / L {low}°", he: "מקס׳ {high}° / מינ׳ {low}°" },
  weather_now: { en: "Now {temp}°", he: "כעת {temp}°" },

  /* ---------- Difficulty ---------- */
  difficulty_label: { en: "Difficulty", he: "רמת קושי" },
  difficulty_easy: { en: "Easy", he: "קל" },
  difficulty_moderate: { en: "Moderate", he: "בינוני" },
  difficulty_challenging: { en: "Challenging", he: "מאתגר" },

  /* ---------- Per-attraction insider tips ---------- */
  insider_tips_label: { en: "Insider tips", he: "טיפים פנימיים" },

  /* ---------- Per-day gear & dayTips on the chapter page ---------- */
  gear_eyebrow: { en: "Pack the day", he: "תארזו ליום" },
  gear_title: { en: "What to bring", he: "מה לקחת" },
  gear_kicker: {
    en: "A small kit, picked for the day's mix",
    he: "ערכה קטנה שנבחרה לפי המיקס של היום"
  },
  gear_for_label: { en: "for", he: "ל־" },
  gear_for_general: { en: "general", he: "כללי" },

  word_eyebrow: { en: "Italian word of the day", he: "המילה האיטלקית של היום" },
  word_pronounce_label: { en: "Pronounce it", he: "איך אומרים" },
  word_meaning_label: { en: "Meaning", he: "פירוש" },
  word_use_label: { en: "Try it", he: "נסו לומר" },
  daytips_eyebrow: { en: "Notes for the day", he: "הערות ליום" },
  daytips_title: { en: "Good to know", he: "טוב לדעת" },
  daytips_kicker: {
    en: "Money, timing, mood — the things you'd whisper at breakfast",
    he: "כסף, תזמון, מצב רוח — הדברים שלוחשים ליד ארוחת הבוקר"
  },

  /* ---------- Food & Wine ---------- */
  food_eyebrow: { en: "At the table", he: "ליד השולחן" },
  food_title: { en: "What Tuscany tastes like", he: "ככה טוסקנה אמורה לטעום" },
  food_kicker: {
    en: "Signature dishes, local pasta and the wineries to visit",
    he: "מנות מסמלות, פסטות מקומיות והיקבים שכדאי לבקר"
  },
  food_dishes_label: { en: "Signature dishes", he: "מנות מסמלות" },
  food_wineries_label: { en: "Wineries to visit", he: "יקבים לבקר" },
  food_filter_north: { en: "North · Larciano", he: "צפון · לרצ'יאנו" },
  food_filter_south: { en: "South · Maremma", he: "דרום · מרמה" },
  food_filter_tuscany: { en: "Across Tuscany", he: "כל טוסקנה" },
  food_try_it: { en: "Try it at", he: "לטעום ב" },
  food_appellation: { en: "Appellation", he: "ייעוד יין" },
  food_book_visit: { en: "Book the visit", he: "הזמן ביקור" },
  food_dish_pasta: { en: "Pasta", he: "פסטה" },
  food_dish_starter: { en: "Starter", he: "מנה ראשונה" },
  food_dish_main: { en: "Main", he: "מנה עיקרית" },
  food_dish_dessert: { en: "Dessert", he: "קינוח" },
  food_dish_drink: { en: "Drink", he: "משקה" },
  food_dish_snack: { en: "Snack", he: "נשנוש" },

  /* ---------- Footer ---------- */
  footer_made_with: {
    en: "Built for the family · August 2026",
    he: "נבנה למשפחה · אוגוסט 2026"
  },
  footer_attribution: {
    en: "Photos credited to their respective authors. Map © OpenStreetMap & CARTO.",
    he: "צילומים בקרדיט ליוצריהם. מפה © OpenStreetMap ו־CARTO."
  },
  footer_open_repo: { en: "Open the repo", he: "לרפו ב־GitHub" },
  footer_lang_label: { en: "Language", he: "שפה" },

  /* ---------- Floating buttons / common ---------- */
  open_map: { en: "Open the map", he: "פתח מפה" },
  open_external: { en: "Open", he: "פתח" },

  /* ---------- TripStrip ---------- */
  scroll_chapters_prev: {
    en: "Previous chapters",
    he: "פרקים קודמים"
  },
  scroll_chapters_next: {
    en: "Next chapters",
    he: "פרקים הבאים"
  },
  chapter_label: { en: "Chapter", he: "פרק" },
  month_aug_short: { en: "Aug", he: "באוגוסט" }
} as const;

export type DictKey = keyof typeof DICT;

export function tr(key: DictKey, lang: Lang): string {
  return DICT[key][lang];
}

/**
 * Format a string with {placeholder} → value substitutions.
 *   formatTr("Day {n}", { n: 3 }) → "Day 3"
 */
export function formatTr(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export function useT() {
  const { lang } = useLang();
  return (key: DictKey, vars?: Record<string, string | number>) =>
    formatTr(DICT[key][lang], vars);
}

/* ---------- Weekdays / months ---------- */

const WEEKDAYS_HE: Record<string, string> = {
  Monday: "יום שני",
  Tuesday: "יום שלישי",
  Wednesday: "יום רביעי",
  Thursday: "יום חמישי",
  Friday: "יום שישי",
  Saturday: "שבת",
  Sunday: "יום ראשון"
};

const WEEKDAYS_HE_SHORT: Record<string, string> = {
  Monday: "ב'",
  Tuesday: "ג'",
  Wednesday: "ד'",
  Thursday: "ה'",
  Friday: "ו'",
  Saturday: "ש'",
  Sunday: "א'"
};

export function localizeWeekday(weekday: string, lang: Lang, short = false): string {
  if (lang === "en") return short ? weekday.slice(0, 3) : weekday;
  return short ? WEEKDAYS_HE_SHORT[weekday] ?? weekday : WEEKDAYS_HE[weekday] ?? weekday;
}

const MONTHS_HE = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר"
];

/** Localized day-month (e.g. "17 Aug" / "17 באוגוסט"). */
export function localizeShortDate(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split("-").map(Number);
  const day = d;
  if (lang === "en") {
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  return `${day} ב${MONTHS_HE[m - 1]}`;
}
