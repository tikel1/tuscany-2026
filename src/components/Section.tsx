import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
  toned?: boolean;
}

export default function Section({ id, eyebrow, title, intro, children, toned }: Props) {
  return (
    <section
      id={id}
      className={`relative py-20 sm:py-24 ${toned ? "bg-cream-100/60" : ""}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10"
        >
          <div className="section-eyebrow">{eyebrow}</div>
          <h2 className="section-title underline-terracotta">{title}</h2>
          {intro && (
            <p className="mt-5 text-base sm:text-lg text-ink-700/85 max-w-2xl leading-relaxed">
              {intro}
            </p>
          )}
        </motion.div>
        {children}
      </div>
    </section>
  );
}
