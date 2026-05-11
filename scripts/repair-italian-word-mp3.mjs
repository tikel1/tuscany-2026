/**
 * Re-encode every MP3 under `public/audio/italian-words/` as one clean
 * stereo 44.1 kHz CBR stream. Use this if pronunciation fails with "audio
 * unavailable" or example clips stop after Italian — older stitched files
 * could confuse the browser decoder.
 *
 *   node scripts/repair-italian-word-mp3.mjs
 *   node scripts/repair-italian-word-mp3.mjs --dry-run
 *
 * Requires `ffmpeg` on PATH (same as `fetch-italian-word-audio.mjs`).
 */

import { readdir, rm, rename } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIO_DIR = join(__dirname, "..", "public", "audio", "italian-words");

const dryRun = process.argv.includes("--dry-run");

async function main() {
  let entries;
  try {
    entries = await readdir(AUDIO_DIR);
  } catch (e) {
    if (e?.code === "ENOENT") {
      console.error(`Directory missing: ${AUDIO_DIR}`);
      process.exit(1);
    }
    throw e;
  }
  const mp3s = entries.filter((f) => f.endsWith(".mp3")).sort();
  if (mp3s.length === 0) {
    console.log(`No .mp3 files in ${AUDIO_DIR}`);
    return;
  }
  for (const name of mp3s) {
    const input = join(AUDIO_DIR, name);
    const tmp = join(AUDIO_DIR, `${name}.repairing-${process.pid}.mp3`);
    if (dryRun) {
      console.log(`Would repair: ${name}`);
      continue;
    }
    await execFileP("ffmpeg", [
      "-y",
      "-i",
      input,
      "-ar",
      "44100",
      "-ac",
      "2",
      "-c:a",
      "libmp3lame",
      "-b:a",
      "128k",
      tmp,
    ]);
    await rm(input);
    await rename(tmp, input);
    console.log(`Repaired: ${name}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
