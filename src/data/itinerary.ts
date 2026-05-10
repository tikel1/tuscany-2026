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
    leadImage: "./images/stay-larciano-sunflowers.png",
    leadImageCredit: {
      author: "Host photo",
      license: "Airbnb listing",
      source: "https://www.airbnb.com/rooms/1554711",
      licenseUrl: "https://www.airbnb.com/help/article/2855"
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
    driveNotes: "FCO → Larciano ≈ 3 h 30 min via A1 + A11",
    gear: [
      { item: "Comfortable travel layers (FCO is air-conditioned, the car will be hot)" },
      { item: "Slip-on shoes for security" },
      { item: "Refillable water bottles (empty for security, fill at FCO)" },
      { item: "Sunglasses & a hat — late August sun is brutal at the rest stops" },
      { item: "Swimwear in the carry-on, not the hold (in case bags arrive late)" }
    ],
    dayTips: [
      "Keep €40–50 cash for autostrada tolls (A1 + A11)",
      "Confirm with the rental whether the tank policy is full-to-full or full-to-empty",
      "Italian rentals require an International Driving Permit — keep it with the licence",
      "Aim to clear the FCO area before 16:00 to dodge Friday rush southbound"
    ],
    wordOfTheDay: {
      word: "Andiamo!",
      pronounce: "ahn-DYAH-moh",
      meaning: "Let's go!",
      example: "Andiamo in Toscana!",
      exampleMeaning: "Let's go to Tuscany!"
    }
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
    driveNotes: "Larciano ↔ Bagni di Lucca ≈ 1 h",
    gear: [
      { item: "Quick-dry swimwear under your clothes — saves a wet changing room", for: "canyon-park" },
      { item: "Closed-toe water shoes for the SUP & rocks", for: "canyon-park" },
      { item: "Dry bag for phone, keys & wallet", for: "canyon-park" },
      { item: "Closed-toe trainers for the ropes course (no sandals!)", for: "selva-buffardello" },
      { item: "A change of dry clothes for the drive home" },
      { item: "Reef-safe sunscreen & a wide-brim hat" }
    ],
    dayTips: [
      "Big SUP slot fills up fast — book by phone the night before",
      "Eat early-ish lunch in Borgo a Mozzano: most kitchens close at 14:30",
      "Selva del Buffardello is in chestnut forest at 850 m — bring a long sleeve",
      "Cash for the small adventure-park snack bar"
    ],
    wordOfTheDay: {
      word: "Acqua",
      pronounce: "AH-kwah",
      meaning: "Water",
      example: "L'acqua è fresca!",
      exampleMeaning: "The water is cool!"
    }
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
    driveNotes: "Garfagnana → Pisa ≈ 45 min · Pisa → Lucca ≈ 30 min · Lucca → Larciano ≈ 35 min",
    gear: [
      { item: "Swimwear under your clothes for the rafting", for: "soft-rafting-serchio" },
      { item: "Water shoes; dry change of clothes & towels in a sealed bag", for: "soft-rafting-serchio" },
      { item: "Light cycling-friendly shoes for the Lucca walls", for: "lucca-walls" },
      { item: "Sun hats (zero shade in Piazza dei Miracoli at midday)", for: "pisa" },
      { item: "Cash for parking, bike rental & gelato" }
    ],
    dayTips: [
      "Park Pisa at 'Via Pietrasantina' (€2/hr) — free shuttle to the square",
      "Lucca walls bike rentals from €4/hr; bring an ID for the deposit",
      "Tower climb at Pisa is timed — only book if you actually want the climb",
      "Late-afternoon light on the walls is the postcard moment — aim for 17:00"
    ],
    wordOfTheDay: {
      word: "Pendente",
      pronounce: "pen-DEN-teh",
      meaning: "Leaning, slanted",
      example: "La torre pendente di Pisa.",
      exampleMeaning: "The leaning tower of Pisa."
    }
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
    driveNotes: "Larciano ↔ Abetone ≈ 1 h",
    gear: [
      { item: "Long sleeves & a light jacket — 12–15 °C cooler at 1,900 m", for: "abetone-monte-gomito" },
      { item: "Long trousers for the ridge walk (sunburn at altitude is real)", for: "abetone-monte-gomito" },
      { item: "Hiking-grade trail shoes, not sandals", for: "abetone-monte-gomito" },
      { item: "A proper picnic kit: bread, cheese, fruit, water, a knife" },
      { item: "Sunscreen, sunglasses & a windbreaker for the gondola ride", for: "abetone-monte-gomito" }
    ],
    dayTips: [
      "First gondola ~09:30, last descent ~17:00 — set a phone alarm",
      "Mountain restaurants close mid-afternoon; pack the picnic instead",
      "Cash for the gondola — card sometimes flaky at the booth",
      "Use the cool half of the day for the ridge walk; descend by 15:00 to start packing"
    ],
    wordOfTheDay: {
      word: "Montagna",
      pronounce: "mon-TAH-nyah",
      meaning: "Mountain",
      example: "Andiamo in montagna.",
      exampleMeaning: "We're heading to the mountains."
    }
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
    driveNotes: "Larciano → Sentierelsa ≈ 1 h 15 min · Sentierelsa → Cortevecchia ≈ 2 h 30 min",
    gear: [
      { item: "Closed-toe water shoes — mandatory at Sentierelsa", for: "sentierelsa" },
      { item: "Swimwear under your clothes; quick-change towel", for: "sentierelsa" },
      { item: "Dry bag for phones (the river is the trail)", for: "sentierelsa" },
      { item: "Light hiking shoes for the trail back from the river", for: "sentierelsa" },
      { item: "Snacks & water for the long drive south" }
    ],
    dayTips: [
      "Fuel up before the A1 entry — autostrada gas is +20–30 c/L",
      "Confirm Cortevecchia check-in window with the host before you leave",
      "No public toilets at Sentierelsa trailhead — go in Colle di Val d'Elsa first",
      "Plan an early-evening arrival; you don't want to discover the gravel road in the dark"
    ],
    wordOfTheDay: {
      word: "Sentiero",
      pronounce: "sen-TYAIR-oh",
      meaning: "Trail, path",
      example: "Il sentiero passa nel fiume.",
      exampleMeaning: "The trail runs through the river."
    }
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
    driveNotes: "Cortevecchia ↔ Porto Santo Stefano ≈ 1 h 15 min",
    gear: [
      { item: "Swimwear (a dry second set for the drive home)", for: "porto-santo-stefano" },
      { item: "Snorkel masks — bring your own; rentals are pricey at the marina", for: "porto-santo-stefano" },
      { item: "Reef-safe sunscreen, rash guards & sun-shirts (shade on the boat is minimal)", for: "porto-santo-stefano" },
      { item: "Floating phone case + waterproof dry bag", for: "porto-santo-stefano" },
      { item: "A cooler with sandwiches, fruit, lots of water — no shops at the coves", for: "porto-santo-stefano" },
      { item: "Cash for the harbour parking & marine fuel top-up", for: "porto-santo-stefano" }
    ],
    dayTips: [
      "No license needed for engines under 40 hp (your rental qualifies)",
      "Marine fuel runs €40–80 extra — keep cash for the dock pump",
      "Anchor at Cala del Gesso early — by midday it fills with day boats",
      "Strong meltemi wind = waves: check forecast the night before, reschedule if rough"
    ],
    wordOfTheDay: {
      word: "Mare",
      pronounce: "MAH-reh",
      meaning: "Sea",
      example: "Una giornata in mare.",
      exampleMeaning: "A day at sea."
    }
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
    driveNotes: "Cortevecchia ↔ Follonica ≈ 1 h 20 min",
    gear: [
      { item: "Two sets of swimwear per person (one dry for the drive)", for: "acqua-village-follonica" },
      { item: "Waterproof phone case", for: "acqua-village-follonica" },
      { item: "Swim shirts / rash guards for kids — sun is harsh on the slides", for: "acqua-village-follonica" },
      { item: "Water shoes — pavement around the wave pool gets very hot", for: "acqua-village-follonica" },
      { item: "Beach towels (rentals are paid)", for: "acqua-village-follonica" },
      { item: "A €1 coin for the locker", for: "acqua-village-follonica" }
    ],
    dayTips: [
      "Online tickets meaningfully cheaper — buy them the night before",
      "Outside food allowed in the picnic zone; cooler bag = saves €€€",
      "Arrive at opening (10:00) — slide queues triple after 13:00",
      "Polynesian show times are posted at the gate; don't miss the evening one"
    ],
    wordOfTheDay: {
      word: "Scivolo",
      pronounce: "SHEE-voh-loh",
      meaning: "Slide",
      example: "Lo scivolo più alto, per favore!",
      exampleMeaning: "The tallest slide, please!"
    }
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
    ],
    gear: [
      { item: "Long pants (jeans) for the horseback ride", for: "maremma-horseback" },
      { item: "Closed-toe shoes for everything today — riding, caves, cobbles" },
      { item: "Sun hats & long-sleeve light shirts for the open ride", for: "maremma-horseback" },
      { item: "Headlamps if doing Vitozza (one per person)", for: "vitozza" },
      { item: "A light layer for the cool tufa corridors", for: "via-cava-san-giuseppe" },
      { item: "Water bottles and snacks — gaps between food stops" }
    ],
    dayTips: [
      "Riding helmets are provided; minimum age usually 6",
      "Pitigliano synagogue closes early on Friday — go before lunch if it's a Friday",
      "Vie Cave footing is shaded but uneven — grippy soles only",
      "Buy the 'sfratto dei Goym' from the kosher bakery in Pitigliano"
    ],
    wordOfTheDay: {
      word: "Cavallo",
      pronounce: "kah-VAH-loh",
      meaning: "Horse",
      example: "Un cavallo della Maremma.",
      exampleMeaning: "A Maremma horse."
    }
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
    ],
    gear: [
      { item: "Swimwear under your clothes for Saturnia (skip the queue)", for: "saturnia" },
      { item: "Microfibre towel — quick to dry between stops" },
      { item: "Sandals you don't mind smelling sulphury for a day", for: "saturnia" },
      { item: "Beach mat for Bolsena's pebble shore", for: "lago-di-bolsena" },
      { item: "Comfortable walking shoes for the steep Civita climb", for: "civita-di-bagnoregio" },
      { item: "Sun hats, sunscreen, refilled water bottles" }
    ],
    dayTips: [
      "Saturnia: be in the pools by 07:30 — it's a different place after 10:00",
      "Rinse swimwear thoroughly at Bolsena — sulphur stains light fabrics",
      "Civita footbridge ticket ~€5/adult, cash only",
      "Eat lunch by 13:30 — village kitchens close hard at 14:30"
    ],
    wordOfTheDay: {
      word: "Terme",
      pronounce: "TAIR-meh",
      meaning: "Thermal baths, hot springs",
      example: "Le terme di Saturnia all'alba.",
      exampleMeaning: "The Saturnia hot springs at dawn."
    }
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
    ],
    gear: [
      { item: "Light layers — FCO is air-conditioned & the flight is cold" },
      { item: "Passports + International Driving Permit easily reachable" },
      { item: "Empty refillable bottle (fill after security)" },
      { item: "Snacks for the kids — early flights, sleepy mood" },
      { item: "All gels & liquids re-decanted to ≤ 100 ml" }
    ],
    dayTips: [
      "Bag drop opens exactly 2 h before departure — be there at 03:30",
      "Return the rental with a full tank — closest 24/7 pump is on Via Portuense",
      "Allow 10–15 min for the rental shuttle from car return to terminal",
      "Pre-pay airport tolls online to skip the boom-gate queue at exit"
    ],
    wordOfTheDay: {
      word: "Arrivederci",
      pronounce: "ah-ree-veh-DAIR-chee",
      meaning: "Goodbye (until we meet again)",
      example: "Arrivederci, Toscana!",
      exampleMeaning: "Goodbye, Tuscany!"
    }
  }
];
