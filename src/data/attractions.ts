import type { POI } from "./types";

export const attractions: POI[] = [
  // ---------- NORTH ----------
  {
    id: "canyon-park",
    name: "Canyon Park — Big SUP",
    category: "attraction",
    region: "north",
    shortDescription: "Family stand-up paddleboarding through a turquoise canyon.",
    description:
      "An adventure park tucked into the Lima river gorge near Bagni di Lucca. The signature Big SUP experience puts the whole family on one giant paddleboard to glide through a narrow canyon of glowing turquoise water — calm enough for kids and unforgettable for adults. Book the XL/Big SUP slot ahead of time; spots are very limited per day.",
    image: "./images/canyon-park.jpg",
    website: "https://www.canyonpark.it/",
    address: "Località il Pianello, Bagni di Lucca (LU)",
    coords: [44.0167, 10.5833],
    tags: ["water", "extreme", "family"],
    bookingNote: "Reserve Big SUP / XL SUP slot in advance — limited daily availability."
  },
  {
    id: "ponte-del-diavolo",
    name: "Ponte del Diavolo (Devil's Bridge)",
    category: "attraction",
    region: "north",
    shortDescription: "A medieval humpback bridge wrapped in legend.",
    description:
      "A dramatic 11th-century bridge arching impossibly over the Serchio river just outside Borgo a Mozzano. Local legend says the devil himself finished it overnight in exchange for the first soul to cross — outsmarted by the villagers, who sent a dog. A short photo stop with great folklore for the kids.",
    image: "./images/ponte-del-diavolo.jpg",
    website: "https://www.visittuscany.com/en/attractions/ponte-della-maddalena-devils-bridge/",
    address: "Borgo a Mozzano (LU)",
    coords: [43.9869, 10.5475],
    tags: ["culture", "view", "family"]
  },
  {
    id: "selva-buffardello",
    name: "Parco Avventura Selva del Buffardello",
    category: "attraction",
    region: "north",
    shortDescription: "Shaded forest ropes course with kid-friendly heights.",
    description:
      "A professional adventure park in a cool chestnut forest above the Garfagnana. Multiple ropes courses and zip lines are graded by height — including dedicated routes from 100 cm so younger kids can do the real thing safely. A welcome shaded escape on a hot August day.",
    image: "./images/selva-buffardello.jpg",
    website: "https://www.selvadelbuffardello.it/",
    address: "Loc. Buffardello, Villa Collemandina (LU)",
    coords: [44.1644, 10.4339],
    tags: ["extreme", "family", "nature"]
  },
  {
    id: "soft-rafting-serchio",
    name: "Soft Rafting — Serchio River",
    category: "attraction",
    region: "north",
    shortDescription: "Gentle white-water rafting suited for families.",
    description:
      "A relaxed, splashy float down the Serchio with calm stretches, a few playful rapids, and chances to jump in and swim. Operators in the Bagni di Lucca / Garfagnana area run family-friendly trips of around 2 hours — wet, cool, and a perfect contrast to the August heat.",
    image: "./images/serchio-rafting.jpg",
    website: "https://www.canyonpark.it/",
    address: "Garfagnana (LU)",
    coords: [44.0742, 10.4853],
    tags: ["water", "family", "nature"]
  },
  {
    id: "pisa",
    name: "Pisa — Piazza dei Miracoli",
    category: "attraction",
    region: "north",
    shortDescription: "The leaning tower and the cathedral square — a quick wow stop.",
    description:
      "Skip the city centre and aim straight for Piazza dei Miracoli. The Leaning Tower, the cathedral, and the baptistery sit together on bright green lawn — one of the most photogenic 30-minute stops in Italy. Park outside the walls (the area is full ZTL) and walk in. Excellent gelato just off the square.",
    image: "./images/pisa.jpg",
    website: "https://www.opapisa.it/en/",
    address: "Piazza del Duomo, 56126 Pisa (PI)",
    coords: [43.7229, 10.3966],
    tags: ["culture", "view", "family"],
    openingNote: "ZTL all around the square — park outside the walls and walk."
  },
  {
    id: "abetone-monte-gomito",
    name: "Abetone — Monte Gomito Cable Car",
    category: "attraction",
    region: "north",
    shortDescription: "Modern cable car to a cool ridge near 2,000 m.",
    description:
      "Abetone is the Apennine ski village that turns into a high-altitude playground in summer. Ride the new gondola to Monte Gomito (about 1,892 m) for cool air, panoramic ridge walks, and easy family trails through pine forest. A perfect midday escape from the heat below.",
    image: "./images/abetone.jpg",
    website: "https://www.abetonefuniviaombrellino.it/",
    address: "Abetone Cutigliano (PT)",
    coords: [44.1344, 10.6717],
    tags: ["nature", "view", "family"]
  },
  {
    id: "sentierelsa",
    name: "Sentierelsa — Diborrato Waterfall",
    category: "attraction",
    region: "north",
    shortDescription: "Walk a turquoise river to a hidden waterfall.",
    description:
      "A short, magical river walk along the Elsa near Colle di Val d'Elsa. The path crosses small wooden bridges and lets you wade through pools of impossibly turquoise water on the way to the Diborrato waterfall — a cliff-rimmed swimming hole where the brave cliff-jump from above. Closed-toe water shoes are essential.",
    image: "./images/sentierelsa.jpg",
    website: "https://www.sentierelsa.it/",
    address: "Colle di Val d'Elsa (SI)",
    coords: [43.4197, 11.1289],
    tags: ["water", "nature", "family"]
  },

  // ---------- SOUTH ----------
  {
    id: "porto-santo-stefano",
    name: "Porto Santo Stefano — Boat Day",
    category: "attraction",
    region: "south",
    shortDescription: "Rent a small motorboat — no licence needed — and play captain.",
    description:
      "The harbour town on Monte Argentario where you rent a Gozzo or gommone for the day (no licence needed for the smaller engines). Cruise the peninsula, drop anchor in glassy coves, and snorkel right off the boat. Stop for lunch on board or at one of the tiny waterside trattorie at Cala Galera.",
    image: "./images/porto-santo-stefano.jpg",
    website: "https://www.argentarioboat.com/",
    address: "Porto Santo Stefano, Monte Argentario (GR)",
    coords: [42.4361, 11.1167],
    tags: ["water", "family", "view"],
    bookingNote: "Book a Gozzo / gommone for 22 Aug well in advance."
  },
  {
    id: "cala-del-gesso",
    name: "Cala del Gesso",
    category: "attraction",
    region: "south",
    shortDescription: "A turquoise pocket cove on the wild side of Argentario.",
    description:
      "Often called the most beautiful cove on Monte Argentario — a small white-pebble beach below sheer cliffs, a tiny Spanish watchtower, and water so clear it looks fake. Reachable on foot via a steep path, but the easy way is to anchor your rental boat just offshore and swim in.",
    image: "./images/cala-del-gesso.jpg",
    address: "Monte Argentario (GR)",
    coords: [42.3642, 11.1233],
    tags: ["water", "nature", "view"]
  },
  {
    id: "acqua-village-follonica",
    name: "Acqua Village Follonica",
    category: "attraction",
    region: "south",
    shortDescription: "Hawaiian-themed water park with serious slides.",
    description:
      "The biggest, most polished water park in southern Tuscany — Polynesian theming, multi-lane slides, a wave pool, and a lazy river. A full-day, all-ages adrenaline reset between cultural and outdoor days.",
    image: "./images/acqua-village.jpg",
    website: "https://www.acquavillage.it/follonica/",
    address: "Via Sanzio, 58022 Follonica (GR)",
    coords: [42.9183, 10.7717],
    tags: ["water", "extreme", "family"]
  },
  {
    id: "maremma-horseback",
    name: "Maremma Horseback Riding",
    category: "attraction",
    region: "south",
    shortDescription: "Ride with the butteri (Maremma cowboys) through dunes and pine forest.",
    description:
      "The Maremma is Italy's old cowboy country, and several family-run agriturismi offer guided beginner rides through umbrella-pine forests and back-country dunes. Cool early-morning slot is the best — book a 1-hour family pony / horse experience at a ranch near Alberese or Albinia.",
    image: "./images/maremma-horse.jpg",
    website: "https://www.parco-maremma.it/en/",
    address: "Parco della Maremma, Alberese (GR)",
    coords: [42.6647, 11.0883],
    tags: ["nature", "family"]
  },
  {
    id: "pitigliano",
    name: "Pitigliano",
    category: "attraction",
    region: "south",
    shortDescription: "The 'Little Jerusalem' carved out of a tufa cliff.",
    description:
      "An Etruscan-Jewish hill town that grows straight out of the volcanic tufa rock — best photographed from the viewpoint on the road in. Wander the old Jewish quarter, ducking into the synagogue, kosher bakery and rock-cut wine cellars. Plenty of cool, shaded alleys for an afternoon walk.",
    image: "./images/pitigliano.jpg",
    website: "https://visit.pitigliano.org/en/",
    address: "Pitigliano (GR)",
    coords: [42.6353, 11.6700],
    tags: ["culture", "village", "view"]
  },
  {
    id: "via-cava-san-giuseppe",
    name: "Via Cava di San Giuseppe",
    category: "attraction",
    region: "south",
    shortDescription: "Etruscan rock corridors carved up to 20 m deep.",
    description:
      "The Vie Cave are mysterious Etruscan trenches sliced into the soft tufa, in places more than 20 m deep, threading the woods between Pitigliano, Sovana and Sorano. The San Giuseppe path is the most accessible — cool, shaded, dramatic, and feels like walking through a natural maze.",
    image: "./images/via-cava.jpg",
    website: "https://www.parcodeglietruschi.it/en/",
    address: "Pitigliano (GR)",
    coords: [42.6313, 11.6722],
    tags: ["culture", "cave", "nature"]
  },
  {
    id: "vitozza",
    name: "Vitozza Cave City",
    category: "attraction",
    region: "south",
    shortDescription: "Abandoned medieval cave dwellings in the woods.",
    description:
      "Over 200 cave dwellings hollowed into the tufa cliffs of a forested ravine near San Quirico di Sorano — a wild, atmospheric site you mostly explore alone. Great backup or alternative to the Vie Cave, especially if the kids love crawling into rock-cut rooms with a headlamp.",
    image: "./images/vitozza.jpg",
    website: "https://visit.pitigliano.org/en/",
    address: "San Quirico, Sorano (GR)",
    coords: [42.6864, 11.7464],
    tags: ["cave", "nature", "culture"]
  },
  {
    id: "saturnia",
    name: "Cascate del Mulino — Saturnia Hot Springs",
    category: "attraction",
    region: "south",
    shortDescription: "Free, 24/7 turquoise hot waterfalls — best at sunrise.",
    description:
      "A natural staircase of warm sulphur pools and the iconic milky-blue waterfall. Free and open 24/7. The trick is timing: arrive by 07:30 to enjoy steam rising off cool morning water in near-empty pools. By 10 am it's packed and parking disappears.",
    image: "./images/saturnia.jpg",
    website: "https://www.termedisaturnia.it/en/",
    address: "Cascate del Mulino, Saturnia, Manciano (GR)",
    coords: [42.6483, 11.5089],
    tags: ["water", "nature", "view"],
    openingNote: "Free, open 24/7. Arrive by 07:30 to beat crowds and heat."
  },
  {
    id: "lago-di-bolsena",
    name: "Lago di Bolsena",
    category: "attraction",
    region: "south",
    shortDescription: "Europe's largest volcanic lake — calm, clean, swimmable.",
    description:
      "A vast volcanic crater lake with cool, clean fresh water — a far easier swim than the crowded Tuscan coast in August. The little towns of Bolsena and Capodimonte have shaded grassy beaches, gelato and pedalos. A perfect midday cool-down on the way back from the south.",
    image: "./images/bolsena.jpg",
    website: "https://www.comune.bolsena.vt.it/",
    address: "Bolsena (VT)",
    coords: [42.6447, 11.9847],
    tags: ["water", "family", "nature"]
  },
  {
    id: "civita-di-bagnoregio",
    name: "Civita di Bagnoregio",
    category: "attraction",
    region: "south",
    shortDescription: "The 'dying city' on a tufa pedestal, reached by footbridge.",
    description:
      "An impossibly photogenic medieval village perched on a crumbling tufa column, accessible only by a long pedestrian bridge over a canyon of badlands. Tiny ticket fee, then a short steep walk into a tiny stone village frozen in time. Best in late afternoon light.",
    image: "./images/civita.jpg",
    website: "https://www.civitadibagnoregio.cloud/en/",
    address: "Civita di Bagnoregio, Bagnoregio (VT)",
    coords: [42.6275, 12.1131],
    tags: ["culture", "village", "view"]
  }
];

export const getAttraction = (id: string) => attractions.find(a => a.id === id);
