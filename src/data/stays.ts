import type { Stay } from "./types";

export const stays: Stay[] = [
  {
    id: "stay-larciano",
    name: "Home in Larciano",
    category: "stay",
    region: "north",
    shortDescription: "Private Tuscan home, base for the northern half of the trip",
    description:
      "Your base for the active northern week. Larciano sits between Pistoia and Lucca, putting you within an easy drive of Bagni di Lucca, Pisa, Abetone and the Sentierelsa river walk.",
    image: "./images/stay-larciano-sunflowers.png",
    gallery: [
      "./images/stay-larciano-vineyard.png",
      "./images/stay-larciano-pool.png",
      "./images/stay-larciano-pool-dusk.png"
    ],
    imageCredit: {
      author: "Host photo",
      license: "Airbnb listing",
      source: "https://www.airbnb.com/rooms/1554711",
      licenseUrl: "https://www.airbnb.com/help/article/2855"
    },
    website: "https://www.airbnb.com/rooms/1554711",
    bookingLink: "https://www.airbnb.com/rooms/1554711",
    address: "Larciano (PT), Tuscany",
    coords: [43.8267, 10.8978],
    checkIn: "2026-08-17",
    checkOut: "2026-08-21",
    nights: 4,
    highlights: [
      "Private home with kitchen — easy with kids",
      "Central for the northern itinerary (Canyon Park, Pisa, Abetone)",
      "Drive to Bagni di Lucca ~1 h, Pisa ~45 min, Abetone ~1 h"
    ]
  },
  {
    id: "stay-cortevecchia",
    name: "Tenuta Cortevecchia",
    category: "stay",
    region: "south",
    shortDescription: "Restored farm estate near Saturnia — your southern base",
    description:
      "A 2,000-hectare organic estate in the rolling Maremma hills, just 17 km from the Saturnia hot springs. Apartment-style stays with private pool, perfect for an evening with a private chef. Remote setting — bring everything you need from Manciano.",
    image: "./images/stay-cortevecchia-poolview.png",
    gallery: [
      "./images/stay-cortevecchia-villa.png",
      "./images/stay-cortevecchia-pool-deck.png",
      "./images/stay-cortevecchia-aerial.png"
    ],
    imageCredit: {
      author: "Tenuta Cortevecchia",
      license: "Property photo",
      source: "https://tenutacortevecchia.it/en/photo-gallery/",
      licenseUrl: "https://tenutacortevecchia.it/en/"
    },
    website: "https://tenutacortevecchia.it/en/",
    bookingLink: "https://tenutacortevecchia.it/en/",
    address: "Località Cortevecchia, 58055 Semproniano (GR)",
    // Position given by the host over WhatsApp, 2026-08-04. The previous
    // value was ~7 km south-west of here. Note this drives the MAP PINS
    // (MapView / MiniMap), not the Maps+Waze buttons — those go through
    // buildSearchQuery() in lib/nav.ts and search on "<name>, <address>"
    // text, ignoring coords entirely for a named target.
    // Reverse-geocodes to Belvedere / Petricci, Semproniano (GR) 58055.
    coords: [42.749253, 11.568486],
    checkIn: "2026-08-21",
    checkOut: "2026-08-26",
    nights: 5,
    highlights: [
      "~25 min from Saturnia hot springs (the host says 15; trust the longer number for a 07:30 start)",
      "~30 min from Pitigliano and the Vie Cave",
      "Big private pool, kitchen built for a chef-at-home night",
      "Total privacy — historic restored buildings",
      "Arrival: main gate with the flags and the fountain, ring the bell, then the yellow farmhouse on your left down the avenue is reception"
    ],
    warnings: [
      "Check-in is 15:00–18:00 only. Our plan lands close to the edge — if you slip, call ahead, don't just turn up late",
      "Check-out is 08:00–10:00, but we leave at 03:30 for the flight. Settle up and arrange the key drop the night before",
      "Send photos of the front AND back of everyone's passport by WhatsApp before arrival — the host asks for this to pre-fill check-in",
      "Host / urgent contact: +39 331 259 3972 (WhatsApp or call)",
      "It's a working hunting estate: wild boar and deer on the roads. Drive slowly on the property and keep the kids away from the animals"
    ]
  }
];
