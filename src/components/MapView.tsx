import { useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { Home, Star, Utensils, ShoppingCart, Fuel, Plane, Navigation, ExternalLink, Maximize2, Route } from "lucide-react";
import { attractions } from "../data/attractions";
import { stays } from "../data/stays";
import { services } from "../data/services";
import type { POI, Category } from "../data/types";
import Section from "./Section";
import { navUrl } from "../lib/nav";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;

interface CategoryConfig {
  id: Category;
  label: string;
  color: string;
  bg: string;
  Icon: typeof Home;
}

const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  stay:        { id: "stay",        label: "Stays",        color: "#C45A3D", bg: "#C45A3D", Icon: Home },
  attraction:  { id: "attraction",  label: "Attractions",  color: "#D9A441", bg: "#D9A441", Icon: Star },
  restaurant:  { id: "restaurant",  label: "Restaurants",  color: "#6B7A4B", bg: "#6B7A4B", Icon: Utensils },
  supermarket: { id: "supermarket", label: "Supermarkets", color: "#3B6FB6", bg: "#3B6FB6", Icon: ShoppingCart },
  gas:         { id: "gas",         label: "Gas",          color: "#B8862C", bg: "#B8862C", Icon: Fuel },
  airport:     { id: "airport",     label: "Airport",      color: "#7A4FB6", bg: "#7A4FB6", Icon: Plane },
  hospital:    { id: "hospital",    label: "Hospital",     color: "#A8472D", bg: "#A8472D", Icon: Plane }
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

// The trip's big movements between bases (lat, lon)
type RouteSegment = {
  id: string;
  label: string;
  day: string;
  color: string;
  coords: [number, number][];
};

const ROUTE_SEGMENTS: RouteSegment[] = [
  {
    id: "arrival",
    label: "Day 1 · Land in Rome, drive north",
    day: "Mon · 17 Aug",
    color: "#C45A3D",
    coords: [
      AIRPORT_POI.coords,
      [42.30, 12.10],
      [43.20, 11.40],
      [43.8267, 10.8978]
    ]
  },
  {
    id: "transfer",
    label: "Day 5 · Transfer to the south, via Sentierelsa",
    day: "Fri · 21 Aug",
    color: "#D9A441",
    coords: [
      [43.8267, 10.8978],
      [43.4720, 11.1700],
      [42.6919, 11.5378]
    ]
  },
  {
    id: "departure",
    label: "Day 9–10 · Final loop to Fiumicino",
    day: "Tue/Wed · 25–26 Aug",
    color: "#6B7A4B",
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
  const allPOIs: POI[] = useMemo(
    () => [...stays, ...attractions, ...services, AIRPORT_POI],
    []
  );

  const [activeCats, setActiveCats] = useState<Set<Category>>(
    new Set<Category>(["stay", "attraction", "airport"])
  );
  const [showRoute, setShowRoute] = useState(true);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

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

  const visible = allPOIs.filter(p => activeCats.has(p.category));

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
      eyebrow="The atlas"
      title="The whole trip on one map"
      kicker="Tap a pin. Trace the route. Filter the rest."
      intro="Every stay, attraction, restaurant, supermarket and gas station — color-coded by category. The dashed line is our actual journey: Rome to Larciano, Larciano to Cortevecchia, Cortevecchia back to Rome."
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
                  {cfg.label}
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
              <span className="text-ink-800">{seg.day}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowRoute(s => !s)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.16em] font-medium transition-colors min-h-9 ${
            showRoute
              ? "bg-terracotta-500 text-cream-50"
              : "bg-cream-50 ring-1 ring-cream-300 text-ink-700 hover:bg-cream-100"
          }`}
        >
          <Route size={12} /> Route {showRoute ? "on" : "off"}
        </button>
      </div>

      <div className="relative card-paper overflow-hidden -mx-4 sm:mx-0 rounded-none sm:rounded-2xl">
        <MapContainer
          center={[42.95, 11.6]}
          zoom={8}
          scrollWheelZoom={true}
          className="h-[70svh] sm:h-[600px] w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />
          <MapController pois={allPOIs} markersRef={markersRef} ref={flyRef} />

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
                          <Navigation size={11} /> Navigate
                        </a>
                        {poi.website && (
                          <a
                            href={poi.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-olive-600 hover:text-olive-700"
                          >
                            <ExternalLink size={11} /> Website
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
          aria-label="Zoom to fit all locations"
          className="absolute top-3 right-3 z-[400] w-10 h-10 rounded-full bg-cream-50/95 backdrop-blur ring-1 ring-cream-300/70 shadow-md hover:bg-terracotta-500 hover:text-cream-50 hover:ring-terracotta-500 transition flex items-center justify-center text-ink-800"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Hovered segment label */}
      {hoveredSegment && (
        <div className="mt-3 text-center text-[12px] sm:text-sm text-ink-700/85 font-serif italic">
          {ROUTE_SEGMENTS.find(s => s.id === hoveredSegment)?.label}
        </div>
      )}
    </Section>
  );
}
