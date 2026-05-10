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
      eyebrow="The list"
      title="Things to book, things to pack"
      kicker="Tick as you go. The list remembers."
      intro="A pre-trip booking list and a what-fits-in-the-suitcase list. Your progress is saved on this device — no account, no nagging."
    >
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide mb-2">
        <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
          <button
            onClick={() => setTab("booking")}
            className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap min-h-11 ${
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
            className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap min-h-11 ${
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
      </div>

      <div className="mb-6 flex items-center gap-3">
        {/* progress ring */}
        <div className="relative w-10 h-10 shrink-0" aria-hidden>
          <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-cream-300/80"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="text-terracotta-500 transition-[stroke-dasharray] duration-500"
              strokeDasharray={`${
                list.length === 0 ? 0 : (doneCount / list.length) * 100
              } 100`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-ink-900">
            {Math.round((doneCount / Math.max(1, list.length)) * 100)}%
          </div>
        </div>
        <div className="text-sm text-ink-700/85">
          <span className="font-semibold text-ink-900">{doneCount}</span> of{" "}
          {list.length} done · {list.length - doneCount === 0 ? "you're set" : `${list.length - doneCount} to go`}
        </div>
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
