import { motion } from "framer-motion";
import { CalendarDays, MapPin, Plane } from "lucide-react";

export default function Hero() {
  return (
    <header
      id="hero"
      className="relative min-h-[88vh] flex items-end overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1568797629192-789acf8e4df3?auto=format&fit=crop&w=2400&q=80')"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/30 via-ink-900/10 to-cream-50" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24 pt-32 w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-cream-50/85 backdrop-blur-sm border border-cream-300/60 px-3 py-1 text-xs font-medium text-terracotta-600 uppercase tracking-[0.2em] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500" />
            Family trip · 10 days
          </div>

          <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl text-cream-50 leading-[0.95] drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]">
            Tuscany
            <span className="block italic text-terracotta-400 text-5xl sm:text-6xl lg:text-7xl mt-2">
              August 2026
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-cream-100/95 max-w-xl leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
            Turquoise canyons, Etruscan rock corridors, dawn at the hot springs,
            a private chef in the villa, and a small boat in the Argentario coves.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-cream-50/90 backdrop-blur-sm px-4 py-2 text-sm font-medium text-ink-800 shadow-sm">
              <CalendarDays size={16} className="text-terracotta-500" />
              17 – 26 August
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-cream-50/90 backdrop-blur-sm px-4 py-2 text-sm font-medium text-ink-800 shadow-sm">
              <MapPin size={16} className="text-olive-500" />
              North &amp; South Tuscany
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-cream-50/90 backdrop-blur-sm px-4 py-2 text-sm font-medium text-ink-800 shadow-sm">
              <Plane size={16} className="text-sienna-500" />
              In &amp; out of Rome FCO
            </span>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
