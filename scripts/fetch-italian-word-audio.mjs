// Pre-generate Italian pronunciation clips for chapter "Italian words"
// (six per day). Uses a native Italian ElevenLabs shared voice.
//
//   $env:ELEVEN_API_KEY = "sk_…"; node scripts/fetch-italian-word-audio.mjs
//   ELEVEN_API_KEY=sk_… node scripts/fetch-italian-word-audio.mjs
//
// Output: public/audio/italian-words/day-NN-M.mp3 (M = 0..5)
// Add `--force` to overwrite existing files.

import { writeFile, mkdir, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(REPO_ROOT, "public", "audio", "italian-words");

/** Mimmi — playful Italian female (shared library). */
const VOICE_ID = "ZRKmc75tGxpIMNTEiwe0";
const MODEL_ID = "eleven_multilingual_v2";
const OUTPUT_FORMAT = "mp3_44100_128";

const VOICE_SETTINGS = {
  stability: 0.52,
  similarity_boost: 0.88,
  style: 0.32,
  use_speaker_boost: true
};

/** Italian lines — must stay in sync with `src/data/itinerary.ts` italianWords order. */
const BY_DAY = [
  [
    "Andiamo! Andiamo in Toscana!",
    "Autostrada. Sull'autostrada verso Firenze.",
    "Bagaglio. Il bagaglio è nel bagagliaio.",
    "Dai! Facciamo le valigie!",
    "Forza! Siamo quasi arrivati!",
    "Un piccolo riposo in macchina."
  ],
  [
    "Acqua. L'acqua è fresca!",
    "Coraggio. Hai coraggio sul ponte!",
    "Sole. Che sole oggi!",
    "Che bello lo spruzzo dell'acqua!",
    "L'acqua non è freddissima.",
    "Attento! È scivoloso!"
  ],
  [
    "Pendente. La torre pendente di Pisa.",
    "Gelato. Un gelato in piazza.",
    "Bicicletta. In bicicletta sulle mura.",
    "Il campanile suona a mezzogiorno.",
    "Questo gelato è squisito!",
    "Metti la torcia nello zaino."
  ],
  [
    "Montagna. Andiamo in montagna.",
    "Nuvola. Sopra le nuvole.",
    "Fresco. Che aria fresca!",
    "Metti il berretto, c'è vento!",
    "Contiamo le stelle stasera.",
    "Senti l'eco tra gli alberi!"
  ],
  [
    "Sentiero. Il sentiero passa nel fiume.",
    "Valigia. Chiudi la valigia.",
    "Sud. Andiamo verso sud.",
    "Saltelliamo sui sassi!",
    "Attenti al fango vicino al fiume.",
    "Piccola onda, grande divertimento!"
  ],
  [
    "Mare. Una giornata in mare.",
    "Barca. Saliamo in barca.",
    "Ancora. Gettiamo l'ancora.",
    "Chi vuole tenere il timone?",
    "La rete per pescare i pesci.",
    "Ho trovato una conchiglia enorme!"
  ],
  [
    "Scivolo. Lo scivolo più alto, per favore!",
    "Divertimento. Che divertimento!",
    "Piscina. Andiamo in piscina.",
    "Che schizzo dalla piscina!",
    "Scendo nel tubo blu!",
    "Non serve gridare, ti sento!"
  ],
  [
    "Cavallo. Un cavallo della Maremma.",
    "Grotta. Entriamo nella grotta.",
    "Storia. Che storia affascinante!",
    "Il cavallo torna allo stallo.",
    "È un po' oscuro nella grotta.",
    "Un passo alla volta, piano piano."
  ],
  [
    "Terme. Le terme di Saturnia all'alba.",
    "Lago. Un tuffo nel lago.",
    "Panorama. Che panorama!",
    "Si vede il vapore sull'acqua calda.",
    "Una cannuccia per la granita.",
    "Faccio un tuffo nel lago!"
  ],
  [
    "Arrivederci, Toscana!",
    "Volo. Il volo è in orario.",
    "A presto, Italia!",
    "Grazie mille, è stato bellissimo!",
    "Subito al gate, siamo in ritardo!",
    "Un bacio all'Italia!"
  ]
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function synthesize(apiKey, text) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=${OUTPUT_FORMAT}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: VOICE_SETTINGS
    })
  });
  const buf = Buffer.from(await res.arrayBuffer());
  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${buf.toString("utf8").slice(0, 400)}`);
  }
  if (buf[0] !== 0xff && buf[0] !== 0x49) {
    throw new Error("Response is not MP3 (expected MPEG sync or ID3).");
  }
  return buf;
}

async function main() {
  const apiKey = process.env.ELEVEN_API_KEY?.trim();
  if (!apiKey) {
    console.error("Set ELEVEN_API_KEY in the environment.");
    process.exit(1);
  }
  const force = process.argv.includes("--force");
  await mkdir(OUT_DIR, { recursive: true });

  let wrote = 0;
  let skipped = 0;
  for (let d = 0; d < BY_DAY.length; d++) {
    const dayNum = d + 1;
    const prefix = `day-${String(dayNum).padStart(2, "0")}`;
    const lines = BY_DAY[d];
    for (let i = 0; i < lines.length; i++) {
      const id = `${prefix}-${i}`;
      const dest = resolve(OUT_DIR, `${id}.mp3`);
      if (!force && (await exists(dest))) {
        skipped++;
        continue;
      }
      const buf = await synthesize(apiKey, lines[i]);
      await writeFile(dest, buf);
      console.log(`+ ${id}.mp3`);
      wrote++;
    }
  }
  console.log(`Done. Wrote ${wrote}, skipped ${skipped}.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
