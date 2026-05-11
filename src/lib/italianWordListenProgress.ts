const PREFIX = "tuscany26:italian-words-heard:";

function key(dayNumber: number) {
  return `${PREFIX}${dayNumber}`;
}

export function getItalianWordHeardMap(dayNumber: number): Record<number, boolean> {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(key(dayNumber));
    if (!raw) return {};
    const o = JSON.parse(raw) as Record<string, boolean>;
    const out: Record<number, boolean> = {};
    for (const [k, v] of Object.entries(o)) {
      const n = Number(k);
      if (!Number.isNaN(n) && v) out[n] = true;
    }
    return out;
  } catch {
    return {};
  }
}

/** First slide index the user has not completed listening to; wraps to 0 if all heard. */
export function firstUnheardItalianWordIndex(dayNumber: number, count: number): number {
  if (count <= 0) return 0;
  const heard = getItalianWordHeardMap(dayNumber);
  for (let i = 0; i < count; i++) {
    if (!heard[i]) return i;
  }
  return 0;
}

export function markItalianWordHeard(dayNumber: number, wordIndex: number) {
  if (typeof localStorage === "undefined") return;
  const heard = getItalianWordHeardMap(dayNumber);
  heard[wordIndex] = true;
  const serial: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(heard)) {
    if (v) serial[String(k)] = true;
  }
  try {
    localStorage.setItem(key(dayNumber), JSON.stringify(serial));
  } catch {
    /* quota / private mode */
  }
}
