import { Phone, MapPin, Globe, ExternalLink } from "lucide-react";
import { emergencyGroups } from "../data/emergency";
import Section from "./Section";

function ItemIcon({ type }: { type: "phone" | "address" | "website" }) {
  if (type === "phone") return <Phone size={14} className="text-terracotta-500" />;
  if (type === "website") return <Globe size={14} className="text-olive-500" />;
  return <MapPin size={14} className="text-sienna-500" />;
}

export default function EmergencySection() {
  return (
    <Section
      id="emergency"
      eyebrow="Just in case"
      title="Emergency"
      intro="Numbers, hospitals, pharmacies, and consular contacts. The single number to remember anywhere in the EU is 112."
      toned
    >
      <div className="grid gap-5 md:grid-cols-2">
        {emergencyGroups.map(g => (
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
        ))}
      </div>
    </Section>
  );
}
