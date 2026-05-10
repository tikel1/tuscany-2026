import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Navigation } from "lucide-react";
import type { POI } from "../data/types";
import { navUrl } from "../lib/nav";
import { useT } from "../lib/dict";

const COLOR_BY_CATEGORY: Record<string, string> = {
  stay: "#C45A3D",
  attraction: "#D9A441",
  restaurant: "#6B7A4B",
  supermarket: "#3B6FB6",
  gas: "#B8862C",
  airport: "#7A4FB6",
  hospital: "#A8472D"
};

function shade(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0xff) + amt));
  return "#" + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

function makePinIcon(color: string, n: number, isHero = false): L.DivIcon {
  const size = isHero ? 38 : 32;
  return L.divIcon({
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        <div style="
          position:absolute;inset:0;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          background:linear-gradient(135deg, ${color} 0%, ${shade(color, -15)} 100%);
          border:2px solid #FBF7EC;
          box-shadow:0 6px 14px rgba(42,31,26,0.4);
          display:flex;align-items:center;justify-content:center;
        ">
          <div style="transform:rotate(45deg);color:#FBF7EC;font-weight:700;font-size:${
            isHero ? 14 : 12
          }px;line-height:1;">${n}</div>
        </div>
      </div>
    `,
    className: "tuscany-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size - 2],
    popupAnchor: [0, -size + 4]
  });
}

function FitBounds({ pois }: { pois: POI[] }) {
  const map = useMap();
  useEffect(() => {
    if (pois.length === 0) return;
    if (pois.length === 1) {
      map.setView(pois[0].coords, 11);
      return;
    }
    const bounds = L.latLngBounds(pois.map(p => p.coords));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
  }, [pois, map]);
  return null;
}

export default function MiniMap({ pois }: { pois: POI[] }) {
  const t = useT();
  if (pois.length === 0) {
    return (
      <div className="h-64 sm:h-80 rounded-2xl bg-cream-100 ring-1 ring-cream-300/70 flex items-center justify-center text-ink-700/55 text-sm font-serif italic">
        {t("no_locations_for_chapter")}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-cream-300/70 shadow-[0_18px_40px_-22px_rgba(58,28,15,0.18)]">
      <MapContainer
        center={pois[0].coords}
        zoom={10}
        scrollWheelZoom={false}
        className="h-72 sm:h-96 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        <FitBounds pois={pois} />

        {pois.map((poi, i) => {
          const color = COLOR_BY_CATEGORY[poi.category] ?? "#C45A3D";
          return (
            <Marker
              key={poi.id}
              position={poi.coords}
              icon={makePinIcon(color, i + 1, poi.category === "stay")}
            >
              <Popup>
                <div className="font-sans">
                  <div className="font-serif text-sm text-ink-900 leading-tight">
                    <span className="text-terracotta-600 font-semibold mr-1">
                      {i + 1}.
                    </span>
                    {poi.name}
                  </div>
                  {poi.shortDescription && (
                    <p className="text-xs text-ink-700/85 mt-1 leading-snug">
                      {poi.shortDescription}
                    </p>
                  )}
                  <a
                    href={navUrl(poi.coords)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-terracotta-600 hover:text-terracotta-700 mt-1.5"
                  >
                    <Navigation size={11} /> {t("navigate")}
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
