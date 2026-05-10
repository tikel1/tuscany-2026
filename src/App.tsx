import { useCallback, useRef } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HighlightsCarousel from "./components/HighlightsCarousel";
import TripStats from "./components/TripStats";
import ItinerarySection from "./components/ItinerarySection";
import MapView from "./components/MapView";
import AttractionsGrid from "./components/AttractionsGrid";
import StaysSection from "./components/StaysSection";
import ServicesSection from "./components/ServicesSection";
import ChecklistSection from "./components/ChecklistSection";
import TipsSection from "./components/TipsSection";
import EmergencySection from "./components/EmergencySection";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";
import FloatingMapButton from "./components/FloatingMapButton";
import SectionOrnament from "./components/SectionOrnament";
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

      {/* Slim editorial band right under the hero — "in this issue" */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-2 sm:pb-4 space-y-10 sm:space-y-12">
          <HighlightsCarousel />
          <TripStats />
        </div>
      </section>

      <SectionOrnament className="my-2" />

      <ItinerarySection />
      <SectionOrnament />
      <MapView registerFocus={registerFocus} />
      <SectionOrnament />
      <StaysSection />
      <SectionOrnament />
      <AttractionsGrid />
      <SectionOrnament />
      <ServicesSection />
      <SectionOrnament />
      <TipsSection />
      <SectionOrnament />
      <ChecklistSection />
      <SectionOrnament />
      <EmergencySection />

      <Footer />

      {/* Spacer so content above the bottom nav isn't hidden on mobile */}
      <div className="h-20 md:hidden" aria-hidden />

      <FloatingMapButton />
      <MobileBottomNav />
    </MapFocusContext.Provider>
  );
}
