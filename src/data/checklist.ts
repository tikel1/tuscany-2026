import type { ChecklistItem } from "./types";

export const bookingChecklist: ChecklistItem[] = [
  {
    id: "book-canyon-park",
    text: "Booked ✓ — Canyon Park SUP (18 Aug, 10:45)",
    detail:
      "6 boards reserved for the 10:45 slot. Payment is cash on site (€168). Confirmation is in Itay's email."
  },
  {
    id: "book-argentario-boat",
    text: "Booked ✓ — Argentario catamaran cruise (23 Aug)",
    detail: "GetYourGuide / DONNINI, 5 adults + 5 kids. Snorkel gear & lunch included on board. Check in at the Porto Santo Stefano pier by 08:30. Confirmation is in Itay's email."
  },
  {
    id: "book-private-chef",
    text: "Book a private chef for the villa (21 Aug)",
    detail: "Chef-at-Home Tuscany / Eatwith / Airbnb Experiences. Pici workshop + dinner for the family.",
    link: "https://www.eatwith.com/",
    urgent: true
  },
  {
    id: "book-rafting",
    text: "Booked ✓ — Soft rafting, Serchio (19 Aug, 09:30)",
    detail: "GetYourGuide / Lucca Rafting, whole group. Guide, gear & wetsuits included. Check in at Chifenti by 09:25. Confirmation is in Itay's email."
  },
  {
    id: "book-horses",
    text: "Reserve a Maremma horseback hour",
    detail: "Beginner-friendly ranch near Alberese / Albinia. Early-morning slot is best."
  },
  {
    id: "international-driving-permit",
    text: "Pick up an International Driving Permit for the driver",
    detail: "Required at the rental counter alongside your home licence. Get it before you fly."
  },
  {
    id: "credit-card-on-driver-name",
    text: "Make sure the rental driver has a credit card in their own name",
    detail: "Debit cards usually rejected. The deposit hold can be €1,500+."
  },
  {
    id: "esim",
    text: "Sort out an Italian eSIM",
    detail: "Airalo / Holafly / Nomad — 10 GB Italy plan is plenty. Activate at the airport."
  }
];

export const packingChecklist: ChecklistItem[] = [
  {
    id: "water-shoes",
    text: "Closed-toe water shoes — for everyone",
    detail: "Sentierelsa, Saturnia, the Serchio. No sandals, no flip-flops."
  },
  {
    id: "dry-bag",
    text: "Dry bag (10–20 L)",
    detail: "Phones, wallets, car keys on the SUP and on the boat at Argentario."
  },
  {
    id: "snorkels",
    text: "Snorkel & mask per person (optional now)",
    detail: "The Argentario catamaran provides snorkel gear on board — only pack your own if the kids prefer their own mask."
  },
  {
    id: "uv-shirts",
    text: "UV / lycra rashguards",
    detail: "Hours on an open boat in August — sunscreen alone won't do it."
  },
  {
    id: "headlamps",
    text: "Headlamps (small, per person)",
    detail: "For Vitozza cave dwellings and the Vie Cave at dusk."
  },
  {
    id: "reef-sunscreen",
    text: "High-SPF reef-safe sunscreen + after-sun",
    detail: "The Italian sun in August is brutal."
  },
  {
    id: "first-aid",
    text: "Mini first-aid kit",
    detail: "Plasters, antiseptic, kids' paracetamol, antihistamine, anti-diarrheal."
  },
  {
    id: "swim-towels",
    text: "Quick-dry microfibre towels",
    detail: "One per person — for river walks and beach stops."
  },
  {
    id: "reusable-bottles",
    text: "Reusable water bottles",
    detail: "Tap water is fine almost everywhere; refill at fountains."
  },
  {
    id: "power-adapter",
    text: "EU power adapters + multi-port USB charger",
    detail: "Italian sockets are mostly type F/L."
  },
  {
    id: "kids-snacks",
    text: "Kids' snack stash",
    detail: "First night arrival is late; no time for proper shopping."
  }
];
