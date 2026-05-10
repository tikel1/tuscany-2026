import { motion } from "framer-motion";
import { ArrowRight, MapPin, Sun, Car } from "lucide-react";
import type { Day, ImageCredit, POI } from "../data/types";
import { getAttraction } from "../data/attractions";
import { formatDate } from "../lib/nav";
import { getTripState } from "../lib/tripState";
import { activityIcon } from "../lib/activityIcon";
import { navigateChapter } from "../lib/route";
import PoiImage from "./PoiImage";
import PhotoCredit from "./PhotoCredit";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const tagLabel: Record<string, string> = {
  water: "Water",
  extreme: "Adrenaline",
  nature: "Nature",
  culture: "Culture",
  family: "Family",
  food: "Food",
  view: "View",
  cave: "Cave",
  village: "Village"
};

const regionLabel: Record<string, string> = {
  north: "North",
  south: "South",
  transit: "Transit"
};

interface ResolvedLead {
  src?: string;
  alt: string;
  credit?: ImageCredit;
  category?: POI["category"];
  tags?: POI["tags"];
}

function resolveLead(day: Day): ResolvedLead {
  const fromActivity = day.activities
    .map(a => (a.attractionId ? getAttraction(a.attractionId) : undefined))
    .find(a => !!a?.image);
  if (fromActivity?.image) {
    return {
      src: fromActivity.image,
      alt: fromActivity.name,
      credit: fromActivity.imageCredit,
      category: fromActivity.category,
      tags: fromActivity.tags
    };
  }
  if (day.leadImage) {
    return {
      src: day.leadImage,
      alt: day.title,
      credit: day.leadImageCredit
    };
  }
  const anyAtt = day.activities
    .map(a => (a.attractionId ? getAttraction(a.attractionId) : undefined))
    .find(a => !!a);
  return {
    src: undefined,
    alt: day.title,
    category: anyAtt?.category,
    tags: anyAtt?.tags
  };
}

export default function ChapterCard({ day }: { day: Day }) {
  const tripState = getTripState();
  const isToday =
    tripState.phase === "during" && tripState.today.dayNumber === day.dayNumber;

  const lead = resolveLead(day);
  const previewActivities = day.activities.slice(0, 3);
  const remaining = Math.max(0, day.activities.length - previewActivities.length);

  const accentText =
    day.region === "south"
      ? "text-gold-400"
      : day.region === "transit"
      ? "text-terracotta-300"
      : "text-olive-300";

  return (
    <article
      className={`group h-full flex flex-col rounded-3xl overflow-hidden bg-cream-50 ${
        isToday
          ? "ring-2 ring-terracotta-500 shadow-[0_30px_60px_-30px_rgba(196,90,61,0.55)]"
          : "ring-1 ring-cream-300/70 shadow-[0_18px_40px_-22px_rgba(58,28,15,0.18)]"
      }`}
    >
      {/* Hero photo */}
      <div className="relative aspect-[16/8] sm:aspect-[16/7] overflow-hidden bg-ink-900 shrink-0">
        <PoiImage
          src={lead.src}
          alt={lead.alt}
          region={day.region === "transit" ? "north" : day.region}
          category={lead.category}
          tags={lead.tags}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/55 to-ink-900/15" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-ink-900/40 to-transparent" />

        {lead.credit && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-ink-900/55 backdrop-blur-sm">
            <PhotoCredit credit={lead.credit} variant="light" />
          </div>
        )}

        <div className="absolute top-3 sm:top-4 left-4 sm:left-5 right-4 sm:right-5 flex items-start justify-between gap-2 text-cream-50">
          <div className="flex items-baseline gap-2 sm:gap-3">
            <div className="font-serif text-2xl sm:text-3xl leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
              {ROMAN[day.dayNumber]}
            </div>
            <div className="hidden sm:block h-px w-10 bg-cream-50/40 mb-1.5" />
            <div className={`text-[9px] uppercase tracking-[0.24em] font-medium ${accentText}`}>
              Chapter {String(day.dayNumber).padStart(2, "0")}
            </div>
          </div>
          {isToday && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-terracotta-500 text-cream-50 text-[9px] uppercase tracking-[0.22em] font-bold shadow-[0_4px_18px_rgba(196,90,61,0.5)]">
              <Sun size={10} /> Today
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-5 text-cream-50">
          <div className="flex items-center gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-cream-50/85 font-medium">
            <span>{day.weekday}</span>
            <span aria-hidden>·</span>
            <span>{formatDate(day.date)}</span>
            <span aria-hidden>·</span>
            <span>{regionLabel[day.region]}</span>
          </div>
          <h3 className="mt-1 font-serif text-xl sm:text-3xl leading-[1.05] tracking-tight max-w-md drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            {day.title}
          </h3>
        </div>
      </div>

      {/* Activity preview */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 flex-1 flex flex-col">
        {day.base && (
          <div className="text-[10px] uppercase tracking-[0.22em] text-ink-700/55 font-medium flex items-center gap-1.5 mb-3">
            <MapPin size={10} className="opacity-70" />
            <span className="normal-case tracking-normal">{day.base}</span>
          </div>
        )}

        <ul className="space-y-3 sm:space-y-3.5 flex-1">
          {previewActivities.map((a, i) => {
            const Icon = activityIcon(a);
            return (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-cream-100 ring-1 ring-cream-300/70 text-terracotta-600 flex items-center justify-center">
                  <Icon size={12} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    {a.time && (
                      <span className="text-[10px] uppercase tracking-[0.18em] text-terracotta-600/85 font-medium">
                        {a.time.length > 12 ? a.time.slice(0, 12) + "…" : a.time}
                      </span>
                    )}
                    {a.tag && (
                      <span className="text-[9px] uppercase tracking-[0.18em] text-ink-700/45 font-medium">
                        · {tagLabel[a.tag] ?? a.tag}
                      </span>
                    )}
                  </div>
                  <div className="font-medium text-[14.5px] text-ink-900 leading-snug mt-0.5">
                    {a.title}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {(remaining > 0 || day.driveNotes) && (
          <div className="mt-3 flex items-center gap-3 text-[11px] text-ink-700/65 flex-wrap">
            {remaining > 0 && (
              <span className="inline-flex items-center gap-1">
                <span className="font-semibold text-ink-900">+{remaining}</span> more stop{remaining > 1 ? "s" : ""}
              </span>
            )}
            {day.driveNotes && (
              <span className="inline-flex items-center gap-1.5">
                <Car size={12} className="text-olive-500/85" />
                <span className="font-serif italic">{day.driveNotes.split("·")[0].trim()}</span>
              </span>
            )}
          </div>
        )}

        {/* Read more CTA */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => navigateChapter(day.dayNumber)}
          className="mt-5 sm:mt-6 group/cta inline-flex items-center justify-center gap-2 w-full sm:w-auto sm:self-stretch px-5 py-3 rounded-xl bg-ink-900 text-cream-50 hover:bg-terracotta-600 transition-colors"
        >
          <span className="font-serif italic text-[15px]">Read more</span>
          <ArrowRight
            size={15}
            className="transition-transform group-hover/cta:translate-x-1"
          />
        </motion.button>
      </div>
    </article>
  );
}
