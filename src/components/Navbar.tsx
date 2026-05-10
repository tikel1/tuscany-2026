import { useEffect, useState } from "react";
import { getTripState } from "../lib/tripState";

const links = [
  { id: "trip", label: "Trip" },
  { id: "map", label: "Map" },
  { id: "attractions", label: "Attractions" },
  { id: "stays", label: "Stays" },
  { id: "services", label: "Eat & Shop" },
  { id: "tips", label: "Tips" },
  { id: "checklist", label: "Checklist" }
];

export default function Navbar() {
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
      ? `${state.daysUntil}d`
      : state.phase === "during"
      ? `Day ${state.today.dayNumber}`
      : "Done";

  return (
    <nav
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
            Tuscany
          </span>
          <span className="font-serif italic text-terracotta-600 text-base sm:text-lg">'26</span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <button
              key={l.id}
              onClick={() => handleClick(l.id)}
              className="px-3 py-2 text-sm font-medium text-ink-700 hover:text-terracotta-600 transition-colors"
            >
              {l.label}
            </button>
          ))}
        </div>

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
    </nav>
  );
}
