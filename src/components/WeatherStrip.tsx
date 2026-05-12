import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, CloudSun, Loader2 } from "lucide-react";
import { useT } from "../lib/dict";
import { useLang } from "../lib/i18n";
import type { Lang } from "../lib/lang";

const SPOT_LABEL: Record<"north" | "south", { en: string; he: string }> = {
  north: { en: "Larciano", he: "לרצ'יאנו" },
  south: { en: "Saturnia", he: "סאטורניה" }
};

interface DayForecast {
  date: string;
  tMax: number;
  tMin: number;
  code: number;
}

interface RegionWeather {
  current: number | null;
  days: DayForecast[];
}

const SPOTS = [
  { key: "north", label: "Larciano", lat: 43.8267, lon: 10.8978 },
  { key: "south", label: "Saturnia", lat: 42.6483, lon: 11.5089 }
] as const;

type SpotKey = (typeof SPOTS)[number]["key"];

const CACHE_KEY = "tuscany-weather-v2";
const CACHE_TTL_MS = 60 * 60 * 1000;

function iconFor(code: number, size = 14) {
  if (code === 0) return <Sun size={size} className="text-gold-500" />;
  if (code <= 2) return <CloudSun size={size} className="text-gold-400" />;
  if (code <= 48) return <Cloud size={size} className="text-ink-700/70" />;
  return <CloudRain size={size} className="text-olive-500" />;
}

function dayLabel(iso: string, idx: number, lang: Lang, todayLabel: string): string {
  if (idx === 0) return todayLabel;
  const d = new Date(iso + "T12:00:00");
  if (lang === "he") {
    const heShort = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
    return heShort[d.getDay()];
  }
  return d.toLocaleDateString("en-GB", { weekday: "short" });
}

interface Props {
  variant?: "paper" | "glass";
}

