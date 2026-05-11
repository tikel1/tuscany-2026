import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { type Lang, loc, type Loc } from "./lang";

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

/** Pick a localized value with the current language. */
export function useLoc(): <T>(v: Loc<T>) => T {
  const { lang } = useLang();
  return <T,>(v: Loc<T>) => loc(v, lang);
}
