// Pre-generate Hebrew narration for each attraction (matches Hebrew UI copy
// in src/data/i18n/attractions.he.ts). Writes public/audio/attractions/<id>.he.mp3
//
// Hebrew is not in eleven_multilingual_v2 — this script uses eleven_v3 by default.
// Override voice/model with env if needed:
//   ELEVEN_HE_VOICE_ID, ELEVEN_HE_MODEL
//
//   $env:ELEVEN_API_KEY = "sk_…"; node scripts/fetch-attraction-audio-he.mjs
// Add `--force` to overwrite existing files.

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const SOURCE_FILE = resolve(REPO_ROOT, "src", "data", "i18n", "attractions.he.ts");
const OUT_DIR = resolve(REPO_ROOT, "public", "audio", "attractions");

/** Default: Rachel — works with eleven_v3 for many locales; override with ELEVEN_HE_VOICE_ID. */
const VOICE_ID = process.env.ELEVEN_HE_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
const MODEL_ID = process.env.ELEVEN_HE_MODEL || "eleven_v3";
const OUTPUT_FORMAT = "mp3_44100_128";

const VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.82,
  style: 0.25,
  use_speaker_boost: true
};

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

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const apiKey = process.env.ELEVEN_API_KEY;
  if (!apiKey) {
    console.error("Missing ELEVEN_API_KEY env var.");
    process.exit(1);
  }
  const force = process.argv.includes("--force");

  await mkdir(OUT_DIR, { recursive: true });
  const items = await readAttractionsHe();
  console.log(`Found ${items.length} Hebrew attraction entries in attractions.he.ts`);
  console.log(`Using model ${MODEL_ID}, voice ${VOICE_ID}`);

  let generated = 0;
  let skipped = 0;

  for (const { id, description } of items) {
    const outPath = resolve(OUT_DIR, `${id}.he.mp3`);
    if (!force && (await fileExists(outPath))) {
      console.log(`  skip   ${id}.he.mp3 (exists)`);
      skipped++;
      continue;
    }
    console.log(`  fetch  ${id}.he.mp3  (${description.length} chars)`);
    try {
      const mp3 = await synthesize(apiKey, description);
      await writeFile(outPath, mp3);
      generated++;
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.error(`  FAIL   ${id}.he.mp3 — ${e.message}`);
    }
  }

  console.log(`\nDone. Generated ${generated}, skipped ${skipped}.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
