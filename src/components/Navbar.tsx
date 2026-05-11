import { useEffect, useState } from "react";
import { useT, type DictKey } from "../lib/dict";
import LanguageSwitcher from "./LanguageSwitcher";

// Nav order requested by the user: Plan → Places → Food → Map →
// Stays → Tips → Lists → Emergency. Services (local gas /
// supermarket) intentionally lives on the page but not in the nav.
const links: { id: string; key: DictKey }[] = [
  { id: "trip",        key: "nav_plan" },
  { id: "attractions", key: "nav_attractions" },
  { id: "food",        key: "nav_food" },
  { id: "map",         key: "nav_map" },
  { id: "stays",       key: "nav_stays" },
  { id: "tips",        key: "nav_tips" },
  { id: "checklist",   key: "nav_checklist" },
  { id: "emergency",   key: "nav_emergency" }
];

export default function Navbar() {
  const t = useT();
  const [scrolled, setScrolled] = useState(false);

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
        </div>
      </div>
    </nav>
  );
}
