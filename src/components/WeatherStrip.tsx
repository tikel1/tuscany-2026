import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, CloudSun, Loader2 } from "lucide-react";

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
  { key: "north", label: "North · Larciano", lat: 43.8267, lon: 10.8978 },
  { key: "south", label: "South · Saturnia", lat: 42.6483, lon: 11.5089 }
] as const;

const CACHE_KEY = "tuscany-weather-v1";
const CACHE_TTL_MS = 60 * 60 * 1000;

function iconFor(code: number, size = 18) {
  if (code === 0) return <Sun size={size} className="text-gold-500" />;
  if (code <= 2) return <CloudSun size={size} className="text-gold-400" />;
  if (code <= 48) return <Cloud size={size} className="text-ink-700/70" />;
  return <CloudRain size={size} className="text-olive-500" />;
}

function dayLabel(iso: string, idx: number): string {
  if (idx === 0) return "Today";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short" });
}

export default function WeatherStrip() {
  const [data, setData] = useState<Record<string, RegionWeather> | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-center gap-2 py-3 text-sm text-ink-700/70">
        <Loader2 className="animate-spin" size={14} /> Loading weather…
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {SPOTS.map(spot => {
        const w = data[spot.key];
        if (!w) return null;
        return (
          <div
            key={spot.key}
            className="card-paper p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              {iconFor(w.days[0]?.code ?? 0, 28)}
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-[0.2em] text-terracotta-600 font-medium">
                  {spot.label}
                </div>
                <div className="text-2xl font-serif text-ink-900 leading-none mt-1">
                  {w.current !== null ? `${Math.round(w.current)}°C` : "—"}
                </div>
              </div>
            </div>
            <div className="flex gap-3 text-xs">
              {w.days.slice(0, 4).map((d, i) => (
                <div key={d.date} className="flex flex-col items-center gap-1">
                  <span className="text-ink-700/70 font-medium">{dayLabel(d.date, i)}</span>
                  {iconFor(d.code, 14)}
                  <span className="text-ink-800 font-medium">
                    {d.tMax}°
                    <span className="text-ink-700/60">/{d.tMin}°</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
