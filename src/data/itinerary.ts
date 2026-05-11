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
        description: "Pick up the rental car. International driving permit required. Confirm a credit card on the driver's name.",
        rideToNext: { duration: "3 h 30", note: "via A1 + A11 · ≈ 280 km" }
      },
      {
        time: "Evening",
        title: "Arrive in Larciano, settle in",
        description: "Around 3.5 h drive. Late swim in the pool, light dinner, early to bed."
      }
    ],
    driveNotes: "FCO → Larciano ≈ 3 h 30 min via A1 + A11",
    restaurants: ["rest-n-pizzeria-da-paolo"],
    drinkOfTheDay: {
      name: "Aperol Spritz",
      type: "aperitif",
      pairing: "The official 'you made it' drink of Italy. Bittersweet, low-strength, fizzy — exactly what tired travellers need on a poolside lounger before a light dinner.",
      servingNote: "Tall glass packed with ice · 3 parts Prosecco · 2 parts Aperol · 1 splash of soda · orange wheel"
    },
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
    italianWords: [
      {
        word: "Andiamo!",
        pronounce: "ahn-DYAH-moh",
        meaning: "Let's go!",
        example: "Andiamo in Toscana!",
        exampleMeaning: "Let's go to Tuscany!"
      },
      {
        word: "Autostrada",
        pronounce: "ow-toh-STRAH-dah",
        meaning: "Motorway",
        example: "Sull'autostrada verso Firenze.",
        exampleMeaning: "On the motorway toward Florence."
      },
      {
        word: "Bagaglio",
        pronounce: "bah-GAH-lyoh",
        meaning: "Luggage",
        example: "Il bagaglio è nel bagagliaio.",
        exampleMeaning: "The luggage is in the boot."
      },
      {
        word: "Dai!",
        pronounce: "dye",
        meaning: "Come on! (sounds like 'dye', not 'day')",
        example: "Dai, facciamo le valigie!",
        exampleMeaning: "Come on, let's pack the bags!"
      },
      {
        word: "Forza!",
        pronounce: "FOR-tzah",
        meaning: "You can do it! (literally 'strength')",
        example: "Forza, siamo quasi arrivati!",
        exampleMeaning: "Hang in there — we're almost there!"
      },
      {
        word: "Riposo",
        pronounce: "ree-POH-zoh",
        meaning: "A rest (not the English word 'repose')",
        example: "Un piccolo riposo in macchina.",
        exampleMeaning: "A little rest in the car."
      }
    ]
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
        tag: "water",
        rideToNext: { duration: "10 min", note: "Bagni di Lucca → Borgo a Mozzano" }
      },
      {
        time: "Lunch",
        title: "Ponte del Diavolo photo stop",
        description: "Climb the medieval humpback bridge, tell the kids the devil legend, grab a quick lunch in Borgo a Mozzano.",
        attractionId: "ponte-del-diavolo",
        tag: "culture",
        rideToNext: { duration: "30 min", note: "winding climb to 850 m" }
      },
      {
        time: "Afternoon",
        title: "Selva del Buffardello ropes course",
        description: "Shaded forest adventure park with kid-height routes (from 100 cm) — the kids get the real ropes experience.",
        attractionId: "selva-buffardello",
        tag: "extreme",
        // Day 2's title literally calls out "forest ropes" — the ropes
        // course is the headline finale, not a "skip if tired" extra.
        // Opt out of the auto-rule that would mark the 3rd attraction optional.
        optional: false
      }
    ],
    driveNotes: "Larciano ↔ Bagni di Lucca ≈ 1 h",
    restaurants: ["rest-n-bagni-lucca", "rest-n-osteria-larciano"],
    drinkOfTheDay: {
      name: "Vermentino di Toscana IGT",
      type: "wine",
      pairing: "After a wet morning in the canyon and a forest afternoon, this crisp white from the Tuscan coast is the perfect cool-down — citrus, sea-breeze and a flinty edge.",
      servingNote: "Served well-chilled (8–10 °C), in a tall white-wine glass"
    },
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
    italianWords: [
      {
        word: "Acqua",
        pronounce: "AH-kwah",
        meaning: "Water",
        example: "L'acqua è fresca!",
        exampleMeaning: "The water is cool!"
      },
      {
        word: "Coraggio",
        pronounce: "kor-AH-joh",
        meaning: "Courage",
        example: "Hai coraggio sul ponte!",
        exampleMeaning: "You've got courage on the bridge!"
      },
      {
        word: "Sole",
        pronounce: "SOH-leh",
        meaning: "Sun",
        example: "Che sole oggi!",
        exampleMeaning: "What sun today!"
      },
      {
        word: "Spruzzo",
        pronounce: "SPROOT-tzoh",
        meaning: "Splash, spray",
        example: "Che bello lo spruzzo dell'acqua!",
        exampleMeaning: "How fun the water splash is!"
      },
      {
        word: "Freddo",
        pronounce: "FREHD-doh",
        meaning: "Cold (double 'd' in the middle)",
        example: "L'acqua non è freddissima.",
        exampleMeaning: "The water isn't freezing cold."
      },
      {
        word: "Attento!",
        pronounce: "ah-TEN-toh",
        meaning: "Watch out! Careful!",
        example: "Attento, è scivoloso!",
        exampleMeaning: "Careful, it's slippery!"
      }
    ]
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
        tag: "water",
        rideToNext: { duration: "45 min", note: "Garfagnana → Pisa" }
      },
      {
        time: "Afternoon",
        title: "Pisa — Leaning Tower & gelato",
        description: "Park outside the walls (ZTL!), walk into Piazza dei Miracoli, take the silly photos, eat gelato, leave.",
        attractionId: "pisa",
        tag: "culture",
        rideToNext: { duration: "30 min", note: "Pisa → Lucca, mostly motorway" }
      },
      {
        time: "Late afternoon",
        title: "Lucca city walls bike loop",
        description: "On the way back, rent bikes near Porta San Pietro or Piazzale Verdi and ride the 4 km tree-lined ring on top of Lucca's Renaissance walls. Flat, traffic-free, glorious in the late-afternoon light. Drop the bikes and disappear into the old town for gelato.",
        attractionId: "lucca-walls",
        tag: "family"
      }
    ],
    driveNotes: "Garfagnana → Pisa ≈ 45 min · Pisa → Lucca ≈ 30 min · Lucca → Larciano ≈ 35 min",
    restaurants: ["rest-n-pisa", "rest-n-osteria-larciano"],
    drinkOfTheDay: {
      name: "Chianti Classico DOCG",
      type: "wine",
      pairing: "After a day that ends in Pisa and Lucca, you owe yourself the most iconic Tuscan red — black cherry, dried herbs and that signature Sangiovese acidity that loves a wood-fired pizza.",
      servingNote: "Served at cellar temperature (16–18 °C), opened 30 minutes before pouring"
    },
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
    italianWords: [
      {
        word: "Pendente",
        pronounce: "pen-DEN-teh",
        meaning: "Leaning, slanted",
        example: "La torre pendente di Pisa.",
        exampleMeaning: "The leaning tower of Pisa."
      },
      {
        word: "Gelato",
        pronounce: "jeh-LAH-toh",
        meaning: "Ice cream",
        example: "Un gelato in piazza.",
        exampleMeaning: "An ice cream in the square."
      },
      {
        word: "Bicicletta",
        pronounce: "bee-chee-keh-TEH-tah",
        meaning: "Bicycle",
        example: "In bicicletta sulle mura.",
        exampleMeaning: "By bike on the walls."
      },
      {
        word: "Campanile",
        pronounce: "kahm-pah-NEE-leh",
        meaning: "Bell tower (not 'campanile' in English)",
        example: "Il campanile suona a mezzogiorno.",
        exampleMeaning: "The bell tower rings at noon."
      },
      {
        word: "Squisito",
        pronounce: "skwee-ZEE-toh",
        meaning: "Delicious (nothing like 'squirrel')",
        example: "Questo gelato è squisito!",
        exampleMeaning: "This gelato is delicious!"
      },
      {
        word: "Torcia",
        pronounce: "TOR-chah",
        meaning: "Torch / flashlight (UK 'torch')",
        example: "Metti la torcia nello zaino.",
        exampleMeaning: "Put the torch in the backpack."
      }
    ]
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
        description: "Descend, stretch out in the woods at the bottom, head back to Larciano to pack for the south.",
        rideToNext: { duration: "1 h", note: "Abetone → Larciano, the long descent" }
      }
    ],
    driveNotes: "Larciano ↔ Abetone ≈ 1 h",
    restaurants: ["rest-n-pizzeria-da-paolo", "rest-n-vinci"],
    drinkOfTheDay: {
      name: "Negroni",
      type: "cocktail",
      pairing: "Tuscany invented the Negroni in Florence — equal parts gin, Campari and sweet vermouth, bracing and bitter. The right drink after a long day at altitude and a packing-night to come.",
      servingNote: "Old-fashioned glass · big ice cube · half-orange peel, pinched over the surface"
    },
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
    italianWords: [
      {
        word: "Montagna",
        pronounce: "mon-TAH-nyah",
        meaning: "Mountain",
        example: "Andiamo in montagna.",
        exampleMeaning: "We're heading to the mountains."
      },
      {
        word: "Nuvola",
        pronounce: "NOO-voh-lah",
        meaning: "Cloud",
        example: "Sopra le nuvole.",
        exampleMeaning: "Above the clouds."
      },
      {
        word: "Fresco",
        pronounce: "FREH-skoh",
        meaning: "Cool, fresh",
        example: "Che aria fresca!",
        exampleMeaning: "What cool air!"
      },
      {
        word: "Berretto",
        pronounce: "behr-REHT-toh",
        meaning: "Beanie / woolly hat",
        example: "Metti il berretto, c'è vento!",
        exampleMeaning: "Put your hat on — it's windy!"
      },
      {
        word: "Stella",
        pronounce: "STEHL-lah",
        meaning: "Star (say STEH-lla, not 'stella' like English Stella)",
        example: "Contiamo le stelle stasera.",
        exampleMeaning: "Let's count the stars tonight."
      },
      {
        word: "Eco",
        pronounce: "EH-koh",
        meaning: "Echo (two short snaps)",
        example: "Senti l'eco tra gli alberi!",
        exampleMeaning: "Listen to the echo among the trees!"
      }
    ]
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
        tag: "water",
        rideToNext: { duration: "2 h 30", note: "Sentierelsa → Cortevecchia, via SS223 + SS74" }
      },
      {
        time: "Late afternoon",
        title: "Arrive at Tenuta Cortevecchia",
        description: "Settle into the villa, swim in the private pool, decompress."
      }
    ],
    driveNotes: "Larciano → Sentierelsa ≈ 1 h 15 min · Sentierelsa → Cortevecchia ≈ 2 h 30 min",
    restaurants: ["rest-s-trattoria-verdi"],
    drinkOfTheDay: {
      name: "Vernaccia di San Gimignano DOCG",
      type: "wine",
      pairing: "You drove past its hills today. A crisp, mineral white with notes of green apple and almond — Tuscany's first DOC, and the perfect 'we made it south' pour after the long transfer.",
      servingNote: "Well-chilled · the slim white-wine glass keeps the aromatics tight"
    },
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
    italianWords: [
      {
        word: "Sentiero",
        pronounce: "sen-TYAIR-oh",
        meaning: "Trail, path",
        example: "Il sentiero passa nel fiume.",
        exampleMeaning: "The trail runs through the river."
      },
      {
        word: "Valigia",
        pronounce: "vah-LEE-jah",
        meaning: "Suitcase",
        example: "Chiudi la valigia.",
        exampleMeaning: "Close the suitcase."
      },
      {
        word: "Sud",
        pronounce: "sood",
        meaning: "South",
        example: "Andiamo verso sud.",
        exampleMeaning: "We're heading south."
      },
      {
        word: "Saltellare",
        pronounce: "sahl-tehl-LAH-reh",
        meaning: "To hop, skip (fun bouncy verb)",
        example: "Saltelliamo sui sassi!",
        exampleMeaning: "Let's hop on the stones!"
      },
      {
        word: "Fango",
        pronounce: "FAHN-goh",
        meaning: "Mud (hard 'g', not 'fang')",
        example: "Attenti al fango vicino al fiume.",
        exampleMeaning: "Watch the mud near the river."
      },
      {
        word: "Onda",
        pronounce: "OHN-dah",
        meaning: "Wave (in water — not 'under')",
        example: "Piccola onda, grande divertimento!",
        exampleMeaning: "Small wave, big fun!"
      }
    ]
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
    restaurants: ["rest-s-porto-santo-stefano", "rest-s-trattoria-verdi"],
    drinkOfTheDay: {
      name: "Limoncello",
      type: "digestif",
      pairing: "After a salty day on the boat, the coastal classic — chilled, citrusy and just sweet enough. Dal Greco's harbour-side terrace is the natural finish line for this one.",
      servingNote: "Served straight from the freezer in tiny chilled glasses · sip, never shoot"
    },
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
    italianWords: [
      {
        word: "Mare",
        pronounce: "MAH-reh",
        meaning: "Sea",
        example: "Una giornata in mare.",
        exampleMeaning: "A day at sea."
      },
      {
        word: "Barca",
        pronounce: "BAR-kah",
        meaning: "Boat",
        example: "Saliamo in barca.",
        exampleMeaning: "We're getting on the boat."
      },
      {
        word: "Ancora",
        pronounce: "AHN-kor-ah",
        meaning: "Anchor; also 'still'",
        example: "Gettiamo l'ancora.",
        exampleMeaning: "We drop the anchor."
      },
      {
        word: "Timone",
        pronounce: "tee-MOH-neh",
        meaning: "Ship's wheel / rudder (captain word)",
        example: "Chi vuole tenere il timone?",
        exampleMeaning: "Who wants to hold the wheel?"
      },
      {
        word: "Rete",
        pronounce: "REH-teh",
        meaning: "Net (fishing net — not 'reet')",
        example: "La rete per pescare i pesci.",
        exampleMeaning: "The net for catching fish."
      },
      {
        word: "Conchiglia",
        pronounce: "kohn-KEE-lyah",
        meaning: "Seashell (long musical word)",
        example: "Ho trovato una conchiglia enorme!",
        exampleMeaning: "I found a huge seashell!"
      }
    ]
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
    restaurants: ["rest-s-trattoria-verdi", "rest-s-i-due-cippi"],
    drinkOfTheDay: {
      name: "Spritz al Limone",
      type: "aperitif",
      pairing: "Same Spritz family as the Aperol, but built on Limoncello — sharper, brighter, exactly the recovery drink after a long day of slides and chlorine.",
      servingNote: "Tall glass · ice · 3 parts Prosecco · 2 parts Limoncello · soda · lemon wheel"
    },
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
    italianWords: [
      {
        word: "Scivolo",
        pronounce: "SHEE-voh-loh",
        meaning: "Slide",
        example: "Lo scivolo più alto, per favore!",
        exampleMeaning: "The tallest slide, please!"
      },
      {
        word: "Divertimento",
        pronounce: "dee-vehr-tee-MEN-toh",
        meaning: "Fun",
        example: "Che divertimento!",
        exampleMeaning: "What fun!"
      },
      {
        word: "Piscina",
        pronounce: "pee-SHEE-nah",
        meaning: "Swimming pool",
        example: "Andiamo in piscina.",
        exampleMeaning: "Let's go to the pool."
      },
      {
        word: "Schizzo",
        pronounce: "SKEET-tzoh",
        meaning: "Splash, squirt, splotch",
        example: "Che schizzo dalla piscina!",
        exampleMeaning: "What a splash from the pool!"
      },
      {
        word: "Tubo",
        pronounce: "TOO-boh",
        meaning: "Tube (slide tube — not 'tube-oh')",
        example: "Scendo nel tubo blu!",
        exampleMeaning: "I'm going down the blue tube!"
      },
      {
        word: "Gridare",
        pronounce: "gree-DAH-reh",
        meaning: "To shout (not 'grid')",
        example: "Non serve gridare, ti sento!",
        exampleMeaning: "No need to shout — I can hear you!"
      }
    ]
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
        tag: "nature",
        rideToNext: { duration: "1 h", note: "Maremma coast → Pitigliano hills" }
      },
      {
        time: "Afternoon",
        title: "Pitigliano + Via Cava di San Giuseppe",
        description: "Photograph Pitigliano from the viewpoint, walk the old Jewish quarter, then dive into the cool Etruscan rock corridors.",
        attractionId: "pitigliano",
        tag: "culture",
        rideToNext: { duration: "20 min", note: "Pitigliano → Vitozza, scenic tufa road" }
      },
      {
        time: "Late afternoon",
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
    italianWords: [
      {
        word: "Cavallo",
        pronounce: "kah-VAH-loh",
        meaning: "Horse",
        example: "Un cavallo della Maremma.",
        exampleMeaning: "A Maremma horse."
      },
      {
        word: "Grotta",
        pronounce: "GROHT-tah",
        meaning: "Cave, grotto",
        example: "Entriamo nella grotta.",
        exampleMeaning: "We're going into the cave."
      },
      {
        word: "Storia",
        pronounce: "STOH-ryah",
        meaning: "History, story",
        example: "Che storia affascinante!",
        exampleMeaning: "What a fascinating history!"
      },
      {
        word: "Stallo",
        pronounce: "STAHL-loh",
        meaning: "Stable stall (horses — not English 'stall')",
        example: "Il cavallo torna allo stallo.",
        exampleMeaning: "The horse goes back to the stall."
      },
      {
        word: "Oscuro",
        pronounce: "oh-SKOO-roh",
        meaning: "Dark, shadowy",
        example: "È un po' oscuro nella grotta.",
        exampleMeaning: "It's a bit dark in the cave."
      },
      {
        word: "Passo",
        pronounce: "PAHS-soh",
        meaning: "Step, pace (double 's')",
        example: "Un passo alla volta, piano piano.",
        exampleMeaning: "One step at a time, slowly slowly."
      }
    ],
    restaurants: ["rest-s-hostaria-ceccottino", "rest-s-trattoria-sovana"],
    drinkOfTheDay: {
      name: "Morellino di Scansano DOCG",
      type: "wine",
      pairing: "The flagship red of the southern Maremma, made just up the road. Plush dark fruit, soft tannins — the right glass to finish a day of horses, tufa villages and rock-cut corridors.",
      servingNote: "Served at 16–18 °C, in a wide Burgundy-style bowl"
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
        tag: "water",
        rideToNext: { duration: "1 h 20", note: "Saturnia → Bolsena, hills and lakes" }
      },
      {
        time: "Midday",
        title: "Swim in Lago di Bolsena",
        description: "Cool, clean volcanic lake — gentler than the August coast.",
        attractionId: "lago-di-bolsena",
        tag: "water",
        rideToNext: { duration: "30 min", note: "Bolsena → Civita di Bagnoregio" }
      },
      {
        time: "Afternoon",
        title: "Civita di Bagnoregio",
        description: "Walk the long footbridge into the 'dying city' on its tufa pedestal.",
        attractionId: "civita-di-bagnoregio",
        tag: "culture",
        // Day 9's title literally calls out "the floating city" — Civita is
        // the headline finale, not a "skip if tired" extra. Opt it out of
        // the auto-rule that would otherwise mark the 3rd attraction optional.
        optional: false
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
    italianWords: [
      {
        word: "Terme",
        pronounce: "TAIR-meh",
        meaning: "Thermal baths, hot springs",
        example: "Le terme di Saturnia all'alba.",
        exampleMeaning: "The Saturnia hot springs at dawn."
      },
      {
        word: "Lago",
        pronounce: "LAH-goh",
        meaning: "Lake",
        example: "Un tuffo nel lago.",
        exampleMeaning: "A dip in the lake."
      },
      {
        word: "Panorama",
        pronounce: "pah-noh-RAH-mah",
        meaning: "View, panorama",
        example: "Che panorama!",
        exampleMeaning: "What a view!"
      },
      {
        word: "Vapore",
        pronounce: "vah-POH-reh",
        meaning: "Steam (hot-springs mist)",
        example: "Si vede il vapore sull'acqua calda.",
        exampleMeaning: "You can see the steam on the hot water."
      },
      {
        word: "Cannuccia",
        pronounce: "kahn-NOOT-chah",
        meaning: "Drinking straw (not 'can-ooch')",
        example: "Una cannuccia per la granita.",
        exampleMeaning: "A straw for the slush ice."
      },
      {
        word: "Tuffo",
        pronounce: "TOOF-foh",
        meaning: "Dive, splash jump",
        example: "Faccio un tuffo nel lago!",
        exampleMeaning: "I'm doing a cannonball into the lake!"
      }
    ],
    restaurants: ["rest-s-i-due-cippi", "rest-s-trattoria-verdi"],
    drinkOfTheDay: {
      name: "Bianco di Pitigliano DOC",
      type: "wine",
      pairing: "A local southern white from the tufa hills you've been driving through. Light, mineral, faintly almond — the right last-night pour after a sunrise in sulphur springs and an afternoon in a floating city.",
      servingNote: "Served well-chilled (8 °C), in the everyday white-wine glass"
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
    italianWords: [
      {
        word: "Arrivederci",
        pronounce: "ah-ree-veh-DAIR-chee",
        meaning: "Goodbye (until we meet again)",
        example: "Arrivederci, Toscana!",
        exampleMeaning: "Goodbye, Tuscany!"
      },
      {
        word: "Volo",
        pronounce: "VOH-loh",
        meaning: "Flight",
        example: "Il volo è in orario.",
        exampleMeaning: "The flight is on time."
      },
      {
        word: "A presto",
        pronounce: "ah PRES-toh",
        meaning: "See you soon",
        example: "A presto, Italia!",
        exampleMeaning: "See you soon, Italy!"
      },
      {
        word: "Grazie",
        pronounce: "GRAHT-tsyeh",
        meaning: "Thank you (the 'zie' buzzes)",
        example: "Grazie mille, è stato bellissimo!",
        exampleMeaning: "Thanks a million — it was wonderful!"
      },
      {
        word: "Subito",
        pronounce: "SOO-bee-toh",
        meaning: "Right away (airport hurry word)",
        example: "Subito al gate, siamo in ritardo!",
        exampleMeaning: "Straight to the gate — we're late!"
      },
      {
        word: "Bacio",
        pronounce: "BAH-choh",
        meaning: "Kiss goodbye",
        example: "Un bacio all'Italia!",
        exampleMeaning: "A kiss for Italy!"
      }
    ],
    drinkOfTheDay: {
      name: "Espresso al banco",
      type: "coffee",
      pairing: "The proper Italian send-off — a single shot, standing at the airport bar, downed in three sips. The only nightcap that makes sense at 04:00 before a flight home.",
      servingNote: "Tiny porcelain cup · drink it standing · pay €1.20 · don't ask for it 'to go'"
    }
  }
];
