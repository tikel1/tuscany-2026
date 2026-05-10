import { useLang } from "../../lib/i18n";
import type {
  POI,
  Stay,
  Service,
  Day,
  Tip,
  ChecklistItem,
  EmergencyGroup,
  Dish,
  Winery
} from "../types";
import { attractionsHE } from "./attractions.he";
import { staysHE } from "./stays.he";
import { servicesHE } from "./services.he";
import { itineraryHE } from "./itinerary.he";
import { tipsHE } from "./tips.he";
import { checklistHE } from "./checklist.he";
import { emergencyHE } from "./emergency.he";
import { dishesHE } from "./dishes.he";
import { wineriesHE } from "./wineries.he";

function mergeIfDefined<T extends object>(
  base: T,
  overrides?: Partial<Record<keyof T, unknown>> | undefined
): T {
  if (!overrides) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(overrides)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

/* ---------- Attractions / POIs (incl. stays + services) ---------- */

export function localizePoi(p: POI, lang: "en" | "he"): POI {
  if (lang === "en") return p;
  if (p.id in attractionsHE) return mergeIfDefined(p, attractionsHE[p.id]);
  if (p.id in staysHE) return mergeIfDefined(p, staysHE[p.id]) as POI;
  if (p.id in servicesHE) return mergeIfDefined(p, servicesHE[p.id]) as POI;
  return p;
}

export function localizeStay(s: Stay, lang: "en" | "he"): Stay {
  if (lang === "en") return s;
  return mergeIfDefined(s, staysHE[s.id]) as Stay;
}

export function localizeService(s: Service, lang: "en" | "he"): Service {
  if (lang === "en") return s;
  return mergeIfDefined(s, servicesHE[s.id]) as Service;
}

/* ---------- Days / Itinerary ---------- */

export function localizeDay(d: Day, lang: "en" | "he"): Day {
  if (lang === "en") return d;
  const he = itineraryHE[d.dayNumber];
  if (!he) return d;
  const baseMerged = mergeIfDefined(d, {
    title: he.title,
    subtitle: he.subtitle,
    base: he.base,
    driveNotes: he.driveNotes,
    gear: he.gear,
    dayTips: he.dayTips
  });
  if (!he.activities) return baseMerged;
  const activities = d.activities.map((a, i) => {
    const aHe = he.activities?.[i];
    return mergeIfDefined(a, {
      time: aHe?.time,
      title: aHe?.title,
      description: aHe?.description
    });
  });
  return { ...baseMerged, activities };
}

/* ---------- Tips ---------- */

export function localizeTip(t: Tip, lang: "en" | "he"): Tip {
  if (lang === "en") return t;
  return mergeIfDefined(t, tipsHE[t.id]);
}

/* ---------- Checklist ---------- */

export function localizeChecklistItem(
  item: ChecklistItem,
  lang: "en" | "he"
): ChecklistItem {
  if (lang === "en") return item;
  return mergeIfDefined(item, checklistHE[item.id]);
}

/* ---------- Emergency (positional, since contacts have no ids) ---------- */

export function localizeEmergencyGroup(
  group: EmergencyGroup,
  index: number,
  lang: "en" | "he"
): EmergencyGroup {
  if (lang === "en") return group;
  const he = emergencyHE[index];
  if (!he) return group;
  const items = group.items.map((it, i) => {
    const heItem = he.items?.[i];
    if (!heItem) return it;
    return mergeIfDefined(it, {
      label: heItem.label,
      value: heItem.value,
      detail: heItem.detail
    });
  });
  return { ...group, title: he.title ?? group.title, items };
}

/* ---------- Food & Wine ---------- */

export function localizeDish(d: Dish, lang: "en" | "he"): Dish {
  if (lang === "en") return d;
  return mergeIfDefined(d, dishesHE[d.id]);
}

export function localizeWinery(w: Winery, lang: "en" | "he"): Winery {
  if (lang === "en") return w;
  return mergeIfDefined(w, wineriesHE[w.id]);
}

/* ---------- Hooks (most components use these) ---------- */

export function useLocalizePoi() {
  const { lang } = useLang();
  return (p: POI) => localizePoi(p, lang);
}
export function useLocalizeStay() {
  const { lang } = useLang();
  return (s: Stay) => localizeStay(s, lang);
}
export function useLocalizeService() {
  const { lang } = useLang();
  return (s: Service) => localizeService(s, lang);
}
export function useLocalizeDay() {
  const { lang } = useLang();
  return (d: Day) => localizeDay(d, lang);
}
export function useLocalizeTip() {
  const { lang } = useLang();
  return (t: Tip) => localizeTip(t, lang);
}
export function useLocalizeChecklistItem() {
  const { lang } = useLang();
  return (it: ChecklistItem) => localizeChecklistItem(it, lang);
}
export function useLocalizeEmergencyGroup() {
  const { lang } = useLang();
  return (group: EmergencyGroup, idx: number) =>
    localizeEmergencyGroup(group, idx, lang);
}
export function useLocalizeDish() {
  const { lang } = useLang();
  return (d: Dish) => localizeDish(d, lang);
}
export function useLocalizeWinery() {
  const { lang } = useLang();
  return (w: Winery) => localizeWinery(w, lang);
}