export default function WeatherStrip({ variant = "paper" }: Props = {}) {
  const t = useT();
  const { lang } = useLang();
  const [data, setData] = useState<Record<string, RegionWeather> | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [mobileRegion, setMobileRegion] = useState<SpotKey>("north");

  const isGlass = variant === "glass";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.savedAt < CACHE_TTL_MS) {
            if (!cancelled) {
              setData(parsed.data);
              setLoading(false);
            }
            return;
          }
        }
        const result: Record<string, RegionWeather> = {};
        await Promise.all(
          SPOTS.map(async spot => {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${spot.lat}&longitude=${spot.lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Europe%2FRome&forecast_days=4`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(String(res.status));
            const json = await res.json();
            result[spot.key] = {
              current: json.current?.temperature_2m ?? null,
              days: (json.daily?.time ?? []).map((date: string, i: number) => ({
                date,
                tMax: Math.round(json.daily.temperature_2m_max[i]),
                tMin: Math.round(json.daily.temperature_2m_min[i]),
                code: json.daily.weather_code[i]
              }))
            };
          })
        );
        if (!cancelled) {
          setData(result);
          setLoading(false);
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ savedAt: Date.now(), data: result })
          );
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div
        data-compact-ui
        className={`px-3 py-2 inline-flex items-center gap-2 text-xs ${
          isGlass
            ? "rounded-full bg-cream-50/15 backdrop-blur-md text-cream-50/85 border border-cream-50/20"
            : "card-paper text-ink-700/70"
        }`}
      >
        <Loader2 className="animate-spin" size={12} /> {t("weather_loading")}
      </div>
    );
  }

  if (!data) return null;

  const wrapperClasses = isGlass
    ? "rounded-2xl bg-cream-50/12 backdrop-blur-md text-cream-50 border border-cream-50/20 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.35)]"
    : "card-paper";
  const labelText = isGlass ? "text-cream-50/70" : "text-ink-700/60";
  const tempStrong = isGlass ? "text-cream-50" : "text-ink-900";
  const tempMuted = isGlass ? "text-cream-50/70" : "text-ink-700/55";
  const triggerHint = isGlass ? "text-gold-300" : "text-terracotta-600";
  const dividerClass = isGlass ? "border-cream-50/15" : "border-cream-300/70";
  const dayLabelClass = isGlass ? "text-cream-50/75" : "text-ink-700/65";
  const dayTempStrong = isGlass ? "text-cream-50" : "text-ink-900";
  const dayTempMuted = isGlass ? "text-cream-50/65" : "text-ink-700/55";

  const tabActive = isGlass
    ? "bg-cream-50/25 text-cream-50 shadow-sm"
    : "bg-terracotta-500/15 text-ink-900 ring-1 ring-terracotta-500/25";
  const tabIdle = isGlass
    ? "text-cream-50/65 hover:bg-cream-50/10"
    : "text-ink-700/70 hover:bg-cream-100/80";

  function renderRegionSummary(weather: Record<string, RegionWeather>, spotKey: SpotKey) {
    const w = weather[spotKey];
    if (!w) return null;
    return (
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        {iconFor(w.days[0]?.code ?? 0, 16)}
        <span className={`text-[10px] uppercase tracking-[0.14em] font-medium ${labelText}`}>
          {SPOT_LABEL[spotKey][lang]}
        </span>
        <span className={`text-base sm:text-sm font-semibold tabular-nums ${tempStrong}`}>
          {w.current !== null ? `${Math.round(w.current)}°` : "—"}
        </span>
        <span className={`text-xs sm:text-[11px] tabular-nums ${tempMuted}`}>
          {t("weather_high_low", { high: String(w.days[0]?.tMax ?? "—"), low: String(w.days[0]?.tMin ?? "—") })}
        </span>
      </div>
    );
  }

  function renderForecastGrid(weather: Record<string, RegionWeather>, spotKey: SpotKey, showTopBorder?: boolean) {
    const w = weather[spotKey];
    if (!w) return null;
    return (
      <div
        className={`flex justify-between gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 sm:overflow-visible scrollbar-hide ${
          showTopBorder ? `border-t pt-3 ${dividerClass}` : ""
        }`}
      >
        {w.days.slice(0, 4).map((d, i) => (
          <div key={d.date} className="flex flex-col items-center gap-1 text-[11px] min-w-[3.25rem] shrink-0">
            <span className={`font-medium ${dayLabelClass}`}>{dayLabel(d.date, i, lang, t("today"))}</span>
            {iconFor(d.code, 14)}
            <span className={`font-medium tabular-nums ${dayTempStrong}`}>
              {d.tMax}°
              <span className={dayTempMuted}>/{d.tMin}°</span>
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`${wrapperClasses} max-w-full`} data-compact-ui>
      {/* Mobile: region tabs + one row per tap; expandable multi-day */}
      <div className="sm:hidden">
        <div className="flex rounded-xl p-1 gap-1 bg-black/[0.06] mx-3 mt-3 mb-1">
          {SPOTS.map(spot => (
            <button
              key={spot.key}
              type="button"
              onClick={() => setMobileRegion(spot.key)}
              className={`flex-1 rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors min-h-[44px] ${
                mobileRegion === spot.key ? tabActive : tabIdle
              }`}
            >
              <span className="block truncate">{lang === "he" ? SPOT_LABEL[spot.key].he : SPOT_LABEL[spot.key].en}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex flex-col items-stretch gap-2 px-3 py-3 text-left"
          aria-expanded={open}
        >
          {renderRegionSummary(data, mobileRegion)}
          <div className="flex items-center justify-center gap-2">
            <span className={`text-[10px] uppercase tracking-[0.18em] font-medium ${triggerHint}`}>
              {open ? (lang === "he" ? "הסתר תחזית" : "Hide forecast") : (lang === "he" ? "תחזית 4 ימים" : "4-day outlook")}
            </span>
            <span
              className={`transition-transform text-[11px] leading-none ${open ? "rotate-180" : ""} ${
                isGlass ? "text-cream-50/70" : "text-ink-700/50"
              }`}
              aria-hidden
            >
              ▾
            </span>
          </div>
        </button>
        {open && <div className="px-3 pb-3">{renderForecastGrid(data, mobileRegion, true)}</div>}
      </div>

      {/* Desktop / sm+: original combined header + two-column grid */}
      <div className="hidden sm:block">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left"
          aria-expanded={open}
        >
          <div className="flex items-center gap-4 lg:gap-6 min-w-0 flex-wrap">
            {SPOTS.map(spot => {
              const w = data[spot.key];
              if (!w) return null;
              return (
                <div key={spot.key} className="flex items-center gap-1.5 shrink-0">
                  {iconFor(w.days[0]?.code ?? 0, 14)}
                  <span className={`text-[10px] uppercase tracking-[0.16em] font-medium ${labelText}`}>
                    {SPOT_LABEL[spot.key][lang]}
                  </span>
                  <span className={`text-sm font-semibold tabular-nums ${tempStrong}`}>
                    {w.current !== null ? `${Math.round(w.current)}°` : "—"}
                  </span>
                  <span className={`text-[11px] tabular-nums ${tempMuted}`}>
                    {w.days[0]?.tMax}°/{w.days[0]?.tMin}°
                  </span>
                </div>
              );
            })}
          </div>
          <span className={`text-[10px] uppercase tracking-[0.18em] font-medium shrink-0 ${triggerHint}`}>
            {open ? (lang === "he" ? "סגור" : "Hide") : (lang === "he" ? "תחזית" : "Forecast")}
          </span>
          <span
            className={`transition-transform shrink-0 text-[12px] leading-none ${open ? "rotate-180" : ""} ${
              isGlass ? "text-cream-50/70" : "text-ink-700/50"
            }`}
            aria-hidden
          >
            ▾
          </span>
        </button>

        {open && (
          <div className={`border-t px-3 py-3 grid grid-cols-2 gap-x-4 sm:gap-x-6 ${dividerClass}`}>
            {SPOTS.map(spot => (
              <div key={spot.key}>{renderForecastGrid(data, spot.key)}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
