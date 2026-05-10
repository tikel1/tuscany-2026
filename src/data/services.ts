import type { Service } from "./types";

export const services: Service[] = [
  // ==================== NORTH BASE — Larciano area ====================

  // Restaurants
  {
    id: "rest-n-pizzeria-da-paolo",
    name: "Pizzeria Ristorante Da Paolo",
    category: "restaurant",
    region: "north",
    base: "north",
    shortDescription: "Local family pizzeria, classic wood-fired pies.",
    description:
      "An everyday neighbourhood spot in Larciano village — wood-fired pizza, simple pasta, friendly service, kids welcome. The easy go-to on a tired evening.",
    address: "Larciano (PT)",
    coords: [43.8265, 10.8985],
    hours: "Dinner; closed Mon"
  },
  {
    id: "rest-n-osteria-larciano",
    name: "Trattoria del Castello",
    category: "restaurant",
    region: "north",
    base: "north",
    shortDescription: "Tuscan trattoria up in Larciano Castello with a view.",
    description:
      "Up in the medieval upper village, classic Tuscan plates — pappardelle al cinghiale, bistecca, local Chianti — on a small terrace looking over the valley.",
    address: "Larciano Castello (PT)",
    coords: [43.8400, 10.8956],
    hours: "Lunch & dinner"
  },
  {
    id: "rest-n-vinci",
    name: "Ristorante La Torre — Vinci",
    category: "restaurant",
    region: "north",
    base: "north",
    shortDescription: "Tuscan classics in Leonardo's hometown.",
    description:
      "Just across the valley in Vinci (Leonardo's birthplace), a reliable Tuscan kitchen — handmade pasta, grilled meats, good wine list. Pair with a quick walk to the Leonardo museum.",
    address: "Via della Torre 19, Vinci (FI)",
    coords: [43.7861, 10.9261],
    hours: "Lunch & dinner; check Mon"
  },
  {
    id: "rest-n-bagni-lucca",
    name: "Circolo dei Forestieri — Bagni di Lucca",
    category: "restaurant",
    region: "north",
    base: "north",
    shortDescription: "Belle-époque dining hall on the river.",
    description:
      "A historic former gentlemen's club turned restaurant, right on the Lima river in Bagni di Lucca. Big shaded terrace — perfect lunch after Canyon Park or rafting.",
    address: "Piazza Jean Varraud 10, Bagni di Lucca (LU)",
    coords: [44.0103, 10.5969],
    hours: "Lunch & dinner"
  },
  {
    id: "rest-n-pisa",
    name: "Osteria dei Cavalieri — Pisa",
    category: "restaurant",
    region: "north",
    base: "north",
    shortDescription: "Long-standing Pisan osteria, walking distance from the Tower.",
    description:
      "A solid Pisa stop a short walk from Piazza dei Miracoli — Tuscan classics, bean soups, fresh pasta, fair prices. Reserve for lunch.",
    address: "Via San Frediano 16, Pisa (PI)",
    coords: [43.7180, 10.4011],
    hours: "Lunch & dinner; closed Sun"
  },

  // Supermarkets
  {
    id: "sup-n-conad-larciano",
    name: "Conad — Larciano",
    category: "supermarket",
    region: "north",
    base: "north",
    shortDescription: "Full-size local supermarket.",
    description:
      "Closest large supermarket to the Larciano stay — water, fresh produce, breakfast supplies, baby/sun gear. Open every day.",
    address: "Via Marx, Larciano (PT)",
    coords: [43.8181, 10.9072],
    hours: "Mon–Sat 08:00–20:00, Sun 08:30–13:00"
  },
  {
    id: "sup-n-coop-monsummano",
    name: "Coop — Monsummano Terme",
    category: "supermarket",
    region: "north",
    base: "north",
    shortDescription: "Larger Coop hypermarket nearby.",
    description:
      "If Conad is missing something, the Coop in Monsummano (10 min drive) is bigger — full deli, bakery, household, kids' stuff.",
    address: "Via Empolese, Monsummano Terme (PT)",
    coords: [43.8625, 10.8164],
    hours: "Mon–Sat 08:00–21:00, Sun 09:00–20:00"
  },

  // Gas stations
  {
    id: "gas-n-eni-larciano",
    name: "Eni Station — Larciano",
    category: "gas",
    region: "north",
    base: "north",
    shortDescription: "Closest fuel stop to the Larciano house.",
    description:
      "Standard Eni station on the main road through Larciano — 24/7 self-service via card. Tip: in Italy, 'servito' is staff-served and costs more; use 'fai da te' / self-service.",
    address: "Via Marx, Larciano (PT)",
    coords: [43.8198, 10.9051],
    hours: "Self-service 24/7"
  },
  {
    id: "gas-n-q8-monsummano",
    name: "Q8 — Monsummano Terme",
    category: "gas",
    region: "north",
    base: "north",
    shortDescription: "Backup station on the SS-436 road.",
    description:
      "Backup option en route to/from the A11 motorway — accepts foreign cards reliably.",
    address: "Via Empolese, Monsummano Terme (PT)",
    coords: [43.8639, 10.8189],
    hours: "Self-service 24/7"
  },

  // ==================== SOUTH BASE — Manciano / Semproniano area ====================

  // Restaurants
  {
    id: "rest-s-trattoria-verdi",
    name: "Trattoria Verdi — Manciano",
    category: "restaurant",
    region: "south",
    base: "south",
    shortDescription: "Down-to-earth Maremma cooking in town.",
    description:
      "A long-running family trattoria in Manciano — handmade pici, wild boar ragù, grilled lamb, good house wine. Closest 'real meal' option to Tenuta Cortevecchia.",
    address: "Via Cavour, 58014 Manciano (GR)",
    coords: [42.5886, 11.5158],
    hours: "Lunch & dinner; check closure day"
  },
  {
    id: "rest-s-i-due-cippi",
    name: "I Due Cippi da Michele — Saturnia",
    category: "restaurant",
    region: "south",
    base: "south",
    shortDescription: "Saturnia village classic — meats and pici.",
    description:
      "On the main square of Saturnia village (the hilltop town above the hot springs). Strong on grilled meats and traditional Maremma pasta. Nice shaded terrace.",
    address: "Piazza Vittorio Veneto 26/A, Saturnia (GR)",
    coords: [42.6644, 11.5081],
    hours: "Lunch & dinner"
  },
  {
    id: "rest-s-hostaria-ceccottino",
    name: "Hostaria del Ceccottino — Pitigliano",
    category: "restaurant",
    region: "south",
    base: "south",
    shortDescription: "Refined Pitigliano cooking with kosher tradition.",
    description:
      "In the heart of Pitigliano's old town — modern takes on Maremma and local Jewish-Italian dishes (sfratto dessert), good wine list, lovely small dining room.",
    address: "Piazza San Gregorio VII, 58017 Pitigliano (GR)",
    coords: [42.6358, 11.6694],
    hours: "Lunch & dinner; closed Tue"
  },
  {
    id: "rest-s-trattoria-sovana",
    name: "Taverna Etrusca — Sovana",
    category: "restaurant",
    region: "south",
    base: "south",
    shortDescription: "Atmospheric stone-vaulted tavern in tiny Sovana.",
    description:
      "Sovana is a postcard-perfect single-street Etruscan village near Pitigliano — Taverna Etrusca's vaulted dining room is the dinner stop after a day at the Vie Cave.",
    address: "Piazza del Pretorio 16, Sovana, Sorano (GR)",
    coords: [42.6561, 11.6322],
    hours: "Lunch & dinner; closed Wed"
  },
  {
    id: "rest-s-porto-santo-stefano",
    name: "Dal Greco — Porto Santo Stefano",
    category: "restaurant",
    region: "south",
    base: "south",
    shortDescription: "Fresh fish in the harbour where you rent the boat.",
    description:
      "Right on the harbour at Porto Santo Stefano — daily catch, classic spaghetti allo scoglio, sea-view terrace. Perfect end to the boat day before driving back.",
    address: "Via del Molo 1, Porto Santo Stefano (GR)",
    coords: [42.4344, 11.1183],
    hours: "Lunch & dinner; high season daily"
  },

  // Supermarkets
  {
    id: "sup-s-conad-manciano",
    name: "Conad — Manciano",
    category: "supermarket",
    region: "south",
    base: "south",
    shortDescription: "Main supermarket for the southern base.",
    description:
      "The main grocery for the Manciano / Semproniano area — stock up here on the way in to Tenuta Cortevecchia. Water, breakfast, fresh produce, pool snacks.",
    address: "Via Roma, 58014 Manciano (GR)",
    coords: [42.5897, 11.5142],
    hours: "Mon–Sat 08:00–20:00, Sun 08:30–13:00"
  },
  {
    id: "sup-s-coop-pitigliano",
    name: "Coop — Pitigliano",
    category: "supermarket",
    region: "south",
    base: "south",
    shortDescription: "Backup supermarket near Pitigliano.",
    description:
      "Convenient if you're already in Pitigliano for the Vie Cave — solid full-size supermarket on the way out of town.",
    address: "Via Generale Orsini, 58017 Pitigliano (GR)",
    coords: [42.6361, 11.6753],
    hours: "Mon–Sat 08:00–20:00, Sun 09:00–13:00"
  },

  // Gas stations
  {
    id: "gas-s-eni-manciano",
    name: "Eni Station — Manciano",
    category: "gas",
    region: "south",
    base: "south",
    shortDescription: "Closest fuel stop to the southern base.",
    description:
      "Eni station on the SR74 through Manciano — easy stop on every drive in/out of Cortevecchia. Self-service 24/7 with card.",
    address: "SR74 — Manciano (GR)",
    coords: [42.5872, 11.5125],
    hours: "Self-service 24/7"
  },
  {
    id: "gas-s-q8-albinia",
    name: "Q8 — Albinia (Aurelia)",
    category: "gas",
    region: "south",
    base: "south",
    shortDescription: "On the SS-1 Aurelia — fill up before/after Argentario.",
    description:
      "On the Aurelia coastal highway near Albinia — natural fuel stop on the way to/from the Porto Santo Stefano boat day or the Argentario lagoon.",
    address: "SS-1 Aurelia, Albinia (GR)",
    coords: [42.5044, 11.2122],
    hours: "Self-service 24/7"
  }
];
