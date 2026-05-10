import { useEffect, useState } from "react";
import { Map } from "lucide-react";
import { useT } from "../lib/dict";

export default function FloatingMapButton() {
  const t = useT();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const map = document.getElementById("map");
      if (!map) return;
      const mapRect = map.getBoundingClientRect();
      // hide when the map itself is on screen, otherwise show after hero
      const past = window.scrollY > window.innerHeight * 0.6;
      const mapVisible = mapRect.top < window.innerHeight && mapRect.bottom > 0;
      setShow(past && !mapVisible);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() =>
        document.getElementById("map")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      className="fixed z-30 end-4 sm:end-6 md:end-8 bottom-[calc(80px+env(safe-area-inset-bottom))] md:bottom-8 inline-flex items-center gap-2 rounded-full bg-ink-900 text-cream-50 px-4 py-3 shadow-lg shadow-ink-900/30 active:scale-95 transition-transform"
      aria-label={t("open_map")}
    >
      <Map size={16} />
      <span className="text-sm font-medium">{t("nav_map")}</span>
    </button>
  );
}
