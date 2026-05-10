import { useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { Home, Star, Utensils, ShoppingCart, Fuel, Plane, Navigation, ExternalLink, Maximize2, Route, Sparkles } from "lucide-react";
import { attractions } from "../data/attractions";
import { stays } from "../data/stays";
import { services } from "../data/services";
import type { POI, Category } from "../data/types";
import Section from "./Section";
import { navUrl } from "../lib/nav";
import { useT, type DictKey } from "../lib/dict";
import { useLang } from "../lib/i18n";
import { useLocalizePoi } from "../data/i18n";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;

interface CategoryConfig {
  id: Category;
  labelKey: DictKey;
  color: string;
  bg: string;
  Icon: typeof Home;
}

/* "Tuscan terra & sea" palette — earth tones throughout with one
   calmed dusk-blue accent for the airport. Designed to sit on top of
   the Stamen Watercolor base without clashing. */
const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  stay:        { id: "stay",        labelKey: "cat_stay",        color: "#A23E2A", bg: "#A23E2A", Icon: Home },         // warm brick
  attraction:  { id: "attraction",  labelKey: "cat_attraction",  color: "#C68A2A", bg: "#C68A2A", Icon: Star },         // burnished bronze
  restaurant:  { id: "restaurant",  labelKey: "cat_restaurant",  color: "#5C7244", bg: "#5C7244", Icon: Utensils },     // cypress green
  supermarket: { id: "supermarket", labelKey: "cat_supermarket", color: "#587A8E", bg: "#587A8E", Icon: ShoppingCart }, // soft slate
  gas:         { id: "gas",         labelKey: "cat_gas",         color: "#8B6F4A", bg: "#8B6F4A", Icon: Fuel },         // caramel sienna
  airport:     { id: "airport",     labelKey: "cat_airport",     color: "#3D4F65", bg: "#3D4F65", Icon: Plane },        // twilight indigo
  hospital:    { id: "hospital",    labelKey: "cat_hospital",    color: "#8C2E25", bg: "#8C2E25", Icon: Plane }         // deep oxblood
};

function makeIcon(cat: Category, isHero = false): L.DivIcon {
  const cfg = CATEGORY_CONFIG[cat];
  const size = isHero ? 38 : 30;
  const html = `
    <div style="
      position:relative;
      width:${size}px;height:${size}px;
    ">
      <div style="
        position:absolute;inset:0;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        background:linear-gradient(135deg, ${cfg.bg} 0%, ${shade(cfg.bg, -15)} 100%);
        border:2px solid #FBF7EC;
        box-shadow:0 6px 14px rgba(42,31,26,0.4);
        display:flex;align-items:center;justify-content:center;
      ">
        <div style="transform:rotate(45deg);color:#FBF7EC;font-size:${isHero ? 16 : 13}px;line-height:1;font-weight:700;">
          ${categoryGlyph(cat)}
        </div>
      </div>
      ${isHero ? `<div style="position:absolute;top:-6px;right:-6px;width:14px;height:14px;border-radius:50%;background:#FBF7EC;border:2px solid #C45A3D;box-shadow:0 2px 4px rgba(0,0,0,0.2);"></div>` : ""}
    </div>`;
  return L.divIcon({
    html,
    className: "tuscany-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size - 2],
    popupAnchor: [0, -size + 4]
  });
}

function shade(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0xff) + amt));
  return "#" + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

function categoryGlyph(cat: Category): string {
  switch (cat) {
    case "stay": return "&#8962;";
    case "attraction": return "&#9733;";
    case "restaurant": return "&#127860;";
    case "supermarket": return "&#128722;";
    case "gas": return "&#9981;";
    case "airport": return "&#9992;";
    default: return "&#9679;";
  }
}

const AIRPORT_POI: POI = {
  id: "fco",
  name: "Rome Fiumicino — FCO",
  category: "airport",
  region: "transit",
  description: "Leonardo da Vinci International Airport. Arrival 17 Aug, departure 26 Aug 05:00.",
  shortDescription: "Arrival & departure airport.",
  coords: [41.8003, 12.2389]
};

