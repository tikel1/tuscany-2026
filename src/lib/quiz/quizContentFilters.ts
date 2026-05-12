/**
 * Client-side guardrails for Gemini-written quiz questions.
 * The model sometimes drifts into itinerary / arrival / "what did
 * you do first?" trivia even when the persona forbids it — we drop
 * those rows and retry another model / another completion.
 */

/** Remove clock-ish snippets from POI blurbs in the day digest only
 *  (does not mutate source data). */
export function stripSchedulingHintsFromPlaceBlurb(text: string): string {
  return text
    .replace(/\b\d{1,2}:\d{2}\b/g, "")
    .replace(/\b\d{1,2}\s*(am|pm)\b/gi, "")
    .replace(/\b\d{1,2}\s*[-–]\s*\d{1,2}\s*°?\s*c\b/gi, "")
    .replace(/\barrive(?:d|s)?\s+(?:by|before|early)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const FORBIDDEN_EN: RegExp[] = [
  /\bwhat time (?:did|was|were|do|does|is|are|will|would|should)\b/i,
  /\bwhich time (?:did|was|were|do|does|is|are)\b/i,
  /\bwhat '?s the time\b/i,
  /\bhow long (?:was|did) (?:the|your|today's) (?:drive|flight|trip)\b/i,
  /\bwhen did you (?:land|arrive|get|reach|enter|go)\b/i,
  /\bwhen you (?:landed|arrived|got to the pool|got there first|first got)\b/i,
  /\bwhat did you do first\b/i,
  /\bfirst thing you\b/i,
  /\bas soon as you (?:arrived|got|entered)\b/i,
  /\b(?:before|after) (?:lunch|dinner)\b/i,
  /\bmorning or afternoon\b/i,
  /\b(?:at|by|before|after)\s+\d{1,2}:\d{2}\b/i
];

const FORBIDDEN_HE: RegExp[] = [
  /באיזו\s+שעה/u,
  /מה\s+השעה/u,
  /מתי\s+(?:הגעתם|הגעת|נחתתם|נחתת|הגענו)/u,
  /כשהגעתם/u,
  /כשהגעת/u,
  /מה\s+עשיתם\s+(?:קודם|ראשון)/u,
  /לפני\s+ארוחת/u,
  /אחרי\s+ארוחת/u,
  /סדר\s+(?:הביקורים|היום)/u,
  /מיד\s+כשנכנסתם/u,
  /ברגע\s+שהגעתם/u,
  /מתי\s+נכנסתם/u,
  /כמה\s+זמן\s+(?:הייתה|ארכה)\s+(?:הנסיעה|הטיסה)/u
];

/**
 * True when the question text looks like schedule / arrival /
 * "guess what we did when" trivia — should be discarded.
 */
export function questionViolatesScheduleOrTripGuessing(question: string): boolean {
  const q = question.trim();
  if (!q) return true;
  if (/\b\d{1,2}:\d{2}\b/.test(q)) return true;
  for (const re of FORBIDDEN_EN) {
    if (re.test(q)) return true;
  }
  for (const re of FORBIDDEN_HE) {
    if (re.test(q)) return true;
  }
  return false;
}
