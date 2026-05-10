import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  id: string;
  eyebrow: string;
  title: string;
  /** A short italic subtitle shown right under the headline */
  kicker?: string;
  intro?: string;
  children: ReactNode;
  toned?: boolean;
  /** When true, headline + intro center themselves */
  center?: boolean;
}

export default function Section({
  id,
  eyebrow,
  title,
  kicker,
  intro,
  children,
  toned,
  center
}: Props) {
  return (
    <section
      id={id}
      className={`relative py-14 sm:py-24 lg:py-28 scroll-mt-20 ${
        toned ? "bg-cream-100/60" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={`mb-8 sm:mb-12 ${center ? "text-center mx-auto max-w-2xl" : "max-w-3xl"}`}
        >
          <div className={`flex items-center gap-3 ${center ? "justify-center" : ""}`}>
            <span className="h-px w-8 bg-terracotta-500/60" aria-hidden />
            <div className="section-eyebrow !mt-0">{eyebrow}</div>
          </div>
          <h2 className="mt-3 font-serif text-[34px] sm:text-5xl lg:text-[56px] text-ink-900 leading-[1.02] tracking-tight">
            {title}
          </h2>
          {kicker && (
            <p className="mt-3 font-serif italic text-terracotta-700/85 text-lg sm:text-xl">
              {kicker}
            </p>
          )}
          {intro && (
            <p className="mt-4 sm:mt-5 text-[15px] sm:text-lg text-ink-700/85 leading-relaxed">
              {intro}
            </p>
          )}
        </motion.header>
        {children}
      </div>
    </section>
  );
}
