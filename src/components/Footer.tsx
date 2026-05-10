import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-cream-300/60 bg-cream-100/40 mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-2xl text-ink-900">Tuscany</span>
          <span className="font-serif italic text-terracotta-600 text-lg">'26</span>
          <span className="text-xs text-ink-700/70 ml-3">17 – 26 August 2026</span>
        </div>
        <div className="text-xs text-ink-700/70 flex items-center gap-1.5">
          Made with <Heart size={11} className="text-terracotta-500 fill-terracotta-500" /> for the family · Buon viaggio
        </div>
      </div>
    </footer>
  );
}
