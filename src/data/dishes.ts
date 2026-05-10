import type { Dish } from "./types";

/** Dishes worth chasing on this trip. Curated to the regions we actually
 *  travel through: north Tuscany (Larciano / Garfagnana / Lucca) and the
 *  southern Maremma + Pitigliano. "tuscany" = found everywhere we'll be. */
export const dishes: Dish[] = [
  // ============== PASTA — the headline section ==============
  {
    id: "pici-cacio-pepe",
    name: "Pici",
    italianName: "Pici cacio e pepe / al ragù di cinghiale",
    region: "south",
    category: "pasta",
    description:
      "Hand-rolled fat spaghetti — the signature pasta of Siena and the Maremma. Made with just flour and water (no egg), so it's pleasantly chewy. Locally served either simple ('cacio e pepe' with pecorino & black pepper) or with a slow wild-boar ragù.",
    tryIt: "Trattoria Verdi (Manciano) · Hostaria del Ceccottino (Pitigliano)",
    image: "./images/food-pici.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Pici"
    }
  },
  {
    id: "pappardelle-cinghiale",
    name: "Pappardelle with wild boar ragù",
    italianName: "Pappardelle al ragù di cinghiale",
    region: "tuscany",
    category: "pasta",
    description:
      "Wide ribbon pasta tossed in a deep, slow-cooked ragù of wild boar — Tuscany's truly iconic pasta dish. Found on every serious menu from Lucca down to the Maremma. Ask if it's casalinga (made in-house); it shows.",
    tryIt: "Trattoria del Castello (Larciano) · Taverna Etrusca (Sovana)",
    image: "./images/food-pappardelle.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Pappardelle"
    }
  },
  {
    id: "tortelli-mugellani",
    name: "Tortelli with potato",
    italianName: "Tortelli mugellani / di patate",
    region: "north",
    category: "pasta",
    description:
      "A north-Tuscan stuffed pasta — large pillows filled with mashed potato, parsley and nutmeg, then dressed with butter & sage or a meat ragù. Hearty, mountain food, perfect after the Abetone gondola day.",
    tryIt: "Circolo dei Forestieri (Bagni di Lucca)",
    image: "./images/food-tortelli.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Tortelli"
    }
  },
  {
    id: "ribollita",
    name: "Ribollita",
    italianName: "Ribollita",
    region: "tuscany",
    category: "starter",
    description:
      "The most Tuscan of soups — twice-cooked stale bread, cannellini beans, cavolo nero (black kale) and vegetables. Served thick enough to stand a spoon in, with a generous drizzle of new-press olive oil. A starter, not a side.",
    tryIt: "Osteria dei Cavalieri (Pisa)",
    image: "./images/food-ribollita.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Ribollita"
    }
  },
  {
    id: "pappa-al-pomodoro",
    name: "Pappa al pomodoro",
    italianName: "Pappa al pomodoro",
    region: "tuscany",
    category: "starter",
    description:
      "A late-summer Tuscan classic and a crowd-pleaser for the kids — stale bread cooked into a thick, sweet tomato porridge with garlic, basil and lots of olive oil. Eaten warm or barely-warm, never hot.",
    tryIt: "Almost any trattoria — order it as a starter",
    image: "./images/food-pappa-pomodoro.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Pappa_al_pomodoro"
    }
  },

  // ============== MAINS ==============
  {
    id: "bistecca-fiorentina",
    name: "Bistecca alla Fiorentina",
    italianName: "Bistecca alla Fiorentina",
    region: "tuscany",
    category: "main",
    description:
      "The legendary T-bone of Chianina beef — minimum 1 kg, charred outside, ruby rare inside, served with nothing but salt, pepper and lemon. Always priced per etto (100 g). This is a sharing dish — order one for the table.",
    tryIt: "Trattoria del Castello (Larciano) · Taverna Etrusca (Sovana)",
    image: "./images/food-bistecca.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Bistecca_alla_fiorentina"
    }
  },
  {
    id: "buglione-agnello",
    name: "Lamb stew, Maremma style",
    italianName: "Buglione di agnello",
    region: "south",
    category: "main",
    description:
      "A classic Maremma stew of lamb slow-braised with tomato, garlic, rosemary, vinegar and chilli, served over thick toasted bread that soaks up the sauce. Rich and rustic — order it once on the southern leg.",
    tryIt: "I Due Cippi da Michele (Saturnia)",
    image: "./images/food-buglione.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://commons.wikimedia.org/"
    }
  },
  {
    id: "acquacotta-maremmana",
    name: "Maremma vegetable soup",
    italianName: "Acquacotta maremmana",
    region: "south",
    category: "starter",
    description:
      "Literally 'cooked water' — a poor-man's tomato & vegetable soup that the Maremma cowboys (butteri) ate in the saddle. Toasted bread at the bottom of the bowl, a poached egg cracked on top. Surprisingly elegant.",
    tryIt: "Trattoria Verdi (Manciano)",
    image: "./images/food-acquacotta.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Acquacotta"
    }
  },
  {
    id: "spaghetti-allo-scoglio",
    name: "Spaghetti with seafood",
    italianName: "Spaghetti allo scoglio",
    region: "south",
    category: "pasta",
    description:
      "Argentario's harbour-side classic: spaghetti tossed with whatever the morning catch brings — clams, mussels, small prawns, bits of squid — in a quick garlic, white-wine, parsley and chilli sauce. Eat it the day you do the boat.",
    tryIt: "Dal Greco (Porto Santo Stefano)",
    image: "./images/food-spaghetti-scoglio.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://commons.wikimedia.org/"
    }
  },

  // ============== DESSERTS / SNACKS ==============
  {
    id: "sfratto-goym",
    name: "Sfratto dei Goym",
    italianName: "Sfratto dei Goym",
    region: "south",
    category: "dessert",
    description:
      "A long, log-shaped pastry from Pitigliano's Jewish quarter — a thin, brittle shell filled with honey, walnuts, orange zest and nutmeg. The name (from sfrattare, 'to evict') jokingly recalls the wooden bats used to summon the Jews to leave. Sweet, dense, unforgettable.",
    tryIt: "Forno del Ghetto (Pitigliano)"
    // No CC photo of this niche pastry; PoiImage shows a styled fallback.
  },
  {
    id: "castagnaccio",
    name: "Chestnut cake",
    italianName: "Castagnaccio",
    region: "north",
    category: "dessert",
    description:
      "A dense, dark, gluten-free cake of chestnut flour, water, olive oil, pine nuts, raisins and rosemary — pure Garfagnana mountain food, perfect after a long day at altitude. Looks austere, tastes intriguingly nutty.",
    tryIt: "Bakeries in Bagni di Lucca & the Garfagnana villages",
    image: "./images/food-castagnaccio.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Castagnaccio"
    }
  },
  {
    id: "necci",
    name: "Chestnut crêpes with ricotta",
    italianName: "Necci con la ricotta",
    region: "north",
    category: "dessert",
    description:
      "Thin chestnut-flour pancakes traditionally cooked between hot stone discs, then folded around fresh sheep's-milk ricotta. A Garfagnana street snack that's been made for centuries. Sweet, smoky, impossible to share.",
    tryIt: "Garfagnana sagre & farm stalls; cafés in Castelnuovo di Garfagnana",
    image: "./images/food-necci.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Necci"
    }
  },
  {
    id: "cantucci-vinsanto",
    name: "Cantucci & vin santo",
    italianName: "Cantucci con vin santo",
    region: "tuscany",
    category: "dessert",
    description:
      "The end-of-meal Tuscan ritual: hard almond biscotti dipped into a small glass of sweet, amber-coloured 'holy wine'. Don't eat them dry — the dipping is the whole point.",
    tryIt: "Any trattoria, ask for the 'fine pasto'",
    image: "./images/food-cantucci.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Cantuccini"
    }
  },

  // ============== EVERYDAY / STREET ==============
  {
    id: "schiacciata",
    name: "Tuscan flatbread",
    italianName: "Schiacciata",
    region: "tuscany",
    category: "snack",
    description:
      "Tuscany's answer to focaccia — crisp on the outside, fluffy inside, glossy with olive oil and big flakes of salt. The right picnic bread for the Lucca walls or the Abetone ridge. Buy it warm by the slice and eat it walking.",
    tryIt: "Forno bakeries — every village has one",
    image: "./images/food-schiacciata.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Schiacciata"
    }
  },
  {
    id: "lardo-colonnata",
    name: "Lardo di Colonnata",
    italianName: "Lardo di Colonnata IGP",
    region: "north",
    category: "starter",
    description:
      "Cured pork back-fat from the marble quarries above Carrara, aged for months in marble basins with herbs. Served paper-thin on warm bread — it melts on the tongue. A tiny order goes a long way.",
    tryIt: "Antipasto plate at Circolo dei Forestieri or Trattoria del Castello",
    image: "./images/food-lardo.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Lardo_di_Colonnata"
    }
  }
];

/** Convenience selectors used by the UI. */
export const dishesByRegion = (r: "north" | "south" | "tuscany") =>
  dishes.filter(d => d.region === r);
