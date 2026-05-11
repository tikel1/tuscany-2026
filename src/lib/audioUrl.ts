/** Resolved URL for static MP3s under `public/audio/`, respecting Vite `base`. */

import type { Lang } from "./i18n";

/** Vite `base` should include a trailing slash; normalize so we never emit `/reporepo/audio`. */
function baseUrl(): string {
  const raw = import.meta.env.BASE_URL || "/";
  return raw.endsWith("/") ? raw : `${raw}/`;
}

export function resolveAudioUrl(input: {
  attractionId?: string;
  audioAssetPath?: string;
}): string | null {
  const base = baseUrl();
  if (input.audioAssetPath) {
    return `${base}audio/${input.audioAssetPath}.mp3`;
  }
  if (input.attractionId) {
    return `${base}audio/attractions/${input.attractionId}.mp3`;
  }
  return null;
}

/** Attraction narration: Hebrew UI uses `.he.mp3` first (when present), then English `.mp3`. */
export function resolveAttractionListenUrls(
  attractionId: string,
  lang: Lang
): { primary: string; fallback: string | null } {
  const base = baseUrl();
  const en = `${base}audio/attractions/${attractionId}.mp3`;
  if (lang !== "he") {
    return { primary: en, fallback: null };
  }
  const he = `${base}audio/attractions/${attractionId}.he.mp3`;
  return { primary: he, fallback: en };
}
