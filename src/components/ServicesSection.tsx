import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, ShoppingCart, Fuel, MapPin, Navigation } from "lucide-react";
import { services } from "../data/services";
import Section from "./Section";
import { useMapFocus } from "../lib/mapContext";
import { navUrl } from "../lib/nav";

const CATS = [
  { id: "restaurant" as const, label: "Restaurants", Icon: Utensils, color: "text-olive-600" },
  { id: "supermarket" as const, label: "Supermarkets", Icon: ShoppingCart, color: "text-sienna-600" },
  { id: "gas" as const, label: "Gas stations", Icon: Fuel, color: "text-gold-500" }
];

const BASES = [
  { id: "north" as const, label: "Around Larciano", sub: "North base · Aug 17–21" },
  { id: "south" as const, label: "Around Cortevecchia", sub: "South base · Aug 21–26" }
];

export default function ServicesSection() {
  const [base, setBase] = useState<"north" | "south">("north");
  const { focusOn } = useMapFocus();

  return (
    <Section
      id="services"
      eyebrow="The neighborhood"
      title="Eat, shop, refuel"
      kicker="Five-star pasta, last-minute groceries, the right pump."
      intro="A short list of the places worth driving to from each base — local trattorias, full-service supermarkets, and the closest gas stations for the morning runs."
      toned
    >
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide mb-6 sm:mb-8">
        <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
          {BASES.map(b => (
            <button
              key={b.id}
              onClick={() => setBase(b.id)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap min-h-11 ${
                base === b.id
                  ? "bg-ink-900 text-cream-50"
                  : "bg-cream-50 border border-cream-300 text-ink-800 hover:border-terracotta-500/40"
              }`}
            >
              <span>{b.label}</span>
              <span className={`ml-2 text-xs ${base === b.id ? "text-cream-200" : "text-ink-700/60"}`}>
                · {b.sub}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={base}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="grid gap-6 lg:grid-cols-3"
        >
          {CATS.map(({ id, label, Icon, color }) => {
            const items = services.filter(s => s.base === base && s.category === id);
            return (
              <div key={id} className="card-paper p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Icon size={18} className={color} />
                  <h3 className="font-serif text-xl text-ink-900">{label}</h3>
                  <span className="text-xs text-ink-700/60 ml-auto">{items.length}</span>
                </div>
                <ul className="space-y-4">
                  {items.map(it => (
                    <li key={it.id} className="border-b last:border-b-0 border-cream-300/60 pb-4 last:pb-0">
                      <div className="font-medium text-ink-900">{it.name}</div>
                      {it.shortDescription && (
                        <p className="text-xs text-ink-700/85 mt-0.5">{it.shortDescription}</p>
                      )}
                      {it.address && (
                        <div className="text-xs text-ink-700/60 mt-1 flex items-start gap-1">
                          <MapPin size={11} className="mt-0.5 shrink-0" />
                          <span>{it.address}</span>
                        </div>
                      )}
                      {it.hours && (
                        <div className="text-xs text-ink-700/60 mt-0.5">
                          {it.hours}
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                        <a
                          href={navUrl(it.coords)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="icon-link"
                        >
                          <Navigation size={11} /> Navigate
                        </a>
                        <button onClick={() => focusOn(it.id)} className="icon-link">
                          <MapPin size={11} /> On map
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </Section>
  );
}