const AIRPORT_POI_HE: POI = {
  ...AIRPORT_POI,
  name: "רומא פיומיצ'ינו — FCO",
  description: "נמל התעופה הבינלאומי על שם ליאונרדו דה וינצ'י. נחיתה ב־17.8, המראה ב־26.8 בשעה 05:00.",
  shortDescription: "שדה התעופה — נחיתה והמראה."
};

// The trip's big movements between bases (lat, lon)
type RouteSegment = {
  id: string;
  labelKey: DictKey;
  dayKey: DictKey;
  color: string;
  coords: [number, number][];
};

const ROUTE_SEGMENTS: RouteSegment[] = [
  {
    id: "arrival",
    labelKey: "map_seg_arrival",
    dayKey: "map_seg_arrival_short",
    color: "#A23E2A", // brick — matches Stays
    coords: [
      AIRPORT_POI.coords,
      [42.30, 12.10],
      [43.20, 11.40],
      [43.8267, 10.8978]
    ]
  },
  {
    id: "transfer",
    labelKey: "map_seg_transfer",
    dayKey: "map_seg_transfer_short",
    color: "#C68A2A", // bronze — matches Attractions
    coords: [
      [43.8267, 10.8978],
      [43.4720, 11.1700],
      [42.6919, 11.5378]
    ]
  },
  {
    id: "departure",
    labelKey: "map_seg_departure",
    dayKey: "map_seg_departure_short",
    color: "#5C7244", // cypress — matches Restaurants
    coords: [
      [42.6919, 11.5378],
      [42.6275, 11.7989],
      [42.4234, 12.1053],
      AIRPORT_POI.coords
    ]
  }
];

interface FlyHandle {
  flyToId: (id: string) => void;
  fitAll: () => void;
}

const MapController = forwardRef<
  FlyHandle,
  { pois: POI[]; markersRef: React.MutableRefObject<Record<string, L.Marker | null>> }
>(function MapController({ pois, markersRef }, ref) {
  const map = useMap();
  useImperativeHandle(
    ref,
    () => ({
      flyToId: (id: string) => {
        const poi = pois.find(p => p.id === id);
        if (!poi) return;
        map.flyTo(poi.coords, Math.max(map.getZoom(), 12), { duration: 1.0 });
        const m = markersRef.current[id];
        if (m) {
          setTimeout(() => m.openPopup(), 700);
        }
      },
      fitAll: () => {
        if (pois.length === 0) return;
        const bounds = L.latLngBounds(pois.map(p => p.coords));
        map.flyToBounds(bounds, { padding: [40, 40], duration: 1.1, maxZoom: 11 });
      }
    }),
    [map, pois, markersRef]
  );
  return null;
});

interface Props {
  registerFocus: (fn: (id: string) => void) => void;
}

