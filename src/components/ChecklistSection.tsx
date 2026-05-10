import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, AlertCircle, Briefcase, ClipboardCheck } from "lucide-react";
import { bookingChecklist, packingChecklist } from "../data/checklist";
import Section from "./Section";
import type { ChecklistItem } from "../data/types";

const STORAGE_KEY = "tuscany-checklist-v1";

function loadChecked(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function ChecklistList({
  items,
  checked,
  onToggle
}: {
  items: ChecklistItem[];
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  return (
    <ul className="space-y-3">
      {items.map(item => {
        const isDone = !!checked[item.id];
        return (
          <li
            key={item.id}
            className={`card-paper p-4 transition-opacity ${isDone ? "opacity-60" : ""}`}
          >
            <label className="flex gap-3 cursor-pointer items-start">
              <input
                type="checkbox"
                checked={isDone}
                onChange={() => onToggle(item.id)}
                className="mt-1 w-4 h-4 accent-terracotta-500 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <span
                    className={`font-medium ${isDone ? "line-through text-ink-700/60" : "text-ink-900"}`}
                  >
                    {item.text}
                  </span>
                  {item.urgent && !isDone && (
                    <span className="pill pill-terracotta">
                      <AlertCircle size={10} /> book early
                    </span>
                  )}
                </div>
                {item.detail && (
                  <p className="text-xs text-ink-700/80 mt-1 leading-relaxed">{item.detail}</p>
                )}
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="icon-link mt-1.5"
                  >
                    <ExternalLink size={11} /> Open link
                  </a>
                )}
              </div>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export default function ChecklistSection() {
  const [tab, setTab] = useState<"booking" | "packing">("booking");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setChecked(loadChecked());
  }, []);

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const list = tab === "booking" ? bookingChecklist : packingChecklist;
  const doneCount = list.filter(i => checked[i.id]).length;

  return (
    <Section
      id="checklist"
      eyebrow="Don't forget"
      title="Checklists"
      intro="A pre-trip booking list and a packing list. Your ticks are saved on this device."
    >
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          onClick={() => setTab("booking")}
          className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            tab === "booking"
              ? "bg-ink-900 text-cream-50"
              : "bg-cream-50 border border-cream-300 text-ink-800 hover:border-terracotta-500/40"
          }`}
        >
          <ClipboardCheck size={14} />
          Pre-trip bookings
          <span className={`text-xs ${tab === "booking" ? "text-cream-200" : "text-ink-700/60"}`}>
            {bookingChecklist.filter(i => checked[i.id]).length}/{bookingChecklist.length}
          </span>
        </button>
        <button
          onClick={() => setTab("packing")}
          className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            tab === "packing"
              ? "bg-ink-900 text-cream-50"
              : "bg-cream-50 border border-cream-300 text-ink-800 hover:border-terracotta-500/40"
          }`}
        >
          <Briefcase size={14} />
          Packing
          <span className={`text-xs ${tab === "packing" ? "text-cream-200" : "text-ink-700/60"}`}>
            {packingChecklist.filter(i => checked[i.id]).length}/{packingChecklist.length}
          </span>
        </button>
      </div>

      <div className="text-xs text-ink-700/60 mb-6">
        {doneCount}/{list.length} done
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          <ChecklistList items={list} checked={checked} onToggle={toggle} />
        </motion.div>
      </AnimatePresence>
    </Section>
  );
}
