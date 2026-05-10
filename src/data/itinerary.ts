import type { Day } from "./types";

export const itinerary: Day[] = [
  {
    dayNumber: 1,
    date: "2026-08-17",
    weekday: "Monday",
    region: "north",
    base: "Larciano",
    title: "Land in Rome, drive north",
    subtitle: "Arrive FCO 14:00, pick up the rental car, head to Tuscany",
    leadImage: "./images/stay-larciano.jpg",
    leadImageCredit: {
      author: "Vignaccia76",
      license: "CC BY-SA 3.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Larciano_-_panoramica.JPG",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/"
    },
    activities: [
      {
        time: "14:00",
        title: "Land at Rome Fiumicino (FCO)",
        description: "Pick up the rental car. International driving permit required. Confirm a credit card on the driver's name."
      },
      {
        time: "Evening",
        title: "Arrive in Larciano, settle in",
        description: "Around 3.5 h drive. Late swim in the pool, light dinner, early to bed."
      }
    ],
    driveNotes: "FCO → Larciano ≈ 3 h 30 min via A1 + A11"
  },
  {
    dayNumber: 2,
    date: "2026-08-18",
    weekday: "Tuesday",
    region: "north",
    base: "Larciano",
    title: "Turquoise canyon, Devil's Bridge & forest ropes",
    activities: [
      {
        time: "Morning",
        title: "Canyon Park — Big SUP",
        description: "Family stand-up paddleboard through the turquoise Lima canyon. Big SUP only (the high zip line needs 140 cm).",
        attractionId: "canyon-park",
        tag: "water"
      },
      {
        time: "Lunch",
        title: "Ponte del Diavolo photo stop",
        description: "Climb the medieval humpback bridge, tell the kids the devil legend, grab a quick lunch in Borgo a Mozzano.",
        attractionId: "ponte-del-diavolo",
        tag: "culture"
      },
      {
        time: "Afternoon",
        title: "Selva del Buffardello ropes course",
        description: "Shaded forest adventure park with kid-height routes (from 100 cm) — the kids get the real ropes experience.",
        attractionId: "selva-buffardello",
        tag: "extreme"
      }
    ],
    driveNotes: "Larciano ↔ Bagni di Lucca ≈ 1 h"
  },
  {
    dayNumber: 3,
    date: "2026-08-19",
    weekday: "Wednesday",
    region: "north",
    base: "Larciano",
    title: "Soft rafting + a quick wave at Pisa",
    activities: [
      {
        time: "Morning",
        title: "Soft Rafting on the Serchio",
        description: "Family-friendly raft float — wet, splashy, plenty of jump-in stops.",
        attractionId: "soft-rafting-serchio",
        tag: "water"
      },
      {
        time: "Afternoon",
        title: "Pisa — Leaning Tower & gelato",
        description: "Park outside the walls (ZTL!), walk into Piazza dei Miracoli, take the silly photos, eat gelato, leave.",
        attractionId: "pisa",
        tag: "culture"
      },
      {
        time: "Optional",
        title: "Lucca city walls bike loop",
        description: "On the way back, rent bikes near Porta San Pietro or Piazzale Verdi and ride the 4 km tree-lined ring on top of Lucca's Renaissance walls. Flat, traffic-free, glorious in the late-afternoon light. Drop the bikes and disappear into the old town for gelato.",
        attractionId: "lucca-walls",
        tag: "family"
      }
    ],
    driveNotes: "Garfagnana → Pisa ≈ 45 min · Pisa → Lucca ≈ 30 min · Lucca → Larciano ≈ 35 min"
  },
  {
    dayNumber: 4,
    date: "2026-08-20",
    weekday: "Thursday",
    region: "north",
    base: "Larciano",
    title: "Above the clouds — Abetone gondola",
    activities: [
      {
        time: "Morning",
        title: "Drive to Abetone, ride to Monte Gomito",
        description: "Modern gondola to nearly 1,900 m — cool air, wide views.",
        attractionId: "abetone-monte-gomito",
        tag: "view"
      },
      {
        time: "Midday",
        title: "Family ridge walk",
        description: "Easy, breezy walk along the open ridgeline. Picnic with a view."
      },
      {
        time: "Afternoon",
        title: "Pine forest picnic, then home to pack",
        description: "Descend, stretch out in the woods at the bottom, head back to Larciano to pack for the south."
      }
    ],
    driveNotes: "Larciano ↔ Abetone ≈ 1 h"
  },
  {
    dayNumber: 5,
    date: "2026-08-21",
    weekday: "Friday",
    region: "transit",
    base: "Larciano → Cortevecchia",
    title: "River walk south, settle into the villa",
    subtitle: "Transfer day — the Sentierelsa river walk on the way",
    activities: [
      {
        time: "Morning",
        title: "Drive south, stop at Sentierelsa",
        description: "Wade the turquoise Elsa river to the Diborrato waterfall — closed-toe water shoes mandatory.",
        attractionId: "sentierelsa",
        tag: "water"
      },
      {
        time: "Late afternoon",
        title: "Arrive at Tenuta Cortevecchia",
        description: "Settle into the villa, swim in the private pool, decompress."
      }
    ],
    driveNotes: "Larciano → Sentierelsa ≈ 1 h 15 min · Sentierelsa → Cortevecchia ≈ 2 h 30 min"
  },
  {
    dayNumber: 6,
    date: "2026-08-22",
    weekday: "Saturday",
    region: "south",
    base: "Cortevecchia",
    title: "Captain for a day — boat & snorkel at Argentario",
    activities: [
      {
        time: "Morning",
        title: "Drive to Porto Santo Stefano",
        description: "Pick up the rental boat. No licence needed for the smaller engines — quick safety briefing and you're off."
      },
      {
        time: "Day on the water",
        title: "Cala del Gesso & coves of Argentario",
        description: "Cruise the peninsula, anchor in glassy coves, snorkel, lunch on board.",
        attractionId: "porto-santo-stefano",
        tag: "water"
      }
    ],
    driveNotes: "Cortevecchia ↔ Porto Santo Stefano ≈ 1 h 15 min"
  },
  {
    dayNumber: 7,
    date: "2026-08-23",
    weekday: "Sunday",
    region: "south",
    base: "Cortevecchia",
    title: "Pure adrenaline — Acqua Village Follonica",
    activities: [
      {
        time: "Morning to evening",
        title: "Acqua Village Follonica",
        description: "Full day of slides, wave pool, lazy river, Polynesian shows.",
        attractionId: "acqua-village-follonica",
        tag: "extreme"
      }
    ],
    driveNotes: "Cortevecchia ↔ Follonica ≈ 1 h 20 min"
  },
  {
    dayNumber: 8,
    date: "2026-08-24",
    weekday: "Monday",
    region: "south",
    base: "Cortevecchia",
    title: "Maremma horses & the Etruscan rock maze",
    activities: [
      {
        time: "Early morning",
        title: "Horseback ride in the Maremma",
        description: "1-hour family pony / horse trail through pine forest and dunes. Cool morning slot.",
        attractionId: "maremma-horseback",
        tag: "nature"
      },
      {
        time: "Afternoon",
        title: "Pitigliano + Via Cava di San Giuseppe",
        description: "Photograph Pitigliano from the viewpoint, walk the old Jewish quarter, then dive into the cool Etruscan rock corridors.",
        attractionId: "pitigliano",
        tag: "culture"
      },
      {
        time: "Alternative",
        title: "Vitozza cave city (wilder option)",
        description: "Swap the Vie Cave for the abandoned cave dwellings of Vitozza — bring headlamps.",
        attractionId: "vitozza",
        tag: "cave"
      }
    ]
  },
  {
    dayNumber: 9,
    date: "2026-08-25",
    weekday: "Tuesday",
    region: "south",
    base: "Cortevecchia",
    title: "Hot springs at dawn, lake swim, the floating city",
    subtitle: "A full circuit of the southern Maremma",
    activities: [
      {
        time: "07:30 (critical)",
        title: "Saturnia — Cascate del Mulino",
        description: "Arrive by 07:30 for a near-empty turquoise pool. By 10:00 it's packed and parking is gone.",
        attractionId: "saturnia",
        tag: "water"
      },
      {
        time: "Midday",
        title: "Swim in Lago di Bolsena",
        description: "Cool, clean volcanic lake — gentler than the August coast.",
        attractionId: "lago-di-bolsena",
        tag: "water"
      },
      {
        time: "Afternoon",
        title: "Civita di Bagnoregio",
        description: "Walk the long footbridge into the 'dying city' on its tufa pedestal.",
        attractionId: "civita-di-bagnoregio",
        tag: "culture"
      }
    ]
  },
  {
    dayNumber: 10,
    date: "2026-08-26",
    weekday: "Wednesday",
    region: "transit",
    base: "Fiumicino",
    title: "Fly home",
    leadImage: "./images/tel-aviv-skyline.jpg",
    leadImageCredit: {
      author: "Unsplash",
      license: "Unsplash License",
      source: "https://unsplash.com/photos/lpQwaLWhw9Q",
      licenseUrl: "https://unsplash.com/license"
    },
    activities: [
      {
        time: "03:30",
        title: "At FCO check-in",
        description: "Bag-drop opens 2 hours before departure. Aim to be in line by 03:30 — even at 5am, FCO has queues."
      },
      {
        time: "05:00",
        title: "Take-off",
        description: "Arrivederci, Tuscany. Buon viaggio!"
      }
    ]
  }
];
