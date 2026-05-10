import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream-50/85 backdrop-blur-md border-b border-cream-300/60 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => handleClick("hero")}
          className="flex items-baseline gap-2 group"
        >
          <span className="font-serif text-2xl text-ink-900 group-hover:text-terracotta-600 transition-colors">
            Tuscany
          </span>
          <span className="font-serif italic text-terracotta-600 text-lg">'26</span>
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

        <button
          aria-label="Menu"
          className="md:hidden p-2 text-ink-800"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-cream-50 border-t border-cream-300/60">
          <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col">
            {links.map(l => (
              <button
                key={l.id}
                onClick={() => handleClick(l.id)}
                className="text-left px-3 py-3 text-base font-medium text-ink-800 border-b border-cream-200 last:border-b-0"
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
