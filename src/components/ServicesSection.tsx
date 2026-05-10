import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, ShoppingCart, Fuel, MapPin } from "lucide-react";
import { services } from "../data/services";
import Section from "./Section";
import { useMapFocus } from "../lib/mapContext";
import NavigateLinks from "./NavigateLinks";
import { useT, type DictKey } from "../lib/dict";
import { useLang } from "../lib/i18n";
import { useLocalizeService } from "../data/i18n";

const CATS: { id: "restaurant" | "supermarket" | "gas"; key: DictKey; Icon: typeof Utensils; color: string }[] = [
  { id: "restaurant", key: "services_filter_restaurant", Icon: Utensils, color: "text-olive-600" },
  { id: "supermarket", key: "services_filter_supermarket", Icon: ShoppingCart, color: "text-sienna-600" },
  { id: "gas", key: "services_filter_gas", Icon: Fuel, color: "text-gold-500" }
];

const BASES: {
  id: "north" | "south";
  key: DictKey;
  sub: { en: string; he: string };
}[] = [
  {
    id: "north",
    key: "services_filter_north",
    sub: { en: "Aug 17–21 · Larciano", he: "17–21 באוגוסט · לרצ'יאנו" }
  },
  {
    id: "south",
    key: "services_filter_south",
    sub: { en: "Aug 21–26 · Cortevecchia", he: "21–26 באוגוסט · קורטווקיה" }
  }
];

export default function ServicesSection() {
  const t = useT();
  const { lang } = useLang();
  const localizeService = useLocalizeService();
  const [base, setBase] = useState<"north" | "south">("north");
  const { focusOn } = useMapFocus();

  return (
    <Section
      id="services"
      eyebrow={t("services_eyebrow")}
      title={t("services_title")}
      kicker={t("services_kicker")}
      toned
    >
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide mb-6 sm:mb-8">
        <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
          {BASES.map(b => {
            const subText = b.sub[lang];
            return (
              <button
                key={b.id}
                onClick={() => setBase(b.id)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap min-h-11 ${
                  base === b.id
                    ? "bg-ink-900 text-cream-50"
                    : "bg-cream-50 border border-cream-300 text-ink-800 hover:border-terracotta-500/40"
                }`}
              >
                <span>{t(b.key)}</span>
                <span className={`ms-2 text-xs ${base === b.id ? "text-cream-200" : "text-ink-700/60"}`}>
                  · {subText}
                </span>
              </button>
            );
          })}
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
          {CATS.map(({ id, key, Icon, color }) => {
            const items = services
              .filter(s => s.base === base && s.category === id)
              .map(localizeService);
            return (
              <div key={id} className="card-paper p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Icon size={18} className={color} />
                  <h3 className="font-serif text-xl text-ink-900">{t(key)}</h3>
                  <span className="text-xs text-ink-700/60 ms-auto">{items.length}</span>
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
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <NavigateLinks coords={it.coords} size={11} />
                        <button onClick={() => focusOn(it.id)} className="icon-link">
                          <MapPin size={11} /> {t("on_the_map_short")}
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
