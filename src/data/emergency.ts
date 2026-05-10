import type { EmergencyGroup } from "./types";

export const emergencyGroups: EmergencyGroup[] = [
  {
    title: "Italy — emergency numbers",
    items: [
      { label: "Single emergency number (EU)", value: "112", type: "phone", detail: "Police, ambulance, fire — English available" },
      { label: "Carabinieri (police)", value: "113", type: "phone" },
      { label: "Fire brigade", value: "115", type: "phone" },
      { label: "Medical emergency / ambulance", value: "118", type: "phone" },
      { label: "Coast guard", value: "1530", type: "phone", detail: "Boat day at Argentario" },
      { label: "Roadside assistance (ACI)", value: "803.116", type: "phone", detail: "From Italian mobile or landline" }
    ]
  },
  {
    title: "Hospitals & clinics — North base (Larciano)",
    items: [
      {
        label: "Ospedale San Jacopo — Pistoia",
        value: "Via Ciliegiole 97, 51100 Pistoia",
        detail: "Main hospital, full ER. ≈ 25 min from Larciano",
        type: "address",
        link: "https://www.google.com/maps/dir/?api=1&destination=43.9285,10.9203"
      },
      {
        label: "Ospedale San Luca — Lucca",
        value: "Via Lippi-Francesconi, 55100 Lucca",
        detail: "Major hospital with pediatric ER. ≈ 45 min west",
        type: "address",
        link: "https://www.google.com/maps/dir/?api=1&destination=43.8456,10.5394"
      },
      {
        label: "Pronto Soccorso Pediatrico — Meyer (Florence)",
        value: "Viale Pieraccini 24, 50139 Firenze",
        detail: "Top pediatric hospital in central Italy. ≈ 1 h",
        type: "address",
        link: "https://www.google.com/maps/dir/?api=1&destination=43.8016,11.2486"
      }
    ]
  },
  {
    title: "Hospitals & clinics — South base (Manciano / Pitigliano)",
    items: [
      {
        label: "Ospedale di Pitigliano — Petruccioli",
        value: "Via Nicola Ciacci 340, 58017 Pitigliano (GR)",
        detail: "Closest hospital to Cortevecchia. Has ER. ≈ 35 min",
        type: "address",
        link: "https://www.google.com/maps/dir/?api=1&destination=42.6383,11.6664"
      },
      {
        label: "Ospedale Misericordia — Grosseto",
        value: "Via Senese 161, 58100 Grosseto",
        detail: "Main hospital of the province, full services. ≈ 1 h",
        type: "address",
        link: "https://www.google.com/maps/dir/?api=1&destination=42.7747,11.1086"
      },
      {
        label: "Guardia Medica Turistica",
        value: "118 (ask)",
        detail: "Tourist medical service in summer — call 118 to be redirected",
        type: "phone"
      }
    ]
  },
  {
    title: "Pharmacies (24h-rotation)",
    items: [
      {
        label: "Farmacia Comunale — Manciano",
        value: "Via Marsala, 58014 Manciano (GR)",
        detail: "Closest pharmacy to Cortevecchia. Night-shift rotation posted on door.",
        type: "address",
        link: "https://www.google.com/maps/dir/?api=1&destination=42.5897,11.5161"
      },
      {
        label: "Farmacia di Larciano",
        value: "Via Marx, Larciano (PT)",
        detail: "Closest to the northern base. Night-shift rotation posted on door.",
        type: "address",
        link: "https://www.google.com/maps/dir/?api=1&destination=43.8200,10.9050"
      }
    ]
  },
  {
    title: "Israeli embassy & consular help (Rome)",
    items: [
      {
        label: "Embassy of Israel in Rome",
        value: "Via Michele Mercati 14, 00197 Roma",
        type: "address",
        link: "https://www.google.com/maps/dir/?api=1&destination=41.9241,12.4856"
      },
      {
        label: "Embassy phone",
        value: "+39 06 3619 8500",
        type: "phone"
      },
      {
        label: "After-hours emergency (Israelis abroad)",
        value: "+972 3 6953 0123",
        type: "phone",
        detail: "MFA Situation Room — 24/7"
      },
      {
        label: "Embassy website",
        value: "embassies.gov.il/rome",
        type: "website",
        link: "https://embassies.gov.il/rome"
      }
    ]
  }
];
