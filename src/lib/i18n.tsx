import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

export type Lang = "en" | "he";

export const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  he: "עברית"
};

export const LANG_SHORT: Record<Lang, string> = {
  en: "EN",
  he: "עב"
};

const STORAGE_KEY = "tuscany:lang";

interface LangCtxValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  dir: "ltr" | "rtl";
}

const LangContext = createContext<LangCtxValue>({
  lang: "en",
  setLang: () => {},
  dir: "ltr"
});

function readInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "he" || saved === "en") return saved;
  } catch {
    /* ignore */
  }
  return "en";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const dir = lang === "he" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.documentElement.setAttribute("data-lang", lang);
  }, [lang]);

  const value = useMemo<LangCtxValue>(
    () => ({ lang, setLang, dir: lang === "he" ? "rtl" : "ltr" }),
    [lang]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/* ---------- Localized values (per-record overrides) ---------- */

/**
 * A "localized" value is either a plain string (English fallback) or
 * an object that contains the value in each supported language.
 */
export type Loc<T = string> = T | { en: T; he: T };

export function loc<T>(value: Loc<T>, lang: Lang): T {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "en" in (value as Record<string, unknown>) &&
    "he" in (value as Record<string, unknown>)
  ) {
    return (value as { en: T; he: T })[lang];
  }
  return value as T;
}

/** Pick a localized value with the current language. */
export function useLoc(): <T>(v: Loc<T>) => T {
  const { lang } = useLang();
  return <T,>(v: Loc<T>) => loc(v, lang);
}
