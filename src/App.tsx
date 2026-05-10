import { useCallback, useRef } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WeatherStrip from "./components/WeatherStrip";
import ItinerarySection from "./components/ItinerarySection";
import MapView from "./components/MapView";
import AttractionsGrid from "./components/AttractionsGrid";
import StaysSection from "./components/StaysSection";
import ServicesSection from "./components/ServicesSection";
import ChecklistSection from "./components/ChecklistSection";
import TipsSection from "./components/TipsSection";
import EmergencySection from "./components/EmergencySection";
import Footer from "./components/Footer";
import { MapFocusContext } from "./lib/mapContext";

export default function App() {
  const focusFnRef = useRef<((id: string) => void) | null>(null);

  const focusOn = useCallback((id: string) => {
    if (focusFnRef.current) focusFnRef.current(id);
  }, []);

  const registerFocus = useCallback((fn: (id: string) => void) => {
    focusFnRef.current = fn;
  }, []);

  return (
    <MapFocusContext.Provider value={{ focusOn }}>
      <Navbar />
      <Hero />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-14 relative z-10">
        <WeatherStrip />
      </div>

      <ItinerarySection />
      <MapView registerFocus={registerFocus} />
      <AttractionsGrid />
      <StaysSection />
      <ServicesSection />
      <TipsSection />
      <ChecklistSection />
      <EmergencySection />
      <Footer />
    </MapFocusContext.Provider>
  );
}
