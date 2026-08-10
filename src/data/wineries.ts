import type { Winery } from "./types";

/** A short, opinionated list of wineries to visit on each leg.
 *  We deliberately keep it small — five north, five south — and pick
 *  estates that take walk-ins or quick email bookings, not formal
 *  cellar tours. Most are within 25 minutes of our base for the day. */
export const wineries: Winery[] = [
  // ============== NORTH — around Larciano ==============
  // Carmignano DOCG is the local denomination here, ~15–25 min away.
  {
    id: "win-n-capezzana",
    name: "Tenuta di Capezzana",
    region: "north",
    appellation: "Carmignano DOCG",
    description:
      "The flagship estate of the tiny Carmignano DOCG — historic Medici-era cellars, organic since 2009, makes Tuscany's most age-worthy Sangiovese-Cabernet blends. Tastings & guided tours in English by appointment; family-friendly and they do a beautiful Vin Santo.",
    website: "https://www.capezzana.it/en/",
    address: "Via di Capezzana 100, Carmignano (PO)",
    coords: [43.8233, 11.0242],
    bookingNote: "Email or book online a few days ahead — small group tastings.",
    image: "./images/wine-capezzana.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Carmignano_(wine)"
    }
  },
  {
    id: "win-n-bacchereto",
    name: "Fattoria di Bacchereto",
    region: "north",
    appellation: "Carmignano DOCG",
    description:
      "Tiny biodynamic family winery in Bacchereto, just up the road from Capezzana. Artisanal everything — wild yeasts, no filtration, very small production. A more intimate visit than Capezzana, with the family pouring.",
    website: "https://www.fattoriadibacchereto.it/",
    address: "Via Fontemorana 179, Carmignano (PO)",
    coords: [43.8275, 11.0167],
    bookingNote: "Call ahead — sometimes closed for harvest in late August.",
    image: "./images/wine-bacchereto.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://commons.wikimedia.org/"
    }
  },
  {
    id: "win-n-artimino",
    name: "Tenuta di Artimino",
    region: "north",
    appellation: "Carmignano DOCG · Chianti Montalbano",
    description:
      "A vast historic estate around the Medici 'Villa La Ferdinanda' — one of the UNESCO Medici villas. You can combine a tasting with a visit to the villa and the archaeological museum. Big-estate energy, but a beautiful setting and easy to fit a family into.",
    website: "https://www.artimino.com/en/",
    address: "Via le Poggia 10, Artimino, Carmignano (PO)",
    coords: [43.7978, 11.0489],
    bookingNote: "Online booking; tasting rooms open most afternoons.",
    image: "./images/wine-artimino.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Villa_di_Artimino"
    }
  },
  {
    id: "win-n-fattoria-petrognano",
    name: "Fattoria Petrognano",
    region: "north",
    appellation: "Chianti Montalbano",
    description:
      "A small Chianti Montalbano estate above Pomino — fresh, easy-drinking Sangiovese and a celebrated extra-virgin olive oil. Lovely terrace looking over the Pistoian valley; perfect quick stop on the way back from Vinci.",
    website: "https://www.fattoriapetrognano.it/",
    address: "Via di Petrognano 3, Pomino (FI)",
    coords: [43.8911, 11.4231],
    bookingNote: "Walk-ins for tastings most afternoons; call ahead in August.",
    image: "./images/wine-petrognano.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Chianti"
    }
  },

  // ============== SOUTH — around Cortevecchia ==============
  // Morellino di Scansano DOCG is the headline red; Bianco di Pitigliano
  // for whites; both are within 30 min of the villa.
  {
    id: "win-s-le-pupille",
    name: "Fattoria Le Pupille",
    region: "south",
    appellation: "Morellino di Scansano DOCG",
    description:
      "Elisabetta Geppetti's legendary estate — the producer who turned Morellino di Scansano from a local curiosity into a DOCG taken seriously worldwide. Their flagship 'Saffredi' is a Tuscan Super-cult; the everyday Morellino is brilliant value. English tastings on the terrace.",
    website: "https://www.elisabettageppetti.com/en/",
    address: "Loc. Pereta, Magliano in Toscana (GR)",
    coords: [42.5742, 11.3522],
    bookingNote: "Book by email a week ahead — Elisabetta's team does a great visit.",
    image: "./images/wine-le-pupille.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Morellino_di_Scansano"
    }
  },
  {
    id: "win-s-roccapesta",
    name: "Roccapesta",
    region: "south",
    appellation: "Morellino di Scansano DOCG",
    description:
      "A hands-on Scansano producer with a friendly tasting room right on the SR322. Family-run, organic, and very welcoming to drop-ins — a great low-stakes introduction to Morellino if you don't have time to make Le Pupille happen.",
    website: "https://www.roccapesta.com/en/",
    address: "Loc. Banditaccia, Scansano (GR)",
    coords: [42.6864, 11.3389],
    bookingNote: "Walk-ins welcome; call ahead in peak August.",
    image: "./images/wine-roccapesta.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Scansano"
    }
  },
  {
    id: "win-s-tenuta-ammiraglia",
    name: "Tenuta Ammiraglia (Frescobaldi)",
    region: "south",
    appellation: "Maremma Toscana DOC · Morellino di Scansano DOCG",
    description:
      "Frescobaldi's striking modernist Maremma estate near Magliano — a ship-shaped winery half-buried in the hillside. Polished, multi-language tours, beautiful vineyard views and a serious tasting room. The opposite of the small-family vibe — go for the architecture and the polish.",
    website: "https://www.frescobaldi.com/wineries/tenuta-ammiraglia/",
    address: "Loc. Pian dei Bichi, Magliano in Toscana (GR)",
    coords: [42.5878, 11.2942],
    bookingNote: "Online bookings, English-speaking staff, easy with kids.",
    image: "./images/wine-tenuta-ammiraglia.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Magliano_in_Toscana"
    }
  },
  {
    id: "win-s-cantine-pitigliano",
    name: "Cantina Cooperativa di Pitigliano",
    region: "south",
    appellation: "Bianco di Pitigliano DOC · Sovana DOC",
    description:
      "The local growers' cooperative just below Pitigliano old town — the easiest place to taste the area's signature crisp white (Bianco di Pitigliano) and the lesser-known Sovana red. Honest pricing, no pretension; an easy, walkable add-on to the day in Pitigliano.",
    website: "https://www.cantinadipitigliano.it/",
    address: "Via N. Ciacci 974, Pitigliano (GR)",
    coords: [42.6303, 11.6736],
    bookingNote: "Drop in during shop hours — no booking needed.",
    image: "./images/wine-cantine-pitigliano.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Bianco_di_Pitigliano"
    }
  },
  {
    id: "win-s-sassotondo",
    name: "Sassotondo",
    region: "south",
    appellation: "Sovana DOC · Maremma Toscana DOC",
    description:
      "A small, beloved organic estate above Sovana — the family champions the local Ciliegiolo grape and makes a wonderful sparkling 'Pomonio'. Tasting on a stone terrace looking over the Etruscan country. Perfect pre-dinner stop before the Taverna Etrusca in Sovana.",
    website: "https://www.sassotondo.it/en/",
    address: "Loc. Pian di Conati 52, Sovana, Sorano (GR)",
    coords: [42.6661, 11.6256],
    bookingNote: "Email ahead — Edoardo & Carla pour personally.",
    image: "./images/wine-sassotondo.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Sovana"
    }
  },
  /* The Cortevecchia host flagged four denominations they sit near.
   * Morellino di Scansano is already covered three times above, so these
   * fill the other three. NOTE these break the "within 25 minutes" rule
   * at the top of this file: Montecucco is a genuine half-hour, but
   * Montalcino and Montepulciano are 1 h+ and only make sense if you do
   * a Val d'Orcia day. The drive is stated in each bookingNote so nobody
   * sets off for a "quick tasting" that eats the afternoon. */
  {
    id: "win-s-collemassari",
    name: "Castello ColleMassari",
    region: "south",
    appellation: "Montecucco Sangiovese DOCG",
    description:
      "The estate that put Montecucco on the map — a big organic property on the Monte Amiata side, the closest serious denomination to Cortevecchia. Modern gravity-fed cellar built into the hillside, and the tour is one of the better ones for anyone who actually wants to see how wine is made rather than just drink it. Sangiovese grown between the Amiata and the Maremma: firmer and more mineral than Morellino.",
    website: "https://www.collemassari.it/en/",
    address: "Loc. Poggi del Sasso, Cinigiano (GR)",
    coords: [42.9072766, 11.3231486],
    bookingNote: "~40 min from Cortevecchia. Book the cellar tour online a few days ahead.",
    image: "./images/wine-collemassari.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Montecucco_DOC"
    }
  },
  {
    id: "win-s-col-dorcia",
    name: "Col d'Orcia",
    region: "south",
    appellation: "Brunello di Montalcino DOCG",
    description:
      "One of Montalcino's largest organic estates, at Sant'Angelo in Colle on the warm southern slope. Brunello is 100% Sangiovese aged at least five years, and this is the classic version: dried cherry, leather, tobacco, a long slow finish. The visitor set-up is properly organised — cellar tour, a park, and views straight across the Val d'Orcia to Monte Amiata, which is the mountain you'll be looking at from the villa all week.",
    website: "https://www.coldorcia.it/en/",
    address: "Via Giuseppe Garibaldi 42, Sant'Angelo in Colle, Montalcino (SI)",
    coords: [42.9939571, 11.4604941],
    bookingNote: "~1 h 15 from Cortevecchia — a Val d'Orcia day, not a quick hop. Book ahead.",
    image: "./images/wine-col-dorcia.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Brunello_di_Montalcino"
    }
  },
  {
    id: "win-s-avignonesi",
    name: "Avignonesi",
    region: "south",
    appellation: "Vino Nobile di Montepulciano DOCG",
    description:
      "A biodynamic estate outside Montepulciano, farming without chemicals and famous for a Vin Santo aged ten years in tiny barrels — one of the great sweet wines of Italy and worth the detour on its own. Vino Nobile is Sangiovese again (here called Prugnolo Gentile), softer and more floral than Brunello. They run tastings with food, which makes this the most civilised of the three for a long lunch.",
    website: "https://www.avignonesi.it/en/",
    address: "Via Colonica 1, Valiano di Montepulciano (SI)",
    coords: [43.1735808, 11.9333283],
    bookingNote: "~1 h 40 from Cortevecchia — the furthest of the lot. Book, and make a day of it.",
    image: "./images/wine-avignonesi.jpg",
    imageCredit: {
      author: "Wikimedia Commons",
      license: "CC BY-SA",
      source: "https://en.wikipedia.org/wiki/Vino_Nobile_di_Montepulciano"
    }
  }
];

export const wineriesByRegion = (r: "north" | "south") =>
  wineries.filter(w => w.region === r);
