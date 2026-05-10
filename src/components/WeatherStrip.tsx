import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, CloudSun, Loader2 } from "lucide-react";
import { useT } from "../lib/dict";
import { useLang, type Lang } from "../lib/i18n";

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

  return (
    <div className={wrapperClasses}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-3.5 py-2 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 sm:gap-5 min-w-0 overflow-x-auto scrollbar-hide">
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
                <span className={`text-xs tabular-nums ${tempMuted}`}>
                  {w.days[0]?.tMax}°/{w.days[0]?.tMin}°
                </span>
              </div>
            );
          })}
        </div>
        <span className={`text-[10px] uppercase tracking-[0.18em] font-medium shrink-0 hidden sm:inline ${triggerHint}`}>
          {open ? (lang === "he" ? "סגור" : "Hide") : (lang === "he" ? "תחזית" : "Forecast")}
        </span>
        <span
          className={`transition-transform shrink-0 ${open ? "rotate-180" : ""} ${
            isGlass ? "text-cream-50/70" : "text-ink-700/50"
          }`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open && (
        <div className={`border-t px-3.5 py-3 grid grid-cols-2 gap-x-6 ${dividerClass}`}>
          {SPOTS.map(spot => {
            const w = data[spot.key];
            if (!w) return null;
            return (
              <div key={spot.key} className="flex justify-between gap-2">
                {w.days.slice(0, 4).map((d, i) => (
                  <div key={d.date} className="flex flex-col items-center gap-1 text-[11px]">
                    <span className={`font-medium ${dayLabelClass}`}>{dayLabel(d.date, i, lang, t("today"))}</span>
                    {iconFor(d.code, 13)}
                    <span className={`font-medium tabular-nums ${dayTempStrong}`}>
                      {d.tMax}°
                      <span className={dayTempMuted}>/{d.tMin}°</span>
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
