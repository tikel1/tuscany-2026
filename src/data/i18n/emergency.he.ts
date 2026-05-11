import type { EmergencyContact, EmergencyGroup } from "../types";

type EmergencyHEItem = Partial<Pick<EmergencyContact, "label" | "value" | "detail">>;

interface EmergencyHEGroup extends Partial<Pick<EmergencyGroup, "title">> {
  items?: EmergencyHEItem[];
}

/** Indexed by group order (0..n) — items in same order as the English data. */
export const emergencyHE: EmergencyHEGroup[] = [
  {
    title: "איטליה — מספרי חירום",
    items: [
      { label: "מספר חירום אחיד (EU)", detail: "משטרה, אמבולנס, כיבוי — אנגלית זמינה" },
      { label: "קרבינייררי (משטרה)" },
      { label: "מכבי אש" },
      { label: "חירום רפואי / אמבולנס" },
      { label: "משמר חופי", detail: "יום הסירה בארג'נטריו" },
      { label: "סיוע בדרכים (ACI)", detail: "מטלפון נייד או קווי איטלקי" }
    ]
  },
  {
    title: "בתי חולים ומרפאות — בסיס צפוני (לרצ'יאנו)",
    items: [
      {
        label: "אוספדאלה סן ג׳קופו — פיסטויה",
        value: "Via Ciliegiole 97, 51100 Pistoia",
        detail: "בית החולים הראשי, חדר מיון מלא. כ־25 דק׳ מלרצ'יאנו"
      },
      {
        label: "אוספדאלה סן לוקה — לוקה",
        value: "Via Lippi-Francesconi, 55100 Lucca",
        detail: "בית חולים מרכזי עם מיון פדיאטרי. כ־45 דק׳ מערבה"
      },
      {
        label: "פרונטו סוקורסו פדיאטריקו — מאיר (פירנצה)",
        value: "Viale Pieraccini 24, 50139 Firenze",
        detail: "בית החולים הילדים המוביל במרכז איטליה. כשעה"
      }
    ]
  },
  {
    title: "בתי חולים ומרפאות — בסיס דרומי (מנצ'יאנו / פיטיליאנו)",
    items: [
      {
        label: "אוספדאלה די פיטיליאנו — פטרוצ׳ולי",
        value: "Via Nicola Ciacci 340, 58017 פיטיליאנו (GR)",
        detail: "בית החולים הקרוב ביותר לקורטווקיה. כולל מיון. כ־35 דק׳"
      },
      {
        label: "אוספדאלה מיזריקורדיה — גרוסטו",
        value: "Via Senese 161, 58100 Grosseto",
        detail: "בית החולים הראשי של המחוז, שירותים מלאים. כשעה"
      },
      {
        label: "גוארדיה מדיקה טוריסטיקה",
        value: "118 (לבקש)",
        detail: "שירות רפואי לתיירים בקיץ — להתקשר ל־118 ולבקש להפנות"
      }
    ]
  },
  {
    title: "בתי מרקחת (תורנות 24 שעות)",
    items: [
      {
        label: "פרמצ'יה קומונאלה — מנצ'יאנו",
        value: "Via Marsala, 58014 מנצ'יאנו (GR)",
        detail: "בית המרקחת הקרוב ביותר לקורטווקיה. תורנות לילה מפורסמת על הדלת."
      },
      {
        label: "פרמצ'יה די לרצ'יאנו",
        value: "Via Marx, לרצ'יאנו (PT)",
        detail: "הקרוב לבסיס הצפוני. תורנות לילה מפורסמת על הדלת."
      }
    ]
  },
  {
    title: "שגרירות ישראל וסיוע קונסולרי (רומא)",
    items: [
      {
        label: "שגרירות ישראל ברומא",
        value: "Via Michele Mercati 14, 00197 Roma"
      },
      {
        label: "טלפון השגרירות"
      },
      {
        label: "מוקד חירום מחוץ לשעות (ישראלים בחו״ל)",
        detail: "חמ״ל משרד החוץ — 24/7"
      },
      {
        label: "אתר השגרירות"
      }
    ]
  }
];
