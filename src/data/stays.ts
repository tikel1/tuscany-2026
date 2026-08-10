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
    // Street address + position from the Airbnb reservation, 2026-08-09.
    // The old pin was ~2.6 km east of the actual house; since lib/nav.ts now
    // anchors the Maps/Waze search on these coords, a stale pin is a wrong
    // turn rather than a cosmetic blemish.
    address: "Via Biccimurri, San Rocco, 51036 Larciano (PT)",
    coords: [43.831339, 10.8663044],
    checkIn: "2026-08-17",
    checkOut: "2026-08-21",
    nights: 4,
    highlights: [
      "Private home with kitchen — easy with kids",
      "Central for the northern itinerary (Canyon Park, Pisa, Abetone)",
      "Drive to Bagni di Lucca ~1 h, Pisa ~45 min, Abetone ~1 h"
    ],
    checkInWindow: "from 15:00",
    checkOutWindow: "before 10:00",
    warnings: [
      "Check-in opens 15:00. We land at FCO 14:00 and drive ~3.5 h, so arriving early is not the risk here",
      "Check-out is BEFORE 10:00 on the 21st, and that is the same morning we drive south — be packed the night before and roll at 09:45",
      "Booked as the whole house for 6 adults + 6 children. Worth checking that every other booking is sized for the same group"
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
    // TWO host-supplied positions disagree by ~1.65 km and we cannot tell
    // which is the gate and which is the property record:
    //   WhatsApp arrival brief  42.749253, 11.568486  -> Belvedere/Petricci
    //   Booking confirmation    42.738726, 11.582693  -> "Strada Vicinale
    //                                                    di Cortevecchia"
    // Using the WhatsApp one because that message is literally the "how to
    // arrive" instruction, so it should be the gate. But the booking GPS
    // sits on a road named after the estate, which is not nothing — worth
    // one question to the host before departure. Both are plausible on a
    // 2,000-hectare property. lib/nav.ts now anchors on this value.
    coords: [42.749253, 11.568486],
    checkIn: "2026-08-21",
    checkOut: "2026-08-26",
    nights: 5,
    checkInWindow: "15:00–18:00",
    checkOutWindow: "08:00–10:00",
    // Publicly listed booking line from the confirmation email. The host's
    // personal mobile is deliberately NOT in this file: the repo is public.
    publicPhone: "+39 0564 183 2644",
    arrival: [
      "Come in through the main gate — you'll see the flags and the fountain",
      "Ring the bell at the gate and they'll open it for you",
      "Drive down the avenue; the yellow farmhouse on your LEFT is reception",
      "Someone will be waiting there for you",
      "Drive slowly the whole way in — it's a working hunting estate and there are wild boar and deer on these roads"
    ],
    highlights: [
      "~25 min from Saturnia hot springs (the host says 15; trust the longer number for a 07:30 start)",
      "~30 min from Pitigliano and the Vie Cave",
      "Big private pool, kitchen built for a chef-at-home night",
      "Total privacy — historic restored buildings"
    ],
    warnings: [
      "Check-in is 15:00–18:00 only. Our plan lands close to the edge — if you slip, call ahead, don't just turn up late",
      "Check-out is 08:00–10:00, but we leave at 03:30 for the flight. Settle up and arrange the key drop the night before",
      "Send photos of the front AND back of everyone's passport by WhatsApp before arrival — the host asks for this to pre-fill check-in",
      "Host / urgent contact: +39 331 259 3972 (WhatsApp or call)",
      "Saturnia is ~25 min away, though the host claims 15. Plan the 07:30 dawn start against 25",
      "Booked room only — no breakfast. On an estate this remote that means the first morning needs shopping done the day before",
      "Two host-given map positions differ by ~1.6 km. Ask them to confirm the gate before you set off",
      "It's a working hunting estate: wild boar and deer on the roads. Drive slowly on the property and keep the kids away from the animals"
    ]
  }
];
