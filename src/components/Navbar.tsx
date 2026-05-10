import { useEffect, useState } from "react";
import { getTripState } from "../lib/tripState";
import { useT, type DictKey } from "../lib/dict";
import LanguageSwitcher from "./LanguageSwitcher";

const links: { id: string; key: DictKey }[] = [
  { id: "trip", key: "nav_plan" },
  { id: "map", key: "nav_map" },
  { id: "stays", key: "nav_stays" },
  { id: "attractions", key: "nav_attractions" },
  { id: "services", key: "nav_services" },
  { id: "tips", key: "nav_tips" },
  { id: "checklist", key: "nav_checklist" }
];

export default function Navbar() {
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  const [state] = useState(() => getTripState());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const badge =
    state.phase === "before"
      ? t("badge_d_until", { n: state.daysUntil })
      : state.phase === "during"
      ? t("badge_day_n", { n: state.today.dayNumber })
      : t("badge_done");

  return (
    <nav
      // The top bar always reads LTR — keeps the brand on the left and the
      // language switcher / countdown badge on the right, regardless of the
      // document direction. Hebrew labels still render correctly inside.
      dir="ltr"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream-50/85 backdrop-blur-md border-b border-cream-300/60 shadow-sm"
          : "bg-transparent"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        <button
          onClick={() => handleClick("hero")}
          className="flex items-baseline gap-2 group min-h-11"
        >
          <span className={`font-serif text-xl sm:text-2xl ${scrolled ? "text-ink-900" : "text-ink-900 sm:text-cream-50 sm:drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]"} group-hover:text-terracotta-600 transition-colors`}>
            {t("brand_short")}
          </span>
          <span className="font-serif italic text-terracotta-600 text-base sm:text-lg">{t("brand_year")}</span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <button
              key={l.id}
              onClick={() => handleClick(l.id)}
              className="px-3 py-2 text-sm font-medium text-ink-700 hover:text-terracotta-600 transition-colors"
            >
              {t(l.key)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher onDark={!scrolled} />

          {/* mobile-only countdown badge */}
          <div className="md:hidden">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                scrolled
                  ? "bg-terracotta-500 text-cream-50"
                  : "bg-cream-50/95 text-terracotta-700 shadow-sm"
              }`}
            >
              {badge}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