export default function MapView({ registerFocus }: Props) {
  const t = useT();
  const { lang } = useLang();
  const localizePoi = useLocalizePoi();
  const allPOIs: POI[] = useMemo(
    () => [...stays, ...attractions, ...services, AIRPORT_POI],
    []
  );
  const localizedPOIs = useMemo(
    () =>
      allPOIs.map(p => {
        if (p.id === "fco") return lang === "he" ? AIRPORT_POI_HE : p;
        return localizePoi(p);
      }),
    [allPOIs, localizePoi, lang]
  );

  const [activeCats, setActiveCats] = useState<Set<Category>>(
    new Set<Category>(["stay", "attraction", "airport"])
  );
  const [showRoute, setShowRoute] = useState(true);
  const [showSpokes, setShowSpokes] = useState(true);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  /* Day-trip "spokes": from each base stay out to every attraction in the
     same region. Lets you see at a glance which excursions belong to which
     half of the trip. We compute them once from the raw (unlocalized) data
     since the geometry doesn't depend on language. */
  const spokes = useMemo(() => {
    const northBase = stays.find(s => s.region === "north");
    const southBase = stays.find(s => s.region === "south");
    const lines: { id: string; from: [number, number]; to: [number, number]; color: string }[] = [];
    for (const a of attractions) {
      const base = a.region === "south" ? southBase : northBase;
      if (!base) continue;
      lines.push({
        id: `spoke-${a.id}`,
        from: base.coords,
        to: a.coords,
        color: a.region === "south" ? "#C68A2A" : "#5C7244"
      });
    }
    return lines;
  }, []);

  const markersRef = useRef<Record<string, L.Marker | null>>({});
  const flyRef = useRef<FlyHandle>(null);

  useEffect(() => {
    registerFocus((id: string) => {
      const poi = allPOIs.find(p => p.id === id);
      if (poi && !activeCats.has(poi.category)) {
        setActiveCats(prev => new Set(prev).add(poi.category));
      }
      setTimeout(() => {
        flyRef.current?.flyToId(id);
        const el = document.getElementById("map");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    });
  }, [registerFocus, allPOIs, activeCats]);

  const visible = localizedPOIs.filter(p => activeCats.has(p.category));

  const toggle = (c: Category) => {
    setActiveCats(prev => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  return (
    <Section
      id="map"
      eyebrow={t("map_eyebrow")}
      title={t("map_title")}
      kicker={t("map_kicker")}
      intro={t("map_intro")}
    >
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide mb-3">
        <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
          {(["stay", "attraction", "restaurant", "supermarket", "gas", "airport"] as Category[]).map(
            c => {
              const cfg = CATEGORY_CONFIG[c];
              const on = activeCats.has(c);
              const Icon = cfg.Icon;
              return (
                <button
                  key={c}
                  onClick={() => toggle(c)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition-all whitespace-nowrap min-h-9 ${
                    on
                      ? "text-cream-50 shadow-sm"
                      : "bg-cream-50 text-ink-700 border-cream-300 opacity-60 hover:opacity-100 active:opacity-100"
                  }`}
                  style={
                    on ? { backgroundColor: cfg.color, borderColor: cfg.color } : undefined
                  }
                >
                  <Icon size={13} />
                  {t(cfg.labelKey)}
                  <span
                    className={`text-[10px] ${
                      on ? "text-cream-200" : "text-ink-700/60"
                    }`}
                  >
                    {allPOIs.filter(p => p.category === c).length}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Route ribbon: legend + toggle */}
      <div className="flex items-center justify-between gap-3 mb-3 px-1 flex-wrap">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {ROUTE_SEGMENTS.map(seg => (
            <button
              key={seg.id}
              type="button"
              onClick={() => setHoveredSegment(s => (s === seg.id ? null : seg.id))}
              onMouseEnter={() => setHoveredSegment(seg.id)}
              onMouseLeave={() => setHoveredSegment(null)}
              className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] font-medium transition-opacity ${
                showRoute ? "opacity-100" : "opacity-40"
              }`}
            >
              <span
                className="block w-6 h-[3px] rounded-full"
                style={{
                  background: `repeating-linear-gradient(90deg, ${seg.color} 0 4px, transparent 4px 8px)`
                }}
              />
              <span className="text-ink-800">{t(seg.dayKey)}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSpokes(s => !s)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.16em] font-medium transition-colors min-h-9 text-cream-50 ${
              showSpokes ? "" : "opacity-60 hover:opacity-100"
            }`}
            style={{ backgroundColor: showSpokes ? "#5C7244" : "#5C7244AA" }}
            aria-pressed={showSpokes}
          >
            <Sparkles size={12} /> {showSpokes ? t("map_spokes_on") : t("map_spokes_off")}
          </button>
          <button
            onClick={() => setShowRoute(s => !s)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.16em] font-medium transition-colors min-h-9 text-cream-50 ${
              showRoute ? "" : "opacity-60 hover:opacity-100"
            }`}
            style={{ backgroundColor: showRoute ? "#A23E2A" : "#A23E2AAA" }}
            aria-pressed={showRoute}
          >
            <Route size={12} /> {showRoute ? t("map_route_on") : t("map_route_off")}
          </button>
        </div>
      </div>

      <div className="relative card-paper overflow-hidden -mx-4 sm:mx-0 rounded-none sm:rounded-2xl">
        <MapContainer
          center={[42.95, 11.6]}
          zoom={8}
          scrollWheelZoom={true}
          className="h-[70svh] sm:h-[600px] w-full"
        >
          {/* CartoDB Voyager — warm, editorial off-cream tiles that pair
              nicely with the Tuscan palette. Free for low-traffic personal
              use, no API key required (Stadia's Stamen Watercolor blocks
              non-localhost without an account, which is why we moved off it). */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />
          <MapController pois={allPOIs} markersRef={markersRef} ref={flyRef} />

          {/* Day-trip spokes — soft lines from each base to its region's
              attractions. Drawn underneath the main route so they don't
              compete visually. Hidden when attractions or stays are filtered out. */}
          {showSpokes &&
            activeCats.has("attraction") &&
            activeCats.has("stay") &&
            spokes.map(s => (
              <Polyline
                key={s.id}
                positions={[s.from, s.to]}
                pathOptions={{
                  color: s.color,
                  weight: 1.5,
                  opacity: 0.55,
                  dashArray: "2 6",
                  lineCap: "round"
                }}
                interactive={false}
              />
            ))}

          {/* Route polylines */}
          {showRoute &&
            ROUTE_SEGMENTS.map(seg => {
              const isHover = hoveredSegment === seg.id;
              const isDimmed = hoveredSegment !== null && !isHover;
              return (
                <Polyline
                  key={seg.id}
                  positions={seg.coords}
                  pathOptions={{
                    color: seg.color,
                    weight: isHover ? 6 : 4,
                    opacity: isDimmed ? 0.25 : isHover ? 1 : 0.85,
                    dashArray: "10 8",
                    lineCap: "round",
                    lineJoin: "round"
                  }}
                  eventHandlers={{
                    mouseover: () => setHoveredSegment(seg.id),
                    mouseout: () => setHoveredSegment(null)
                  }}
                />
              );
            })}

          {visible.map(poi => {
            // mark the airport + stays as 'hero' (slightly bigger ringed pin)
            const isHero = poi.category === "stay" || poi.category === "airport";
            return (
              <Marker
                key={poi.id}
                position={poi.coords}
                icon={makeIcon(poi.category, isHero)}
                ref={ref => {
                  markersRef.current[poi.id] = ref;
                }}
              >
                <Popup>
                  <div className="font-sans">
                    {poi.image && (
                      <div
                        className="w-full h-28 bg-cream-200 bg-cover bg-center"
                        style={{ backgroundImage: `url(${poi.image})` }}
                      />
                    )}
                    <div className="p-3">
                      <div className="font-serif text-base text-ink-900 leading-tight">
                        {poi.name}
                      </div>
                      {poi.shortDescription && (
                        <p className="text-xs text-ink-700/85 mt-1 leading-snug">
                          {poi.shortDescription}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                        <a
                          href={navUrl(poi.coords)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-terracotta-600 hover:text-terracotta-700"
                        >
                          <Navigation size={11} /> {t("navigate")}
                        </a>
                        {poi.website && (
                          <a
                            href={poi.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-olive-600 hover:text-olive-700"
                          >
                            <ExternalLink size={11} /> {t("website")}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Fit-All button */}
        <button
          type="button"
          onClick={() => flyRef.current?.fitAll()}
          aria-label={t("map_zoom_fit")}
          className="absolute top-3 end-3 z-[400] w-10 h-10 rounded-full bg-cream-50/95 backdrop-blur ring-1 ring-cream-300/70 shadow-md hover:bg-terracotta-500 hover:text-cream-50 hover:ring-terracotta-500 transition flex items-center justify-center text-ink-800"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Hovered segment label */}
      {hoveredSegment && (
        <div className="mt-3 text-center text-[12px] sm:text-sm text-ink-700/85 font-serif italic">
          {(() => {
            const seg = ROUTE_SEGMENTS.find(s => s.id === hoveredSegment);
            return seg ? t(seg.labelKey) : null;
          })()}
        </div>
      )}
    </Section>
  );
}
