import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { tips } from "../data/tips";
import Section from "./Section";

const severityStyle = {
  critical: {
    border: "border-terracotta-500/50",
    accent: "bg-terracotta-500/10 text-terracotta-700",
    Icon: ShieldAlert
  },
  warning: {
    border: "border-gold-400/60",
    accent: "bg-gold-400/15 text-sienna-600",
    Icon: AlertTriangle
  },
  info: {
    border: "border-olive-500/40",
    accent: "bg-olive-500/10 text-olive-700",
    Icon: Info
  }
} as const;

export default function TipsSection() {
  return (
    <Section
      id="tips"
      eyebrow="The fine print"
      title="Things Tuscany doesn't tell you"
      kicker="Five small briefings worth memorizing."
      intro="Nine times out of ten the trip goes smoothly. Here are the reminders for the tenth."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {tips.map(tip => {
          const s = severityStyle[tip.severity];
          const { Icon } = s;
          return (
            <div
              key={tip.id}
              className={`card-paper border-l-4 ${s.border} p-5`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${s.accent} shrink-0`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-lg text-ink-900 leading-snug">
                    {tip.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-700/85 leading-relaxed">
                    {tip.body}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
