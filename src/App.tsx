import { useCallback, useRef } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TripStats from "./components/TripStats";
import ItinerarySection from "./components/ItinerarySection";
import MapView from "./components/MapView";
import AttractionsGrid from "./components/AttractionsGrid";
import StaysSection from "./components/StaysSection";
import ServicesSection from "./components/ServicesSection";
import FoodAndWineSection from "./components/FoodAndWineSection";
import ChecklistSection from "./components/ChecklistSection";
import TipsSection from "./components/TipsSection";
import EmergencySection from "./components/EmergencySection";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";
import FloatingMapButton from "./components/FloatingMapButton";
import SectionOrnament from "./components/SectionOrnament";
import ChapterDetailPage from "./components/ChapterDetailPage";
import InstallPrompt from "./components/InstallPrompt";
import Gemininio from "./components/Gemininio";
import { MapFocusContext } from "./lib/mapContext";
import { useHashRoute } from "./lib/route";

export default function App() {
  const focusFnRef = useRef<((id: string) => void) | null>(null);
  const route = useHashRoute();

  const focusOn = useCallback((id: string) => {
    if (focusFnRef.current) focusFnRef.current(id);
  }, []);

  const registerFocus = useCallback((fn: (id: string) => void) => {
    focusFnRef.current = fn;
  }, []);

  if (route.kind === "chapter") {
    return (
      <>
        <ChapterDetailPage dayNumber={route.day} />
        {/* The Add-to-Home-Screen coachmark lives at the app root so it
            shows regardless of which page the user landed on. */}
        <InstallPrompt />
        {/* Gemininio is also globally available, including inside a
            chapter — useful when reading about a specific day. */}
        <Gemininio />
      </>
    );
  }

  return (
    <MapFocusContext.Provider value={{ focusOn }}>
      <Navbar />
      <Hero />

      {/* The Plan — the magazine's main feature, leads everything else */}
      <ItinerarySection />

      <SectionOrnament />
      <MapView registerFocus={registerFocus} />

      <SectionOrnament />
      <AttractionsGrid />

      <SectionOrnament />
      <ServicesSection />

      <SectionOrnament />
      <FoodAndWineSection />

      <SectionOrnament />
      <StaysSection />

      <SectionOrnament />
      <TipsSection />

      <SectionOrnament />
      <ChecklistSection />

      <SectionOrnament />
      <EmergencySection />

      {/* By the numbers — the trip in stats, as a closing flourish */}
      <section className="relative py-14 sm:py-20 bg-cream-100/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <TripStats />
        </div>
      </section>

      <Footer />

      {/* Spacer so content above the bottom nav isn't hidden on mobile */}
      <div className="h-20 md:hidden" aria-hidden />

      <FloatingMapButton />
      <MobileBottomNav />
      <InstallPrompt />
      <Gemininio />
    </MapFocusContext.Provider>
  );
}
