import { Phone, MapPin, Globe, ExternalLink } from "lucide-react";
import { emergencyGroups } from "../data/emergency";
import Section from "./Section";
import { useT } from "../lib/dict";
import { useLocalizeEmergencyGroup } from "../data/i18n";

function ItemIcon({ type }: { type: "phone" | "address" | "website" }) {
  if (type === "phone") return <Phone size={14} className="text-terracotta-500" />;
  if (type === "website") return <Globe size={14} className="text-olive-500" />;
  return <MapPin size={14} className="text-sienna-500" />;
}

export default function EmergencySection() {
  const t = useT();
  const localizeGroup = useLocalizeEmergencyGroup();
  return (
    <Section
      id="emergency"
      eyebrow={t("emergency_eyebrow")}
      title={t("emergency_title")}
      kicker={t("emergency_kicker")}
      toned
    >
      {/* Hero 112 banner */}
      <a
        href="tel:112"
        className="group block mb-8 sm:mb-10 rounded-2xl overflow-hidden bg-terracotta-500 text-cream-50 shadow-[0_18px_40px_-18px_rgba(196,90,61,0.55)] hover:shadow-[0_22px_48px_-18px_rgba(196,90,61,0.7)] transition-shadow"
      >
        <div className="px-6 sm:px-10 py-7 sm:py-9 flex items-center gap-6 sm:gap-10">
          <div className="shrink-0 p-3 sm:p-4 rounded-full bg-cream-50/15 backdrop-blur-sm">
            <Phone size={26} className="sm:w-8 sm:h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.32em] opacity-90 font-medium">
              {t("emergency_eyebrow")}
            </div>
            <div className="font-serif text-5xl sm:text-7xl leading-none mt-1" dir="ltr">
              112
            </div>
            <div className="font-serif italic text-sm sm:text-base mt-2 opacity-95">
              {t("emergency_112_lead")}
            </div>
          </div>
          <div className="hidden sm:block text-xs uppercase tracking-[0.2em] opacity-85 group-hover:translate-x-1 transition-transform">
            {t("emergency_call_112")}
          </div>
        </div>
      </a>

      <div className="grid gap-5 md:grid-cols-2">
        {emergencyGroups.map((rawGroup, gi) => {
          const g = localizeGroup(rawGroup, gi);
          return (
          <div key={g.title} className="card-paper p-5">
            <h3 className="font-serif text-xl text-ink-900 mb-4 underline-terracotta">
              {g.title}
            </h3>
            <ul className="space-y-3">
              {g.items.map((it, i) => (
                <li key={i} className="flex gap-3">
                  <div className="mt-1 shrink-0">
                    <ItemIcon type={it.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase tracking-[0.18em] text-ink-700/65 font-medium">
                      {it.label}
                    </div>
                    {it.type === "phone" ? (
                      <a
                        href={`tel:${it.value.replace(/\s+/g, "")}`}
                        className="text-base font-medium text-ink-900 hover:text-terracotta-600 transition-colors break-all"
                      >
                        {it.value}
                      </a>
                    ) : it.link ? (
                      <a
                        href={it.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-medium text-ink-900 hover:text-terracotta-600 transition-colors break-words inline-flex items-center gap-1"
                      >
                        {it.value} <ExternalLink size={11} className="inline" />
                      </a>
                    ) : (
                      <div className="text-base font-medium text-ink-900 break-words">
                        {it.value}
                      </div>
                    )}
                    {it.detail && (
                      <p className="text-xs text-ink-700/75 mt-0.5">{it.detail}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
        })}
      </div>
    </Section>
  );
}
