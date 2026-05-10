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
    activities: [
      {
        time: "14:00",
        title: "Land at Rome Fiumicino (FCO)",
        description: "Pick up the rental car. International driving permit required. Confirm a credit card on the driver's name."
      },
      {
        time: "On the road",
        title: "Highway grocery stop",
        description: "Big Autogrill or Conad on the A1/A11 — water, fruit, snacks, breakfast for tomorrow."
      },
      {
        time: "Evening",
        title: "Arrive in Larciano, settle in",
        description: "Around 3.5 h drive. Late swim in the pool, dinner from the supermarket haul, early to bed."
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
      }
    ],
    driveNotes: "Garfagnana → Pisa ≈ 45 min"
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
    title: "River walk south, then a private chef in the villa",
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
      },
      {
        time: "Evening",
        title: "Private chef — pasta workshop & dinner",
        description: "A local chef arrives with ingredients and runs a family pici-making workshop, then cooks dinner. Book ahead via Eatwith / Airbnb Experiences.",
        tag: "food"
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
      },
      {
        time: "Sunset",
        title: "Dinner at the harbour",
        description: "Fresh fish at Dal Greco, then drive back."
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
    base: "Cortevecchia → Fiumicino",
    title: "Hot springs at dawn, lake swim, the floating city",
    subtitle: "Big day — finishes at the airport hotel",
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
      },
      {
        time: "19:00",
        title: "Drive to Fiumicino",
        description: "≈ 1 h 15 min. Return the rental car at FCO this evening — not at 03:00 tomorrow."
      },
      {
        time: "21:00",
        title: "Check in at HelloSky inside the terminal",
        description: "Walk straight from the rental return to the airport hotel. Light dinner. Sleep."
      }
    ],
    driveNotes: "Civita → FCO ≈ 1 h 30 min"
  },
  {
    dayNumber: 10,
    date: "2026-08-26",
    weekday: "Wednesday",
    region: "transit",
    base: "Fiumicino",
    title: "Fly home",
    activities: [
      {
        time: "03:00",
        title: "Wake, walk 5 min to check-in",
        description: "Hotel is connected to the terminal by a covered bridge. No taxi, no stress."
      },
      {
        time: "05:00",
        title: "Take-off",
        description: "Arrivederci, Tuscany. Buon viaggio!"
      }
    ]
  }
];
