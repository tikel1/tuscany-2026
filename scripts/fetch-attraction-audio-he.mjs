// Pre-generate Hebrew narration for each attraction (matches Hebrew UI copy
// in src/data/i18n/attractions.he.ts). Writes public/audio/attractions/<id>.he.mp3
//
// **Default: Google Cloud Text-to-Speech** (Chirp 3 HD, Hebrew). Optional
// `--elevenlabs` or `ATTRACTION_HE_TTS=elevenlabs` + `ELEVEN_API_KEY` for legacy.
//
// Google: enable Cloud Text-to-Speech API; `gcloud auth application-default login`
// or `GOOGLE_APPLICATION_CREDENTIALS` (see `.env.local` — loaded automatically).
// Voice: `GOOGLE_TTS_ATTRACTION_HE_VOICE` (full name) or falls back to
// `GOOGLE_TTS_VOICE_HE`, else `he-IL-Chirp3-HD-Despina`. Pace:
// `GOOGLE_TTS_ATTRACTION_SPEAKING_RATE` (default `1`).
//
//   node scripts/fetch-attraction-audio-he.mjs
//   node scripts/fetch-attraction-audio-he.mjs --force
//   node scripts/fetch-attraction-audio-he.mjs --elevenlabs --force

import { readFile, writeFile, mkdir, access, rm } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import {
  getGoogleAccessToken,
  googleSynthesizeToMp3Buffer,
  loadProjectEnvLocal
} from "./lib/google-tts.mjs";

const execFileP = promisify(execFile);

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const SOURCE_FILE = resolve(REPO_ROOT, "src", "data", "i18n", "attractions.he.ts");
const OUT_DIR = resolve(REPO_ROOT, "public", "audio", "attractions");

const ELEVEN_OUTPUT_FORMAT = "mp3_44100_128";

function useElevenLabs() {
  return process.argv.includes("--elevenlabs") || process.env.ATTRACTION_HE_TTS === "elevenlabs";
}

function hebrewAttractionGoogleVoiceName() {
  const explicit =
    process.env.GOOGLE_TTS_ATTRACTION_HE_VOICE?.trim() || process.env.GOOGLE_TTS_VOICE_HE?.trim();
  if (explicit) return explicit;
  const stem = process.env.GOOGLE_TTS_HEBREW_VOICE_STEM || "Despina";
  return `he-IL-Chirp3-HD-${stem}`;
}

function attractionGoogleSpeakingRate() {
  const raw = process.env.GOOGLE_TTS_ATTRACTION_SPEAKING_RATE;
  if (raw === undefined || raw === "") return 1;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 1;
}

async function readAttractionsHe() {
  const src = (await readFile(SOURCE_FILE, "utf8")).replace(/\r\n/g, "\n");
  const objectRe =
    /\n {2}(?:"([^"]+)"|([a-z][\w-]*)):\s*\{\n([\s\S]*?)\n {2}\},?(?=\n)/g;
  const items = [];
  let match;
  while ((match = objectRe.exec(src)) !== null) {
    const chunk = match[3];
    const id = match[1] || match[2];
    const descMatch = chunk.match(/\bdescription:\s*"([^"]+)"/);
    if (!id || !descMatch) continue;
    items.push({ id, description: descMatch[1].trim() });
  }
  return items;
}

async function elevenSynthesize(apiKey, text) {
  const voiceId = process.env.ELEVEN_HE_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  const modelId = process.env.ELEVEN_HE_MODEL || "eleven_v3";
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${ELEVEN_OUTPUT_FORMAT}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.82,
        style: 0.25,
        use_speaker_boost: true
      }
    })
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "<no body>");
    throw new Error(`ElevenLabs ${res.status}: ${detail.slice(0, 300)}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const head = buffer.slice(0, 3).toString("hex");
  if (!head.startsWith("494433") && head !== "fffb" && head !== "fff3" && head !== "fff2") {
    throw new Error(
      `Unexpected response (not MP3): ${buffer.slice(0, 200).toString("utf8")}`
    );
  }
  return buffer;
}

/** Re-encode to 44.1 kHz stereo 128k to match English attraction clips. */
async function normalizeMp3ToAttractionStandard(rawMp3Path, outPath) {
  await execFileP("ffmpeg", [
    "-y",
    "-i",
    rawMp3Path,
    "-c:a",
    "libmp3lame",
    "-ar",
    "44100",
    "-ac",
    "2",
    "-b:a",
    "128k",
    outPath
  ]);
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await loadProjectEnvLocal(REPO_ROOT);
  const force = process.argv.includes("--force");
  const eleven = useElevenLabs();

  let googleToken = null;
  let elevenKey = null;
  if (eleven) {
    elevenKey = process.env.ELEVEN_API_KEY?.trim();
    if (!elevenKey) {
      console.error("ElevenLabs mode: set ELEVEN_API_KEY (or .env.local).");
      process.exit(1);
    }
    console.log(
      `TTS: ElevenLabs | model=${process.env.ELEVEN_HE_MODEL || "eleven_v3"} | voice=${process.env.ELEVEN_HE_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"}`
    );
  } else {
    googleToken = await getGoogleAccessToken();
    console.log(`TTS: Google Chirp 3 HD | HE voice=${hebrewAttractionGoogleVoiceName()}`);
  }

  try {
    await execFileP("ffmpeg", ["-version"]);
  } catch {
    console.error("ffmpeg is required on PATH (normalize MP3 output).");
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const items = await readAttractionsHe();
  console.log(`Found ${items.length} Hebrew attraction entries in attractions.he.ts`);

  let generated = 0;
  let skipped = 0;

  const tmpDir = resolve(OUT_DIR, ".tmp-tts-he");
  await mkdir(tmpDir, { recursive: true });

  try {
    for (const { id, description } of items) {
      const outPath = resolve(OUT_DIR, `${id}.he.mp3`);
      if (!force && (await fileExists(outPath))) {
        console.log(`  skip   ${id}.he.mp3 (exists)`);
        skipped++;
        continue;
      }
      console.log(`  fetch  ${id}.he.mp3  (${description.length} chars)`);
      try {
        if (eleven) {
          const mp3 = await elevenSynthesize(elevenKey, description);
          await writeFile(outPath, mp3);
        } else {
          const voiceName = hebrewAttractionGoogleVoiceName();
          const rawBuf = await googleSynthesizeToMp3Buffer(
            googleToken,
            { languageCode: "he-IL", name: voiceName },
            description,
            { speakingRate: attractionGoogleSpeakingRate() }
          );
          const rawPath = join(tmpDir, `raw-${id}-${randomUUID()}.mp3`);
          await writeFile(rawPath, rawBuf);
          await normalizeMp3ToAttractionStandard(rawPath, outPath);
          await rm(rawPath, { force: true });
        }
        generated++;
        await new Promise(r => setTimeout(r, eleven ? 320 : 150));
      } catch (e) {
        console.error(`  FAIL   ${id}.he.mp3 — ${e.message}`);
      }
    }
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }

  console.log(`\nDone. Generated ${generated}, skipped ${skipped}.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
