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
    name: "Canyon Park",
    category: "attraction",
    region: "north",
    shortDescription: "River paddleboarding and adventures in a Lima canyon",
    description:
      "Italy's first adventure park built inside a river canyon (Visit Tuscany) — slacklines, suspended bridges, canyon courses, and calmer options like a stony beach beside the turquoise Lima. Visitors can hire stand-up paddleboards to paddle the gorge, join soft rafting or water trekking, or try SUP yoga. Our plan focuses on a relaxed family paddle along the river inside the canyon — book your slot ahead in summer because daily capacity is tight. Note: the aerial zip/cable courses typically require kids to be about 10+ and 140 cm tall; double-check the rules for whichever activity you reserve.",
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
    bookingNote:
      "Reserve river SUP / water activities in advance — summer days sell out.",
    difficulty: "easy",
    tips: [
      "Book your chosen water slot (especially SUP) the day before — availability is limited",
      "Life jackets are provided on the water — ask staff if you want extra kid sizes",
      "Phones stay on shore for most water activities — pack a small dry bag",
      "Quick-dry swimwear and closed-toe water shoes; expect splashy fun"
    ],
    quizFacts: [
      {
        question: "Canyon Park is built entirely inside what?",
        correctAnswer: "A deep river canyon",
        distractors: ["A volcano crater", "An old castle", "A giant cave"]
      },
      {
        question: "How is lunch sometimes delivered to the beach at Canyon Park?",
        correctAnswer: "Down a zip-line!",
        distractors: ["By helicopter", "On a trained dog", "On a boat"]
      },
      {
        question: "What do people use to paddle on the Lima River here?",
        correctAnswer: "Stand-up paddleboards (SUP)",
        distractors: ["Wooden gondolas", "Inflatable unicorns", "Motorboats only"]
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
        question: "What animal did the villagers use to trick the devil at the bridge?",
        correctAnswer: "A dog",
        distractors: ["A goat", "A chicken", "A cat"]
      },
      {
        question: "Why does the Devil's Bridge look so wonky?",
        correctAnswer: "The devil built it in one night!",
        distractors: ["An earthquake bent it", "Blindfolded builders made it", "A giant sat on it"]
      },
      {
        question: "What kind of ghost might you see at the bridge in October?",
        correctAnswer: "A glowing white dog",
        distractors: ["A headless knight", "A grumpy troll", "A flying pizza"]
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
        question: "What is the Buffardello elf's favourite night prank?",
        correctAnswer: "Tangling people's hair",
        distractors: ["Stealing left shoes", "Eating all the cheese", "Painting doors blue"]
      },
      {
        question: "What did people leave by the door to stop the Buffardello elf?",
        correctAnswer: "Juniper berries",
        distractors: ["Spicy soup", "A scary mirror", "A mousetrap"]
      },
      {
        question: "What two things must you wear for the tree-climbing courses?",
        correctAnswer: "A harness and a helmet",
        distractors: ["A cape and a sword", "Goggles and flippers", "Heavy snow boots"]
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
        question: "What did the scientist Galileo drop from the Leaning Tower?",
        correctAnswer: "Two heavy cannonballs",
        distractors: ["Two watermelons", "A feather and a hammer", "Two giant pizzas"]
      },
      {
        question: "Why does the Leaning Tower of Pisa lean?",
        correctAnswer: "The soft ground sank",
        distractors: ["An earthquake tilted it", "It was a joke", "A strong wind blew it"]
      },
      {
        question: "How many bells are at the top of the Leaning Tower?",
        correctAnswer: "Seven",
        distractors: ["Just one massive bell", "Fifty tiny bells", "None at all"]
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
        question: "At the top of Monte Gomito, what happens to the temperature?",
        correctAnswer: "It gets much colder",
        distractors: ["It gets boiling hot", "It stays exactly the same", "It changes every five minutes"]
      },
      {
        question: "What do the twin stone pyramids at Abetone mark?",
        correctAnswer: "An old kingdom border",
        distractors: ["A buried treasure", "The highest point in Italy", "An alien landing spot"]
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
        question: "Lucca's walls were never attacked, but they saved the city from what in 1812?",
        correctAnswer: "A massive river flood",
        distractors: ["Angry elephants", "A terrible fire", "Giant bees"]
      },
      {
        question: "How long did it take to build the walls of Lucca?",
        correctAnswer: "About 140 years!",
        distractors: ["Just 3 weeks", "About 5 years", "Over 1000 years"]
      },
      {
        question: "What covers the top of the Lucca city wall today?",
        correctAnswer: "Green grass and big trees",
        distractors: ["Sharp spikes", "Shiny gold coins", "A fast rollercoaster"]
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
        question: "What happens if a branch stays in the Elsa river for a long time?",
        correctAnswer: "It slowly turns to stone!",
        distractors: ["It turns bright pink", "It melts into jelly", "It catches on fire"]
      },
      {
        question: "How deep is the pool under the Diborrato waterfall?",
        correctAnswer: "About 15 metres deep!",
        distractors: ["Only up to your knees", "About 2 metres", "Over 1000 metres deep"]
      },
      {
        question: "Why is the Elsa river so bright turquoise?",
        correctAnswer: "Tiny bits of white calcium",
        distractors: ["Someone pours blue dye in", "It reflects the green trees", "Glow-in-the-dark fish"]
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
        question: "Who built the big stone fortress above the harbour?",
        correctAnswer: "The Spanish",
        distractors: ["The Vikings", "The Egyptians", "The British"]
      },
      {
        question: "Every August, the town has a big race. What do they race in?",
        correctAnswer: "Wooden rowing boats",
        distractors: ["Speedboats", "Bathtubs", "Swimming with flippers"]
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
        question: "Why is this beach called 'Cala del Gesso' (Chalk Cove)?",
        correctAnswer: "Chalky rocks were mined there",
        distractors: ["Artists painted there with chalk", "The water tastes like chalk", "Kids use it as a chalkboard"]
      },
      {
        question: "What is the beach at Cala del Gesso made of?",
        correctAnswer: "Small white pebbles",
        distractors: ["Black volcanic sand", "Soft yellow mud", "Wooden planks"]
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
        question: "Which famous American cowboy did the Italian cowboys beat in 1890?",
        correctAnswer: "Buffalo Bill",
        distractors: ["John Wayne", "Wild Bill Hickok", "Indiana Jones"]
      },
      {
        question: "What are the Maremma cowboys called?",
        correctAnswer: "Butteri",
        distractors: ["Vaqueros", "Gauchos", "Banditos"]
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
        correctAnswer: "Little Jerusalem",
        distractors: ["Little Athens", "The Roman Ruin", "The Pearl of the Sea"]
      },
      {
        question: "What kind of rock is Pitigliano carved out of?",
        correctAnswer: "Tufa, a soft volcanic rock",
        distractors: ["Solid white marble", "Clear ice", "Shiny black coal"]
      },
      {
        question: "What is the famous stick-shaped pastry from Pitigliano called?",
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
        question: "Who carved the deep 'Via Cava' rock roads?",
        correctAnswer: "The Etruscans",
        distractors: ["The Romans", "The Vikings", "Aliens"]
      },
      {
        question: "Why were these roads carved so deep into the rock?",
        correctAnswer: "It's an ancient mystery!",
        distractors: ["To hide from dinosaurs", "To find gold", "As swimming pools"]
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
        question: "In Roman legend, how were the Saturnia hot springs created?",
        correctAnswer: "Jupiter threw a lightning bolt",
        distractors: ["A dragon sneezed fire", "A giant dropped hot soup", "The sun got too close"]
      },
      {
        question: "Why does the warm water at Saturnia smell like rotten eggs?",
        correctAnswer: "It has a mineral called sulphur",
        distractors: ["People drop old eggs in it", "Frogs live at the bottom", "A magic spell"]
      },
      {
        question: "How warm is the water at Saturnia?",
        correctAnswer: "37 degrees, like a warm bath!",
        distractors: ["10 degrees, freezing!", "100 degrees, boiling!", "It changes every day"]
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
