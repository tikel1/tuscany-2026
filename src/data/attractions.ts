import type { POI, ImageCredit } from "./types";

const wmCredit = (article: string): ImageCredit => ({
  author: `Wikipedia/Wikimedia Commons contributors`,
  license: "CC BY-SA",
  source: `https://en.wikipedia.org/wiki/${article}`,
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
});

export const attractions: POI[] = [
  // ---------- NORTH ----------
  {
    id: "canyon-park",
    name: "Canyon Park — Big SUP",
    category: "attraction",
    region: "north",
    shortDescription: "Family stand-up paddleboarding through a turquoise canyon",
    description:
      "An adventure park tucked into the Lima river gorge near Bagni di Lucca. The signature Big SUP experience puts the whole family on one giant paddleboard to glide through a narrow canyon of glowing turquoise water — calm enough for kids and unforgettable for adults. Book the XL/Big SUP slot ahead of time; spots are very limited per day.",
    image: "./images/canyon-park.jpg",
    imageCredit: {
      author: "Luo Jin Hong (Unsplash)",
      license: "Unsplash License",
      source: "https://unsplash.com/photos/1qJ_l5O4OXo",
      licenseUrl: "https://unsplash.com/license"
    },
    website: "https://www.canyonpark.it/",
    address: "Località il Pianello, Bagni di Lucca (LU)",
    coords: [44.0167, 10.5833],
    tags: ["water", "extreme", "family"],
    bookingNote: "Reserve Big SUP / XL SUP slot in advance — limited daily availability.",
    difficulty: "easy",
    tips: [
      "Book the Big SUP slot the night before — only a handful per day",
      "All ages welcome on the SUP; life vests provided for everyone",
      "Phones stay onshore — bring a small dry bag for keys & sun cream",
      "Quick-dry swimwear and water shoes; expect to be soaked"
    ],
    quizFacts: [
      {
        question: "What color is the water inside the canyon at Canyon Park?",
        correctAnswer: "Bright turquoise",
        distractors: ["Pitch black", "Milky white", "Brick red"]
      },
      {
        question: "Which river carved the gorge that Canyon Park sits in?",
        correctAnswer: "The Lima",
        distractors: ["The Tiber", "The Arno", "The Po"]
      },
      {
        question: "Bagni di Lucca, the town next to Canyon Park, has been famous since Roman times for what kind of natural water?",
        correctAnswer: "Hot thermal springs",
        distractors: ["Tasty fizzy lemonade", "Salty seawater", "Glow-in-the-dark rivers"]
      }
    ]
  },
  {
    id: "ponte-del-diavolo",
    name: "Ponte del Diavolo (Devil's Bridge)",
    category: "attraction",
    region: "north",
    shortDescription: "A medieval humpback bridge wrapped in legend",
    description:
      "A dramatic 11th-century bridge arching impossibly over the Serchio river just outside Borgo a Mozzano. Local legend says the devil himself finished it overnight in exchange for the first soul to cross — outsmarted by the villagers, who sent a dog. A short photo stop with great folklore for the kids.",
    image: "./images/ponte-del-diavolo.jpg",
    imageCredit: wmCredit("Ponte_della_Maddalena"),
    website: "https://www.visittuscany.com/en/attractions/ponte-della-maddalena-devils-bridge/",
    address: "Borgo a Mozzano (LU)",
    coords: [43.9869, 10.5475],
    tags: ["culture", "view", "family"],
    difficulty: "easy",
    tips: [
      "Free, open 24/7 — a 10-minute photo stop is plenty",
      "Tiny lay-by just north of the bridge; arrive early or late",
      "Best photo from the river bank, not the bridge itself"
    ],
    quizFacts: [
      {
        question: "In the Devil's Bridge legend, what did the villagers send across first to outsmart the devil?",
        correctAnswer: "A dog",
        distractors: ["A cat", "A goat", "A chicken"]
      },
      {
        question: "What was the devil promised in exchange for finishing the bridge in one night?",
        correctAnswer: "The soul of the first to cross it",
        distractors: ["A bag of gold", "A goat every year", "The mayor's daughter"]
      },
      {
        question: "Which river does the Devil's Bridge arch over?",
        correctAnswer: "The Serchio",
        distractors: ["The Tiber", "The Arno", "The Lima"]
      },
      {
        question: "What is the bridge's proper, official name (after the chapel that once stood at its foot)?",
        correctAnswer: "Ponte della Maddalena (Mary Magdalene's Bridge)",
        distractors: [
          "Ponte Vecchio (Old Bridge)",
          "Ponte Romano (Roman Bridge)",
          "Ponte di San Pietro (St Peter's Bridge)"
        ]
      },
      {
        question: "Local folklore says a ghostly white sheepdog still walks the Devil's Bridge — when?",
        correctAnswer: "On evenings at the end of October",
        distractors: [
          "Every Sunday morning at sunrise",
          "Only on the kid's birthday",
          "On the last day of school every year"
        ]
      }
    ]
  },
  {
    id: "selva-buffardello",
    name: "Parco Avventura Selva del Buffardello",
    category: "attraction",
    region: "north",
    shortDescription: "Shaded forest ropes course with kid-friendly heights",
    description:
      "A professional adventure park in a cool chestnut forest above the Garfagnana. Multiple ropes courses and zip lines are graded by height — including dedicated routes from 100 cm so younger kids can do the real thing safely. A welcome shaded escape on a hot August day.",
    image: "./images/selva-buffardello.jpg",
    imageCredit: {
      author: "Unsplash",
      license: "Unsplash License",
      source: "https://unsplash.com/photos/jKVfhe-z8U4",
      licenseUrl: "https://unsplash.com/license"
    },
    website: "https://www.selvadelbuffardello.it/",
    address: "Loc. Buffardello, Villa Collemandina (LU)",
    coords: [44.1644, 10.4339],
    tags: ["extreme", "family", "nature"],
    difficulty: "moderate",
    tips: [
      "100 cm minimum for the dedicated kid course; 140 cm for the high routes",
      "Closed-toe shoes are mandatory — no sandals",
      "Helmet, harness and safety briefing included in the ticket",
      "Shaded chestnut forest — bring a long-sleeve top, can be cool"
    ],
    quizFacts: [
      {
        question: "What kind of trees fill the cool forest at Selva del Buffardello?",
        correctAnswer: "Chestnut trees",
        distractors: ["Olive trees", "Lemon trees", "Cypress trees"]
      },
      {
        question: "What is a 'Buffardello' in Garfagnana folk tales — the very creature the forest is named after?",
        correctAnswer: "A small, mischievous forest elf who tangles horses' manes",
        distractors: [
          "A giant white wolf that guards the chestnuts",
          "A flying turtle that lives in the rivers",
          "A real Tuscan dinosaur scientists found in 1972"
        ]
      },
      {
        question: "Garfagnana, the area around Selva del Buffardello, is famous across Italy for flour made from which fruit?",
        correctAnswer: "Chestnuts",
        distractors: ["Walnuts", "Bananas", "Olives"]
      }
    ]
  },
  {
    id: "soft-rafting-serchio",
    name: "Soft Rafting — Serchio River",
    category: "attraction",
    region: "north",
    shortDescription: "Gentle white-water rafting suited for families",
    description:
      "A relaxed, splashy float down the Serchio with calm stretches, a few playful rapids, and chances to jump in and swim. Operators in the Bagni di Lucca / Garfagnana area run family-friendly trips of around 2 hours — wet, cool, and a perfect contrast to the August heat.",
    image: "./images/serchio-rafting.jpg",
    imageCredit: {
      author: "Unsplash",
      license: "Unsplash License",
      source: "https://unsplash.com/photos/ayhiuTdcUEk",
      licenseUrl: "https://unsplash.com/license"
    },
    website: "https://www.canyonpark.it/",
    address: "Garfagnana (LU)",
    coords: [44.0742, 10.4853],
    tags: ["water", "family", "nature"],
    difficulty: "easy",
    tips: [
      "Family raft is around 2 hours including swim breaks",
      "Min age usually 6; under-12s wear life vests the whole way",
      "Wear swimwear, bring a dry change of clothes for the drive home",
      "August water levels are gentle — splashy, not scary"
    ]
  },
  {
    id: "pisa",
    name: "Pisa — Piazza dei Miracoli",
    category: "attraction",
    region: "north",
    shortDescription: "The leaning tower and the cathedral square — a quick wow stop",
    description:
      "Skip the city centre and aim straight for Piazza dei Miracoli. The Leaning Tower, the cathedral, and the baptistery sit together on bright green lawn — one of the most photogenic 30-minute stops in Italy. Park outside the walls (the area is full ZTL) and walk in. Excellent gelato just off the square.",
    image: "./images/pisa.jpg",
    imageCredit: {
      author: "Saffron Blaze",
      license: "CC BY-SA 3.0",
      source:
        "https://commons.wikimedia.org/wiki/File:The_Leaning_Tower_of_Pisa_SB.jpeg",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/"
    },
    website: "https://www.opapisa.it/en/",
    address: "Piazza del Duomo, 56126 Pisa (PI)",
    coords: [43.7229, 10.3966],
    tags: ["culture", "view", "family"],
    openingNote: "ZTL all around the square — park outside the walls and walk.",
    difficulty: "easy",
    tips: [
      "Park at 'Via Pietrasantina' (€2/hr) — free shuttle bus to the square",
      "30–45 min is enough for the photo + gelato",
      "Tower climb is timed-ticket only — book online before you go",
      "Best 'leaning hand' photo from the lawn opposite the cathedral"
    ],
    quizFacts: [
      {
        question: "Why does the Leaning Tower of Pisa actually lean?",
        correctAnswer: "Its soft ground sank on one side while it was being built",
        distractors: [
          "An earthquake tilted it on purpose",
          "The architect designed it that way for fun",
          "Strong wind pushes it over a little bit each year"
        ]
      },
      {
        question: "What is the famous square in Pisa called, where the Leaning Tower stands?",
        correctAnswer: "Piazza dei Miracoli",
        distractors: ["Piazza della Signoria", "Piazza San Marco", "Piazza Navona"]
      },
      {
        question: "Which three big buildings sit together on the lawn of Piazza dei Miracoli?",
        correctAnswer: "The Leaning Tower, the cathedral, and the baptistery",
        distractors: [
          "Just the Leaning Tower on its own",
          "Five different churches in a row",
          "A castle, a fountain and a windmill"
        ]
      },
      {
        question: "Roughly how long did the Leaning Tower of Pisa take to finish?",
        correctAnswer: "Almost 200 years",
        distractors: ["Less than a year", "About 5 years", "Over a thousand years"]
      },
      {
        question: "How many bells sit at the top of the Leaning Tower of Pisa — one for each note of the musical scale?",
        correctAnswer: "Seven",
        distractors: ["Just one giant bell", "Twelve", "There are no bells at all"]
      }
    ]
  },
  {
    id: "abetone-monte-gomito",
    name: "Abetone — Monte Gomito Cable Car",
    category: "attraction",
    region: "north",
    shortDescription: "Modern cable car to a cool ridge near 2,000 m",
    description:
      "Abetone is the Apennine ski village that turns into a high-altitude playground in summer. Ride the new gondola to Monte Gomito (about 1,892 m) for cool air, panoramic ridge walks, and easy family trails through pine forest. A perfect midday escape from the heat below.",
    image: "./images/abetone.jpg",
    imageCredit: {
      author: "Wikimedia Commons contributors",
      license: "CC BY-SA 4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Foresta_piazzale_Abetone.jpg",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
    },
    website: "https://www.abetonefuniviaombrellino.it/",
    address: "Abetone Cutigliano (PT)",
    coords: [44.1344, 10.6717],
    tags: ["nature", "view", "family"],
    difficulty: "easy",
    tips: [
      "Bring a light jacket — 12–15 °C cooler at the top, even in August",
      "First gondola ~09:30, last descent ~17:00 — don't miss it",
      "Round-trip ticket ~€18 adult / cheaper for kids; cash works",
      "Pack a picnic — mountain restaurants close mid-afternoon"
    ],
    quizFacts: [
      {
        question: "What is Abetone famous for in winter, when it's covered in snow?",
        correctAnswer: "Skiing",
        distractors: ["Surfing big waves", "Beach volleyball tournaments", "Truffle hunting on the beach"]
      },
      {
        question: "Roughly how high is the top of Monte Gomito above sea level?",
        correctAnswer: "Almost 1,900 metres",
        distractors: ["About 100 metres", "About 500 metres", "Over 4,000 metres"]
      },
      {
        question: "Which mountain range does Abetone sit in?",
        correctAnswer: "The Apennines",
        distractors: ["The Alps", "The Dolomites", "The Pyrenees"]
      },
      {
        question: "Two famous twin stone monuments at Abetone mark an old border between Tuscany and a neighbour. What shape are they?",
        correctAnswer: "Twin pyramids",
        distractors: ["Twin lighthouses", "Twin obelisks", "Twin castles"]
      }
    ]
  },
  {
    id: "lucca-walls",
    name: "Lucca City Walls — Bike Loop",
    category: "attraction",
    region: "north",
    shortDescription: "Cycle the 4 km tree-lined Renaissance wall ring around old Lucca",
    description:
      "Lucca's massive 16th-century walls were never tested in battle and were turned into a leafy public promenade in the 19th century. Today the 4.2 km grass-and-tree-shaded ring on top of the walls is one of Tuscany's signature family bike rides — completely flat, completely traffic-free, with rampart views into the old city on one side and the Tuscan plain on the other. Rental shops cluster around Porta San Pietro and Piazzale Verdi (Tourist Center Lucca, Cicli Bizzarri, Poli Antonio Bici); kids' bikes, child seats and trailers are all standard. Loop the walls in 30–45 min, then drop the bikes and disappear into the old town for gelato.",
    image: "./images/lucca-walls.jpg",
    imageCredit: wmCredit("Walls_of_Lucca"),
    website: "https://en.wikipedia.org/wiki/Walls_of_Lucca",
    address: "Mura Urbane di Lucca, Piazzale Verdi (LU)",
    coords: [43.8443, 10.5050],
    tags: ["family", "culture", "nature", "view"],
    difficulty: "easy",
    tips: [
      "Rentals from ~€4/hr near Porta San Pietro & Piazzale Verdi",
      "Whole 4.2 km loop ~30–45 min easy pedalling, totally flat",
      "Child seats, tagalongs and trailers are standard at every shop",
      "Park outside the walls — the historic centre is full ZTL"
    ],
    quizFacts: [
      {
        question: "Roughly how long is the bike loop on top of Lucca's city walls?",
        correctAnswer: "About 4 kilometres",
        distractors: ["About 400 metres", "About 20 kilometres", "About 100 kilometres"]
      },
      {
        question: "How many real battles were Lucca's huge city walls ever tested in?",
        correctAnswer: "None — they were never attacked",
        distractors: ["Three big wars", "The Roman conquest of Italy", "The First World War"]
      },
      {
        question: "Lucca's walls were never attacked, but they DID hold back something else once, in 1812. What?",
        correctAnswer: "A flood from the Serchio river — the gates were bolted with mattresses",
        distractors: [
          "A herd of escaped circus elephants",
          "A swarm of bees that lived in town",
          "A surprise snowstorm in summer"
        ]
      },
      {
        question: "How many big lookout points (called bastions) are built into Lucca's walls?",
        correctAnswer: "Eleven",
        distractors: ["Just one", "Two", "Fifty"]
      }
    ]
  },
  {
    id: "sentierelsa",
    name: "Sentierelsa — Diborrato Waterfall",
    category: "attraction",
    region: "north",
    shortDescription: "Walk a turquoise river to a hidden waterfall",
    description:
      "A short, magical river walk along the Elsa near Colle di Val d'Elsa. The path crosses small wooden bridges and lets you wade through pools of impossibly turquoise water on the way to the Diborrato waterfall — a cliff-rimmed swimming hole where the brave cliff-jump from above. Closed-toe water shoes are essential.",
    image: "./images/sentierelsa.jpg",
    imageCredit: wmCredit("Elsa_(river)"),
    website: "https://www.sentierelsa.it/",
    address: "Colle di Val d'Elsa (SI)",
    coords: [43.4197, 11.1289],
    tags: ["water", "nature", "family"],
    difficulty: "moderate",
    tips: [
      "Closed-toe water shoes are mandatory — barefoot is dangerous on the rocks",
      "Free entry; no toilets at the trailhead — go in town first",
      "Cliff-jumping at Diborrato is for strong swimmers only",
      "Bring a dry bag for phones — there's no totally dry stretch"
    ],
    quizFacts: [
      {
        question: "What is the cliff-rimmed swimming hole at the end of the Sentierelsa walk called?",
        correctAnswer: "Diborrato",
        distractors: ["Cala Galera", "Saturnia", "Ponte Vecchio"]
      },
      {
        question: "Why does the water of the Elsa river look so bright turquoise?",
        correctAnswer: "Tiny bits of natural calcium in the water make it shine that colour",
        distractors: [
          "Someone pours blue dye in upstream",
          "It's just the green trees reflecting in the water",
          "Hidden glow-fish swim under the surface"
        ]
      },
      {
        question: "Roughly how tall is the Diborrato waterfall at the end of the Sentierelsa?",
        correctAnswer: "About 15 metres — taller than a five-storey house",
        distractors: [
          "Half a metre — about a kid's knee",
          "Over 200 metres — taller than the Empire State Building",
          "Exactly 1,000 metres — the tallest waterfall in Europe"
        ]
      }
    ]
  },

  // ---------- SOUTH ----------
  {
    id: "porto-santo-stefano",
    name: "Porto Santo Stefano — Boat Day",
    category: "attraction",
    region: "south",
    shortDescription: "Rent a small motorboat — no licence needed — and play captain",
    description:
      "The harbour town on Monte Argentario where you rent a Gozzo or gommone for the day (no licence needed for the smaller engines). Cruise the peninsula, drop anchor in glassy coves, and snorkel right off the boat. Stop for lunch on board or at one of the tiny waterside trattorie at Cala Galera.",
    image: "./images/porto-santo-stefano.jpg",
    imageCredit: wmCredit("Porto_Santo_Stefano"),
    website: "https://www.argentarioboat.com/",
    address: "Porto Santo Stefano, Monte Argentario (GR)",
    coords: [42.4361, 11.1167],
    tags: ["water", "family", "view"],
    bookingNote: "Book a Gozzo / gommone for 22 Aug well in advance.",
    difficulty: "easy",
    tips: [
      "No license needed for engines under 40 hp — quick safety briefing only",
      "Marine fuel is pricey: budget €40–80 on top of the rental",
      "Bring snorkel masks, reef-safe sun cream, a cooler & lots of water",
      "Check the wind forecast — strong meltemi means rough water; reschedule if needed"
    ],
    quizFacts: [
      {
        question: "What kind of boat do families rent at Porto Santo Stefano?",
        correctAnswer: "A small motorboat (Gozzo or gommone)",
        distractors: ["A racing yacht", "A small submarine", "A wooden pirate ship"]
      },
      {
        question: "Which mountain peninsula does Porto Santo Stefano sit on?",
        correctAnswer: "Monte Argentario",
        distractors: ["Mount Etna", "Monte Bianco", "Mount Vesuvius"]
      },
      {
        question: "Why is the mountain at Porto Santo Stefano called 'Monte Argentario'? ('Argento' means silver in Italian.)",
        correctAnswer: "It's named after Roman bankers, the 'Argentari', who once owned it",
        distractors: [
          "Real silver was mined inside the mountain",
          "Silver fish jump out of the sea around it",
          "The cliffs sparkle silver in the moonlight"
        ]
      },
      {
        question: "Long ago, Monte Argentario was actually NOT a peninsula. What was it?",
        correctAnswer: "An island — sand washed in by a river later joined it to the mainland",
        distractors: [
          "An underwater volcano",
          "A pirate's hidden treasure cave",
          "A Roman-built artificial castle"
        ]
      }
    ]
  },
  {
    id: "cala-del-gesso",
    name: "Cala del Gesso",
    category: "attraction",
    region: "south",
    shortDescription: "A turquoise pocket cove on the wild side of Argentario",
    description:
      "Often called the most beautiful cove on Monte Argentario — a small white-pebble beach below sheer cliffs, a tiny Spanish watchtower, and water so clear it looks fake. Reachable on foot via a steep path, but the easy way is to anchor your rental boat just offshore and swim in.",
    image: "./images/cala-del-gesso.jpg",
    imageCredit: {
      author: "Cristina Gottardi (Unsplash)",
      license: "CC0 / Public Domain",
      source: "https://unsplash.com/photos/7_APbY7Afsg",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/"
    },
    address: "Monte Argentario (GR)",
    coords: [42.3642, 11.1233],
    tags: ["water", "nature", "view"],
    difficulty: "moderate",
    tips: [
      "Easiest by boat — anchor offshore and swim in",
      "Land path is steep, ~30 min down and a sweaty 40 min back up",
      "White pebbles, no sand — water shoes save your feet",
      "No facilities of any kind: bring your own water and snacks"
    ],
    quizFacts: [
      {
        question: "What is the beach made of at Cala del Gesso?",
        correctAnswer: "White pebbles",
        distractors: ["Black volcanic sand", "Wooden planks", "Soft mud"]
      },
      {
        question: "Who built the small old watchtower above Cala del Gesso, around the 1500s?",
        correctAnswer: "The Spanish",
        distractors: ["The Vikings", "The Egyptians", "The ancient Greeks"]
      },
      {
        question: "Why is Cala del Gesso called 'Cala del Gesso'? ('Gesso' means gypsum, the rock used to make plaster.)",
        correctAnswer: "Long ago, gypsum was mined and shipped out from this little bay",
        distractors: [
          "Famous artists once painted there with chalk",
          "It was used as a school's giant chalkboard",
          "It's always covered in white plaster bandages"
        ]
      }
    ]
  },
  {
    id: "acqua-village-follonica",
    name: "Acqua Village Follonica",
    category: "attraction",
    region: "south",
    shortDescription: "Hawaiian-themed water park with serious slides",
    description:
      "The biggest, most polished water park in southern Tuscany — Polynesian theming, multi-lane slides, a wave pool, and a lazy river. A full-day, all-ages adrenaline reset between cultural and outdoor days.",
    image: "./images/acqua-village.jpg",
    imageCredit: {
      author: "Unsplash",
      license: "Unsplash License",
      source: "https://unsplash.com/photos/1-P3CP8Z1Qg",
      licenseUrl: "https://unsplash.com/license"
    },
    website: "https://www.acquavillage.it/follonica/",
    address: "Via Sanzio, 58022 Follonica (GR)",
    coords: [42.9183, 10.7717],
    tags: ["water", "extreme", "family"],
    difficulty: "easy",
    tips: [
      "Buy tickets online — meaningfully cheaper than at the gate",
      "Lockers ~€5 with key deposit; bring a €1 coin",
      "Outside food is allowed in the picnic area — pack a cooler",
      "Arrive at opening (10:00) — slide queues triple after lunch"
    ]
  },
  {
    id: "maremma-horseback",
    name: "Maremma Horseback Riding",
    category: "attraction",
    region: "south",
    shortDescription: "Ride with the butteri (Maremma cowboys) through dunes and pine forest",
    description:
      "The Maremma is Italy's old cowboy country, and several family-run agriturismi offer guided beginner rides through umbrella-pine forests and back-country dunes. Cool early-morning slot is the best — book a 1-hour family pony / horse experience at a ranch near Alberese or Albinia.",
    image: "./images/maremma-horse.jpg",
    imageCredit: wmCredit("Maremmano"),
    website: "https://www.parco-maremma.it/en/",
    address: "Parco della Maremma, Alberese (GR)",
    coords: [42.6647, 11.0883],
    tags: ["nature", "family"],
    difficulty: "easy",
    tips: [
      "Long pants (jeans) and closed-toe shoes are non-negotiable",
      "Min age usually 6 for trail rides; younger kids get a led pony",
      "Book the 09:00 slot — by 11 it's brutally hot in the open",
      "Helmets always provided; bring a wide-brim hat for after"
    ],
    quizFacts: [
      {
        question: "What are the cowboys of the Maremma traditionally called?",
        correctAnswer: "Butteri",
        distractors: ["Toreros", "Gauchos", "Vaqueros"]
      },
      {
        question: "In 1890, the Maremma butteri took on a famous American cowboy showman in a riding contest in Rome. Who was he?",
        correctAnswer: "Buffalo Bill",
        distractors: ["Wild Bill Hickok", "John Wayne", "Buffalo Bob"]
      },
      {
        question: "Who actually won that famous 1890 cowboy contest in Rome?",
        correctAnswer: "The Italian butteri",
        distractors: [
          "Buffalo Bill's American cowboys",
          "It was a tie",
          "The horses, by running away"
        ]
      },
      {
        question: "What kind of trees fill the forests where the Maremma horses ride?",
        correctAnswer: "Umbrella pine trees",
        distractors: ["Olive trees", "Banana trees", "Christmas fir trees"]
      }
    ]
  },
  {
    id: "pitigliano",
    name: "Pitigliano",
    category: "attraction",
    region: "south",
    shortDescription: "The 'Little Jerusalem' carved out of a tufa cliff",
    description:
      "An Etruscan-Jewish hill town that grows straight out of the volcanic tufa rock — best photographed from the viewpoint on the road in. Wander the old Jewish quarter, ducking into the synagogue, kosher bakery and rock-cut wine cellars. Plenty of cool, shaded alleys for an afternoon walk.",
    image: "./images/pitigliano.jpg",
    imageCredit: wmCredit("Pitigliano"),
    website: "https://visit.pitigliano.org/en/",
    address: "Pitigliano (GR)",
    coords: [42.6353, 11.6700],
    tags: ["culture", "village", "view"],
    difficulty: "easy",
    tips: [
      "Park at the big lot opposite the panorama viewpoint",
      "Synagogue + Jewish quarter combo ticket ~€6 — closes early Friday",
      "Don't leave without a slice of 'sfratto dei Goym' (local Jewish-Italian dessert)",
      "Cool, shaded alleys make this the ideal late-afternoon walk"
    ],
    quizFacts: [
      {
        question: "What is Pitigliano's famous nickname?",
        correctAnswer: "The Little Jerusalem",
        distractors: ["The Roman Ruin", "The Pearl of the Sea", "Little Athens"]
      },
      {
        question: "What kind of rock is Pitigliano carved straight out of?",
        correctAnswer: "Tufa, a soft volcanic rock",
        distractors: [
          "Solid white marble",
          "Sandstone from the seabed",
          "Crystal-clear ice"
        ]
      },
      {
        question: "Which two ancient peoples carved into the cliffs at Pitigliano over the centuries?",
        correctAnswer: "First the Etruscans, then a Jewish community",
        distractors: [
          "Vikings and Romans",
          "Ancient Greeks and Egyptians",
          "Mongols and Spanish conquistadors"
        ]
      },
      {
        question: "What is the name of the famous Pitigliano sweet treat — a long stick-shaped pastry filled with walnuts and honey?",
        correctAnswer: "Sfratto",
        distractors: ["Cannolo", "Tiramisu", "Panettone"]
      }
    ]
  },
  {
    id: "via-cava-san-giuseppe",
    name: "Via Cava di San Giuseppe",
    category: "attraction",
    region: "south",
    shortDescription: "Etruscan rock corridors carved up to 20 m deep",
    description:
      "The Vie Cave are mysterious Etruscan trenches sliced into the soft tufa, in places more than 20 m deep, threading the woods between Pitigliano, Sovana and Sorano. The San Giuseppe path is the most accessible — cool, shaded, dramatic, and feels like walking through a natural maze.",
    image: "./images/via-cava.jpg",
    imageCredit: wmCredit("Vie_Cave"),
    website: "https://www.parcodeglietruschi.it/en/",
    address: "Pitigliano (GR)",
    coords: [42.6313, 11.6722],
    tags: ["culture", "cave", "nature"],
    difficulty: "moderate",
    tips: [
      "Free, no ticket — trailhead just below the old town",
      "Wear grippy shoes — the tufa is shaded but slick when damp",
      "1-hour comfortable loop; longer if you take the Sovana extension",
      "Surprisingly cool down inside — bring a light layer"
    ],
    quizFacts: [
      {
        question: "Who carved the deep stone corridors of the Vie Cave?",
        correctAnswer: "The Etruscans",
        distractors: [
          "The Ancient Egyptians",
          "The Vikings",
          "Modern miners with bulldozers"
        ]
      },
      {
        question: "How deep can the Vie Cave corridors get?",
        correctAnswer: "More than 20 metres deep",
        distractors: ["Less than 1 metre", "About 200 metres", "Almost 2,000 metres"]
      },
      {
        question: "Why is it cool inside the Vie Cave even on a hot August day?",
        correctAnswer: "The tall walls of rock keep out the sun",
        distractors: [
          "There's hidden air conditioning",
          "There's a secret ice cave at the end",
          "Snow falls inside because of the altitude"
        ]
      }
    ]
  },
  {
    id: "vitozza",
    name: "Vitozza Cave City",
    category: "attraction",
    region: "south",
    shortDescription: "Abandoned medieval cave dwellings in the woods",
    description:
      "Over 200 cave dwellings hollowed into the tufa cliffs of a forested ravine near San Quirico di Sorano — a wild, atmospheric site you mostly explore alone. Great backup or alternative to the Vie Cave, especially if the kids love crawling into rock-cut rooms with a headlamp.",
    image: "./images/vitozza.jpg",
    imageCredit: wmCredit("Sorano"),
    website: "https://visit.pitigliano.org/en/",
    address: "San Quirico, Sorano (GR)",
    coords: [42.6864, 11.7464],
    tags: ["cave", "nature", "culture"],
    difficulty: "challenging",
    tips: [
      "Bring a head-lamp per person — the chambers are properly dark",
      "1.5–2 hr round trip on uneven, sometimes overgrown ground",
      "Wild, atmospheric, almost no signage — keep close to the trail",
      "Wear long pants & closed shoes; brambles & rough stone"
    ],
    quizFacts: [
      {
        question: "Roughly how many cave dwellings are there at Vitozza?",
        correctAnswer: "Over 200",
        distractors: ["Just 5", "Exactly 10", "More than 5,000"]
      },
      {
        question: "Until roughly when did people actually still live inside the caves of Vitozza?",
        correctAnswer: "Until the late 1700s",
        distractors: [
          "Only during the Stone Age",
          "Only in ancient Roman times",
          "All the way until last year"
        ]
      },
      {
        question: "Many of the caves at Vitozza have shapes carved into the rock walls inside. What were they used as?",
        correctAnswer: "As wardrobes and shelves for everyday things",
        distractors: [
          "As secret slides for kids",
          "As fish tanks for goldfish",
          "As frozen-food drawers"
        ]
      }
    ]
  },
  {
    id: "saturnia",
    name: "Cascate del Mulino — Saturnia Hot Springs",
    category: "attraction",
    region: "south",
    shortDescription: "Free, 24/7 turquoise hot waterfalls — best at sunrise",
    description:
      "A natural staircase of warm sulphur pools and the iconic milky-blue waterfall. Free and open 24/7. The trick is timing: arrive by 07:30 to enjoy steam rising off cool morning water in near-empty pools. By 10 am it's packed and parking disappears.",
    image: "./images/saturnia.jpg",
    imageCredit: wmCredit("Saturnia"),
    website: "https://www.termedisaturnia.it/en/",
    address: "Cascate del Mulino, Saturnia, Manciano (GR)",
    coords: [42.6483, 11.5089],
    tags: ["water", "nature", "view"],
    openingNote: "Free, open 24/7. Arrive by 07:30 to beat crowds and heat.",
    difficulty: "easy",
    tips: [
      "100 % free, 24/7, no facilities, no lockers — leave valuables in the car",
      "Sulphur stains light fabrics — wear darker swimwear and rinse after",
      "Bring sandals you don't mind smelling of eggs for a few days",
      "Arrive by 07:30; by 10 it's elbow-to-elbow and parking is gone"
    ],
    quizFacts: [
      {
        question: "Why does the water at Saturnia smell a bit like eggs?",
        correctAnswer: "It's full of natural sulphur from underground",
        distractors: [
          "Because chickens swim upstream from a farm",
          "Because of pizza ovens nearby",
          "From soap that bathers leave behind"
        ]
      },
      {
        question: "What is special about the colour of Saturnia's waterfalls?",
        correctAnswer: "They are a milky turquoise blue",
        distractors: [
          "They are bright orange",
          "They are completely jet black",
          "They glow green in the dark"
        ]
      },
      {
        question: "An old Roman legend says Saturnia's hot springs were created when an angry god threw lightning bolts at the earth. Which god?",
        correctAnswer: "Saturn — the town and the springs are named after him",
        distractors: [
          "Mars, the god of war",
          "Neptune, the god of the sea",
          "Mercury, the messenger god"
        ]
      },
      {
        question: "Roughly how warm is the water that comes out of the springs at Saturnia?",
        correctAnswer: "About 37 °C — like a warm bath",
        distractors: [
          "About 5 °C — almost freezing",
          "About 100 °C — boiling hot",
          "About 0 °C — covered in ice"
        ]
      }
    ]
  },
  {
    id: "lago-di-bolsena",
    name: "Lago di Bolsena",
    category: "attraction",
    region: "south",
    shortDescription: "Europe's largest volcanic lake — calm, clean, swimmable",
    description:
      "A vast volcanic crater lake with cool, clean fresh water — a far easier swim than the crowded Tuscan coast in August. The little towns of Bolsena and Capodimonte have shaded grassy beaches, gelato and pedalos. A perfect midday cool-down on the way back from the south.",
    image: "./images/bolsena.jpg",
    imageCredit: wmCredit("Lake_Bolsena"),
    website: "https://www.comune.bolsena.vt.it/",
    address: "Bolsena (VT)",
    coords: [42.6447, 11.9847],
    tags: ["water", "family", "nature"],
    difficulty: "easy",
    tips: [
      "Free public beaches at Bolsena & Capodimonte; pay loungers also available",
      "Lake water is cooler than the August coast — refreshing, not freezing",
      "Pedalo & SUP rental at the marina; ice-cream & snack bars right there",
      "Lake-fish 'coregone' is the local specialty — try at a marina trattoria"
    ],
    quizFacts: [
      {
        question: "What kind of crater formed Lake Bolsena a long time ago?",
        correctAnswer: "An old volcano collapsing into itself",
        distractors: [
          "A meteor that landed yesterday",
          "A giant whale's footprint",
          "An abandoned diamond mine"
        ]
      },
      {
        question: "Lake Bolsena is the largest lake in Europe of which kind?",
        correctAnswer: "The largest volcanic lake",
        distractors: [
          "The largest salt lake",
          "The largest underground lake",
          "The largest pink lake"
        ]
      },
      {
        question: "Which fish is the local specialty of Lake Bolsena?",
        correctAnswer: "Coregone",
        distractors: ["Salmon", "Tuna", "Shark"]
      },
      {
        question: "How many islands sit in the southern part of Lake Bolsena?",
        correctAnswer: "Two — Bisentina and Martana",
        distractors: ["None at all", "About a dozen", "More than a hundred"]
      }
    ]
  },
  {
    id: "civita-di-bagnoregio",
    name: "Civita di Bagnoregio",
    category: "attraction",
    region: "south",
    shortDescription: "The 'dying city' on a tufa pedestal, reached by footbridge",
    description:
      "An impossibly photogenic medieval village perched on a crumbling tufa column, accessible only by a long pedestrian bridge over a canyon of badlands. Tiny ticket fee, then a short steep walk into a tiny stone village frozen in time. Best in late afternoon light.",
    image: "./images/civita.jpg",
    imageCredit: wmCredit("Civita_di_Bagnoregio"),
    website: "https://www.civitadibagnoregio.cloud/en/",
    address: "Civita di Bagnoregio, Bagnoregio (VT)",
    coords: [42.6275, 12.1131],
    tags: ["culture", "village", "view"],
    difficulty: "moderate",
    tips: [
      "Footbridge ticket ~€5/adult, cash only — kids under 6 free",
      "The walk back is properly steep — strollers will struggle",
      "Best light & cooler temps in late afternoon; village glows at golden hour",
      "Tiny grocery on the bridge side — BYO water for the climb"
    ],
    quizFacts: [
      {
        question: "What is Civita di Bagnoregio's famous nickname?",
        correctAnswer: "The Dying City",
        distractors: ["The Singing City", "The Sleeping Castle", "The Twin City"]
      },
      {
        question: "How do visitors reach the village of Civita di Bagnoregio?",
        correctAnswer: "Across a long pedestrian footbridge over a canyon",
        distractors: [
          "By cable car",
          "By small submarine",
          "Through a long underground tunnel"
        ]
      },
      {
        question: "Why is Civita called the 'Dying City'?",
        correctAnswer: "The tufa pedestal it sits on is slowly crumbling away",
        distractors: [
          "All of its people are very, very old",
          "It is haunted by a friendly ghost",
          "The mayor wants a new, snappier name"
        ]
      },
      {
        question: "How many people actually live in Civita di Bagnoregio today?",
        correctAnswer: "Only about a dozen",
        distractors: ["Over a thousand", "About 50,000", "Half the country"]
      },
      {
        question: "Civita di Bagnoregio also has a famous animal population. Roughly how many of these live in the village?",
        correctAnswer: "About 20 cats",
        distractors: ["Around 200 elephants", "About 1,000 pigeons", "Exactly 10 sharks"]
      },
      {
        question: "Civita di Bagnoregio was first founded by which ancient Italian people, more than 2,500 years ago?",
        correctAnswer: "The Etruscans",
        distractors: ["The Vikings", "The Egyptians", "The Aztecs"]
      }
    ]
  }
];

export const getAttraction = (id: string) => attractions.find(a => a.id === id);
