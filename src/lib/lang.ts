/** Language code + shared localization helpers (no React — safe for react-refresh). */

export type Lang = "en" | "he";

export const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  he: "עברית"
};

export const LANG_SHORT: Record<Lang, string> = {
  en: "EN",
  he: "עב"
};

/**
 * A "localized" value is either a plain string (English fallback) or
 * an object that contains the value in each supported language.
 */
export type Loc<T = string> = T | { en: T; he: T };

export function loc<T>(value: Loc<T>, language: Lang): T {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "en" in (value as Record<string, unknown>) &&
    "he" in (value as Record<string, unknown>)
  ) {
    return (value as { en: T; he: T })[language];
  }
  return value as T;
}
