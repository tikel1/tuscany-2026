import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Sparkles } from "lucide-react";
import { attractions } from "../data/attractions";
import { useMapFocus } from "../lib/mapContext";
import { useT, type DictKey } from "../lib/dict";
import { useLocalizePoi } from "../data/i18n";

const TAG_KEY: Record<string, DictKey> = {
  water: "tag_water",
  extreme: "tag_extreme",
  nature: "tag_nature",
  culture: "tag_culture",
  family: "tag_family",
  food: "tag_food",
  view: "tag_view",
  cave: "tag_cave",
  village: "tag_village"
};

const HIGHLIGHT_IDS = [
  "saturnia",
  "civita-di-bagnoregio",
  "pitigliano",
  "cala-del-gesso",
  "sentierelsa",
  "via-cava-san-giuseppe",
  "pisa",
  "abetone-monte-gomito",
  "porto-santo-stefano",
  "lago-di-bolsena"
];

const AUTO_MS = 4500;

export default function HighlightsCarousel() {
  const t = useT();
  const localizePoi = useLocalizePoi();
  const { focusOn } = useMapFocus();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const items = (HIGHLIGHT_IDS
    .map(id => attractions.find(a => a.id === id))
    .filter(Boolean) as typeof attractions).map(localizePoi);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      const sc = scrollerRef.current;
      if (!sc) return;
      const cards = sc.querySelectorAll<HTMLElement>("[data-card]");
      if (!cards.length) return;
      const next = (activeIdx + 1) % cards.length;
      sc.scrollTo({ left: cards[next].offsetLeft - sc.offsetLeft, behavior: "smooth" });
      setActiveIdx(next);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, activeIdx]);

  // Track scroll to keep activeIdx in sync if user manually scrolls
  useEffect(() => {
    const sc = scrollerRef.current;
    if (!sc) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const cards = sc.querySelectorAll<HTMLElement>("[data-card]");
        let nearest = 0;
        let bestDist = Infinity;
        const sl = sc.scrollLeft;
        cards.forEach((c, i) => {
          const d = Math.abs(c.offsetLeft - sc.offsetLeft - sl);
          if (d < bestDist) {
            bestDist = d;
            nearest = i;
          }
        });
        setActiveIdx(nearest);
      });
    };
    sc.addEventListener("scroll", onScroll, { passive: true });
    return () => sc.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (i: number) => {
    const sc = scrollerRef.current;
    if (!sc) return;
    const cards = sc.querySelectorAll<HTMLElement>("[data-card]");
    if (cards[i]) {
      sc.scrollTo({ left: cards[i].offsetLeft - sc.offsetLeft, behavior: "smooth" });
      setActiveIdx(i);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div className="flex items-end justify-between mb-4 sm:mb-5 px-1 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] font-medium text-terracotta-600">
            <Sparkles size={10} />
            {t("highlights_eyebrow")}
          </div>
          <h3 className="mt-1 font-serif text-2xl sm:text-3xl text-ink-900 leading-tight">
            {t("highlights_title")}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 pb-2 shrink-0">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to highlight ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIdx
                  ? "bg-terracotta-500 w-6"
                  : "bg-cream-300 hover:bg-cream-400 w-1.5"
              }`}
            />
          ))}
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollPaddingLeft: "1rem", scrollPaddingRight: "1rem" }}
      >
        {items.map((a, i) => (
          <button
            key={a.id}
            data-card
            onClick={() => focusOn(a.id)}
            className="snap-center shrink-0 group relative w-[78vw] sm:w-[420px] aspect-[4/5] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-cream-200 shadow-[0_4px_24px_-8px_rgba(42,31,26,0.25)] active:scale-[0.99] transition-transform"
          >
            {a.image && (
              <img
                src={a.image}
                alt={a.name}
                loading={i < 2 ? "eager" : "lazy"}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/25 to-transparent" />

            <div className="absolute top-3 start-3 end-3 flex justify-between gap-2">
              <span className={`pill ${a.region === "south" ? "bg-gold-400 text-ink-900" : "bg-olive-500 text-cream-50"}`}>
                {a.region === "south" ? t("region_south_short") : t("region_north_short")}
              </span>
              {a.tags && a.tags[0] && (
                <span className="pill bg-cream-50/95 text-ink-900 backdrop-blur-sm">
                  {t(TAG_KEY[a.tags[0]] ?? "tag_view")}
                </span>
              )}
            </div>

            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-cream-50 text-start">
              <div className="font-serif text-2xl sm:text-3xl leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                {a.name.split(" — ")[0]}
              </div>
              {a.shortDescription && (
                <p className="text-sm text-cream-50/95 mt-1 line-clamp-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                  {a.shortDescription}
                </p>
              )}
              <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium opacity-90">
                <MapPin size={11} /> {t("show_on_map")}
              </div>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
