// One-shot script: pre-generate Italian-accented English narration for
// each attraction's description using ElevenLabs TTS, and save the
// resulting MP3s into public/audio/attractions/<id>.mp3.
//
// Why pre-generate instead of calling at runtime?
//   1. The site is a static SPA on GitHub Pages — there's no backend,
//      so any runtime ElevenLabs key would be exposed in the bundle.
//   2. Audio is content; the descriptions don't change often. Generating
//      once and serving as static assets is cheaper, faster (no API
//      latency on first play), and burns no characters in production.
//
// Run with the ElevenLabs key in env (key NEVER ends up in git):
//
//     # PowerShell
//     $env:ELEVEN_API_KEY = "sk-…"; node scripts/fetch-attraction-audio.mjs
//
//     # bash
//     ELEVEN_API_KEY=sk-… node scripts/fetch-attraction-audio.mjs
//
// Add `--force` to re-generate files that already exist (useful when
// the description copy changes); otherwise existing files are skipped.

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const SOURCE_FILE = resolve(REPO_ROOT, "src", "data", "attractions.ts");
const OUT_DIR = resolve(REPO_ROOT, "public", "audio", "attractions");

/* ------------------------------------------------------------------ */
/* Voice + model config                                                */
/* ------------------------------------------------------------------ */

/** "Paolo - Dynamic Italian Radio Voice" — public ElevenLabs library
 *  voice. Native Italian speaker, warm broadcast tone. We use the
 *  multilingual_v2 model so the voice can speak English text while
 *  carrying its native Italian accent — exactly the "Italian tour
 *  guide who speaks English" effect we want for Gemininio. */
const VOICE_ID = "mcMi8FJDhg35bMpWHv2R";
const MODEL_ID = "eleven_multilingual_v2";
const OUTPUT_FORMAT = "mp3_44100_128";

/* Voice settings tuned for narration: a touch of stability + style so
 * the cadence feels guide-like (not flat) but consistent across files. */
const VOICE_SETTINGS = {
  stability: 0.55,
  similarity_boost: 0.85,
  style: 0.35,
  use_speaker_boost: true
};

/* ------------------------------------------------------------------ */
/* Description extraction                                              */
/* ------------------------------------------------------------------ */

/** Pull `{ id, description }` for every POI in attractions.ts.
 *
 *  The data is hand-edited TypeScript and lives in a strict format:
 *  each object has `id: "x"` early and `description:` (possibly on its
 *  own line) shortly after. Rather than introducing a TS-runtime dep
 *  (tsx) just for one script, we extract via regex. Robust enough for
 *  the file's controlled format; would NOT scale to arbitrary code.
 *
 *  - `id`: matches `id: "..."` (no escaped quotes expected in ids).
 *  - `description`: matches `description:` then a quoted string,
 *    optionally split across an indented continuation line. We do
 *    NOT support escaped double-quotes inside descriptions — the
 *    project uses unicode quotes / apostrophes for prose. */
async function readAttractions() {
  // Normalize line endings so the same regex works on Windows (CRLF)
  // and unix (LF). The source file is hand-edited TS, so it tends to
  // pick up whichever EOL the editor saved with.
  const src = (await readFile(SOURCE_FILE, "utf8")).replace(/\r\n/g, "\n");

  // Each POI is a top-level object literal in the `attractions` array
  // (two-space indent). We grab everything between `\n  {` and the
  // matching closing brace at the same indent. The data file uses a
  // controlled, pretty-printed style so this is reliable here even
  // though it would NOT generalize to arbitrary TypeScript.
  //
  // The closing `(?=\n)` is a LOOKAHEAD on the trailing newline — if
  // we consumed it, the next object's leading `\n  {` would no longer
  // be matchable (the cursor would be past the shared newline) and
  // we'd silently drop every other attraction.
  const objectRe = /\n {2}\{\n([\s\S]*?)\n {2}\},?(?=\n)/g;
  const items = [];
  let match;
  while ((match = objectRe.exec(src)) !== null) {
    const chunk = match[1];
    const idMatch = chunk.match(/\bid:\s*"([^"]+)"/);
    // `description:` may sit on its own line, with the value indented
    // on the next line. Allow whitespace+newlines in between.
    const descMatch = chunk.match(/\bdescription:\s*"([^"]+)"/);
    if (!idMatch || !descMatch) continue;
    const id = idMatch[1];
    const description = descMatch[1].trim();
    items.push({ id, description });
  }
  return items;
}

/* ------------------------------------------------------------------ */
/* TTS                                                                 */
/* ------------------------------------------------------------------ */

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
  // Sanity: real MP3s start with ID3 (49 44 33) or an MPEG sync (FF Fx).
  // If we got JSON instead, surface the error rather than writing junk.
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

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  const apiKey = process.env.ELEVEN_API_KEY;
  if (!apiKey) {
    console.error("Missing ELEVEN_API_KEY env var. See script header for usage.");
    process.exit(1);
  }
  const force = process.argv.includes("--force");

  await mkdir(OUT_DIR, { recursive: true });
  const items = await readAttractions();
  console.log(`Found ${items.length} attractions in attractions.ts`);

  let generated = 0;
  let skipped = 0;
  let totalChars = 0;

  for (const { id, description } of items) {
    const outPath = resolve(OUT_DIR, `${id}.mp3`);
    if (!force && (await fileExists(outPath))) {
      console.log(`  skip   ${id}.mp3 (exists; pass --force to regenerate)`);
      skipped++;
      continue;
    }

    console.log(`  fetch  ${id}.mp3  (${description.length} chars)`);
    try {
      const mp3 = await synthesize(apiKey, description);
      await writeFile(outPath, mp3);
      generated++;
      totalChars += description.length;
      // Be polite to the API. ElevenLabs is generous but no need to
      // hammer it — the whole batch finishes in well under a minute.
      await new Promise(r => setTimeout(r, 250));
    } catch (e) {
      console.error(`  FAIL   ${id}.mp3 — ${e.message}`);
    }
  }

  console.log(
    `\nDone. Generated ${generated}, skipped ${skipped}. ` +
      `Spent ${totalChars} characters of your ElevenLabs quota.`
  );
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
