import { Heart } from "lucide-react";
import { useT } from "../lib/dict";
import { useLang } from "../lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Footer() {
  const t = useT();
  const { lang } = useLang();
  return (
    <footer className="border-t border-cream-300/60 bg-gradient-to-b from-cream-100/0 to-cream-100/80 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="text-center max-w-xl mx-auto">
          <div className="text-[10px] uppercase tracking-[0.32em] text-terracotta-600 font-medium">
            {lang === "he" ? "קולופון" : "Colophon"}
          </div>
          <h3 className="mt-3 font-serif text-3xl sm:text-4xl text-ink-900 leading-tight">
            {t("footer_made_with")}
          </h3>
          <p className="mt-3 font-serif italic text-ink-700/80 text-base sm:text-lg">
            {lang === "he"
              ? "אתר אחד קטן, קיץ אחד גדול."
              : "One small website, one big summer."}
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-700/70 flex-wrap">
            <span className="font-serif">{t("brand_short")}</span>
            <span className="font-serif italic text-terracotta-600">{t("brand_year")}</span>
            <span aria-hidden>·</span>
            <span>{lang === "he" ? "17 — 26 באוגוסט 2026" : "17 — 26 August 2026"}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              {lang === "he" ? "נבנה ב" : "built with"}{" "}
              <Heart size={10} className="text-terracotta-500 fill-terracotta-500" />
            </span>
          </div>
          <div className="mt-3 text-[11px] uppercase tracking-[0.22em] text-ink-700/45 font-serif italic">
            Buon viaggio.
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.22em] text-ink-700/55">
              {t("footer_lang_label")}
            </span>
            <LanguageSwitcher variant="minimal" />
          </div>
          <div className="mt-4 text-[10px] text-ink-700/45 leading-relaxed max-w-md mx-auto">
            {t("footer_attribution")}
          </div>
        </div>
      </div>
    </footer>
  );
}
