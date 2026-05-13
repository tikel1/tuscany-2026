import type { ChecklistItem } from "../types";

export const checklistHE: Record<string, Partial<Pick<ChecklistItem, "text" | "detail">>> = {
  // Booking
  "book-canyon-park": {
    text: "להזמין בקניון פארק — סאפ בנהר / פעילות מים",
    detail:
      "באוגוסט חלונות פעילות המים בנקיק הלימה נסגרים מהר. להזמין ב־canyonpark.it ברגע שהתאריך נפתח — עדיף מלהסתכן בשטח עם ״אין מקום״."
  },
  "book-argentario-boat": {
    text: "להזמין סירה ללא רישיון בפורטו סנטו סטפנו (22.8)",
    detail:
      "Argentario Boat Rental, Yes Boat או דומה. לוודא ׳senza patente׳ וגוזו/גומונה ליום."
  },
  "book-private-chef": {
    text: "להזמין שף פרטי לווילה (21.8)",
    detail:
      "Chef-at-Home Tuscany / Eatwith / Airbnb Experiences. סדנת פיצ'י + ארוחת ערב למשפחה."
  },
  "book-rafting": {
    text: "להזמין סופט ראפטינג בסרקיו",
    detail:
      "טיול ידידותי למשפחות עם אחד המפעילים בגרפניאנה (Canyon Park, Rafting Garfagnana)."
  },
  "book-horses": {
    text: "להזמין שעת רכיבה במרמה",
    detail: "חווה ידידותית למתחילים ליד אלברסה / אלביניה. שעת הבוקר המוקדמת היא הטובה ביותר."
  },
  "international-driving-permit": {
    text: "להוציא רישיון נהיגה בינלאומי לנהג",
    detail: "נדרש בדלפק ההשכרה לצד הרישיון המקומי. להוציא לפני הטיסה."
  },
  "credit-card-on-driver-name": {
    text: "לוודא שלנהג ההשכרה יש כרטיס אשראי על שמו",
    detail: "כרטיסי דביט (חיוב ישיר) בדרך כלל נדחים. הפיקדון יכול להגיע ל־€1,500 ויותר."
  },
  esim: {
    text: "לסגור eSIM איטלקי",
    detail: "Airalo / Holafly / Nomad — חבילת 10 ג״ב לאיטליה מספיקה. להפעיל בנמל התעופה."
  },

  // Packing
  "water-shoes": {
    text: "נעלי מים סגורות — לכולם",
    detail: "סנטיירלסה, סאטורניה, הסרקיו. בלי סנדלים, בלי כפכפים."
  },
  "dry-bag": {
    text: "תיק יבש (10–20 ל׳)",
    detail: "טלפונים, ארנקים, מפתחות הרכב על הסאפ ועל הסירה בארג'נטריו."
  },
  snorkels: {
    text: "שנורקל ומסכה לכל אחד",
    detail: "יום הסירה בארג'נטריו — מים צלולים, דגים בין הסלעים."
  },
  "uv-shirts": {
    text: "חולצות UV / לייקרה",
    detail: "שעות על סירה פתוחה באוגוסט — קרם הגנה לבד לא יספיק."
  },
  headlamps: {
    text: "פנסי ראש (קטנים, אחד לכל אחד)",
    detail: "למגורי המערות בוויטוצה ול־Vie Cave לקראת ערב."
  },
  "reef-sunscreen": {
    text: "קרם הגנה SPF גבוה ידידותי לים + קרם אלוורה/אחרי שמש",
    detail: "השמש האיטלקית באוגוסט אכזרית."
  },
  "first-aid": {
    text: "ערכת עזרה ראשונה קטנה",
    detail: "פלסטרים, חיטוי, אקמול לילדים, אנטיהיסטמין, נגד שלשולים."
  },
  "swim-towels": {
    text: "מגבות מיקרופייבר מתייבשות מהר",
    detail: "אחת לאדם — לטיולי נחל ועצירות חוף."
  },
  "reusable-bottles": {
    text: "בקבוקי מים רב־פעמיים",
    detail: "מי הברז בסדר כמעט בכל מקום; ממלאים במזרקות."
  },
  "power-adapter": {
    text: "מתאמי שקע EU + מטען רב־USB",
    detail: "השקעים באיטליה ברובם מסוג F/L."
  },
  "kids-snacks": {
    text: "מאגר חטיפים לילדים",
    detail: "ביום ההגעה מגיעים מאוחר; לא יהיה זמן לקניות מסודרות."
  }
};
