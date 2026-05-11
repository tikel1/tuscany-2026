import { useEffect, useState } from "react";
import { CalendarDays, Map, Compass, Utensils, MoreHorizontal, Download } from "lucide-react";
import { useT, type DictKey } from "../lib/dict";
import { useLang } from "../lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import { canShowInstallOption, triggerInstallPrompt } from "../lib/install";

// Primary 4 tabs are the "exploring the trip" essentials; the rest of
// the requested nav order lives in the More overlay below.
const TABS: { id: string; key: DictKey; Icon: typeof CalendarDays }[] = [
  { id: "trip",        key: "nav_plan",        Icon: CalendarDays },
  { id: "attractions", key: "nav_attractions", Icon: Compass },
  { id: "food",        key: "nav_food",        Icon: Utensils },
  { id: "map",         key: "nav_map",         Icon: Map },
  { id: "more",        key: "nav_attractions", Icon: MoreHorizontal } // label overridden below
];

const MORE_LINKS: { id: string; key: DictKey }[] = [
  { id: "stays",     key: "nav_stays" },
  { id: "tips",      key: "nav_tips" },
  { id: "checklist", key: "nav_checklist" },
  { id: "emergency", key: "nav_emergency" }
];

const MORE_LABEL: Record<"en" | "he", string> = { en: "More", he: "עוד" };

// Every section that has an anchor on the home page (services has no
// nav entry but still exists on the page, so we track it for active
// highlight detection).
const SECTION_IDS = [
  "trip",
  "map",
  "attractions",
  "services",
  "food",
  "stays",
  "tips",
  "checklist",
  "emergency"
];

// Anything that isn't a primary tab collapses to the "More" tab when
// it's the active section while scrolling.
const MORE_SECTION_IDS = new Set([
  "stays",
  "services",
  "tips",
  "checklist",
  "emergency"
]);

export default function MobileBottomNav() {
  const t = useT();
  const { lang } = useLang();
  const [active, setActive] = useState<string>("trip");
  const [moreOpen, setMoreOpen] = useState(false);
  /* Capture once on mount: whether this device/browser has a meaningful
   * install path AND the app isn't already running standalone. Stable
   * for the session — no point recomputing on every render. */
  const [showInstall] = useState<boolean>(() => canShowInstallOption());

  const handleInstallClick = () => {
    setMoreOpen(false);
    triggerInstallPrompt();
  };

  useEffect(() => {
    const onScroll = () => {
      const fromTop = window.scrollY + window.innerHeight * 0.3;
      let current = SECTION_IDS[0];
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= fromTop) current = id;
      }
      setActive(MORE_SECTION_IDS.has(current) ? "more" : current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (id: string) => {
    setMoreOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink-900/30 backdrop-blur-sm md:hidden"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="absolute bottom-[calc(64px+env(safe-area-inset-bottom))] inset-x-0 bg-cream-50 border-t border-cream-300/70 rounded-t-3xl px-4 pt-3 pb-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-cream-300 rounded-full mx-auto mb-4" />
            <div className="grid grid-cols-2 gap-2">
              {MORE_LINKS.map(l => (
                <button
                  key={l.id}
                  onClick={() => goTo(l.id)}
                  className="text-start bg-cream-100 hover:bg-cream-200 active:bg-cream-300 transition-colors rounded-xl px-4 py-4 text-base font-medium text-ink-900"
                >
                  {t(l.key)}
                </button>
              ))}
            </div>
            {showInstall && (
              <button
                onClick={handleInstallClick}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 active:bg-terracotta-700 text-cream-50 rounded-xl px-4 py-3 text-sm font-medium shadow-sm shadow-terracotta-700/20 transition-colors"
              >
                <Download size={16} />
                {t("install_menu_label")}
              </button>
            )}
            <div className="mt-3 flex justify-center">
              <LanguageSwitcher variant="minimal" />
            </div>
          </div>
        </div>
      )}

      <nav
        className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-cream-50/95 backdrop-blur-md border-t border-cream-300/70 shadow-[0_-4px_24px_rgba(42,31,26,0.08)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="grid grid-cols-5 h-16">
          {TABS.map(({ id, key, Icon }) => {
            const isActive = active === id;
            const label = id === "more" ? MORE_LABEL[lang] : t(key);
            return (
              <li key={id}>
                <button
                  onClick={() => (id === "more" ? setMoreOpen(o => !o) : goTo(id))}
                  className={`w-full h-full flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors active:scale-[0.96] ${
                    isActive ? "text-terracotta-600" : "text-ink-700/70"
                  }`}
                >
                  <span
                    className={`w-10 h-7 flex items-center justify-center rounded-full transition-colors ${
                      isActive ? "bg-terracotta-500/12" : ""
                    }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
                  </span>
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
