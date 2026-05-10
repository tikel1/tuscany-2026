import { useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Home, Star, Utensils, ShoppingCart, Fuel, Plane, Navigation, ExternalLink } from "lucide-react";
import { attractions } from "../data/attractions";
import { stays } from "../data/stays";
import { services } from "../data/services";
import type { POI, Category } from "../data/types";
import Section from "./Section";
import { navUrl } from "../lib/nav";

// fix leaflet's default marker assets in vite (we use custom divIcons anyway)
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

function makeIcon(cat: Category): L.DivIcon {
  const cfg = CATEGORY_CONFIG[cat];
  const html = `
    <div style="
      width:32px;height:32px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:${cfg.bg};
      border:2px solid #FBF7EC;
      box-shadow:0 4px 10px rgba(42,31,26,0.35);
      display:flex;align-items:center;justify-content:center;">
      <div style="transform:rotate(45deg);color:#FBF7EC;font-size:14px;line-height:1;font-weight:700;">
        ${categoryGlyph(cat)}
      </div>
    </div>`;
  return L.divIcon({
    html,
    className: "tuscany-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 30],
    popupAnchor: [0, -28]
  });
}

function categoryGlyph(cat: Category): string {
  switch (cat) {
    case "stay": return "&#8962;";       // house
    case "attraction": return "&#9733;"; // star
    case "restaurant": return "&#127860;"; // fork+knife (might fall back)
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

interface FlyHandle {
  flyToId: (id: string) => void;
}

const MapController = forwardRef<FlyHandle, { pois: POI[]; markersRef: React.MutableRefObject<Record<string, L.Marker | null>> }>(
  function MapController({ pois, markersRef }, ref) {
    const map = useMap();
    useImperativeHandle(ref, () => ({
      flyToId: (id: string) => {
        const poi = pois.find(p => p.id === id);
        if (!poi) return;
        map.flyTo(poi.coords, Math.max(map.getZoom(), 12), { duration: 1.0 });
        const m = markersRef.current[id];
        if (m) {
          setTimeout(() => m.openPopup(), 700);
        }
      }
    }), [map, pois, markersRef]);
    return null;
  }
);

interface Props {
  registerFocus: (fn: (id: string) => void) => void;
}

export default function MapView({ registerFocus }: Props) {
  const allPOIs: POI[] = useMemo(
    () => [...stays, ...attractions, ...services, AIRPORT_POI],
    []
  );

  const [activeCats, setActiveCats] = useState<Set<Category>>(
    new Set<Category>(["stay", "attraction", "restaurant", "supermarket", "gas", "airport"])
  );

  const markersRef = useRef<Record<string, L.Marker | null>>({});
  const flyRef = useRef<FlyHandle>(null);

  useEffect(() => {
    registerFocus((id: string) => {
      // make sure category is on
      const poi = allPOIs.find(p => p.id === id);
      if (poi && !activeCats.has(poi.category)) {
        setActiveCats(prev => new Set(prev).add(poi.category));
      }
      // give react a tick to mount the marker, then fly
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
      eyebrow="Everything in one place"
      title="The Map"
      intro="Stays, attractions, restaurants, supermarkets and gas stations — colour-coded and filterable."
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {(["stay", "attraction", "restaurant", "supermarket", "gas", "airport"] as Category[]).map(c => {
          const cfg = CATEGORY_CONFIG[c];
          const on = activeCats.has(c);
          const Icon = cfg.Icon;
          return (
            <button
              key={c}
              onClick={() => toggle(c)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                on
                  ? "text-cream-50 shadow-sm"
                  : "bg-cream-50 text-ink-700 border-cream-300 opacity-60 hover:opacity-100"
              }`}
              style={on ? { backgroundColor: cfg.color, borderColor: cfg.color } : undefined}
            >
              <Icon size={12} />
              {cfg.label}
              <span className={`text-[10px] ${on ? "text-cream-200" : "text-ink-700/60"}`}>
                {allPOIs.filter(p => p.category === c).length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="card-paper overflow-hidden">
        <MapContainer
          center={[42.95, 11.3]}
          zoom={8}
          scrollWheelZoom={true}
          className="h-[560px] w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController pois={allPOIs} markersRef={markersRef} ref={flyRef} />
          {visible.map(poi => (
            <Marker
              key={poi.id}
              position={poi.coords}
              icon={makeIcon(poi.category)}
              ref={(ref) => {
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
          ))}
        </MapContainer>
      </div>
    </Section>
  );
}
