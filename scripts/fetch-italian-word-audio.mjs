// Build Italian "words of the day" audio as **trilingual clips** (Italian →
// short pause → English → short pause → Hebrew) by stitching three TTS MP3s
// with ffmpeg. Two files per slot:
//   • day-NN-M.mp3      — word + EN meaning + HE meaning
//   • day-NN-M-ex.mp3  — Italian example + EN exampleMeaning + HE exampleMeaning
//
// **Default (Google path): Gemini 3.1 Flash TTS** — `GEMINI_API_KEY` (AI Studio key;
// same family as the site’s Gemini features). Model: `GEMINI_TTS_MODEL` or
// `gemini-3.1-flash-tts-preview`. Voices: prebuilt names, e.g. `GEMINI_TTS_VOICE_NAME=Kore`
// or per-language `GEMINI_TTS_VOICE_IT` / `_EN` / `_HE`.
//
// **Legacy Cloud Chirp 3 HD:** `--google-chirp3` or `ITALIAN_WORDS_TTS=google-chirp3`
// — requires Cloud Text-to-Speech API + `gcloud auth application-default login`
// or `GOOGLE_APPLICATION_CREDENTIALS`. See `scripts/lib/google-tts.mjs` for env vars.
//
// **ElevenLabs:** `--elevenlabs` or `ITALIAN_WORDS_TTS=elevenlabs` + `ELEVEN_API_KEY`.
//
//   node scripts/fetch-italian-word-audio.mjs
//   node scripts/fetch-italian-word-audio.mjs --force
//   node scripts/fetch-italian-word-audio.mjs --google-chirp3 --force
//   node scripts/fetch-italian-word-audio.mjs --elevenlabs --force --examples-only
//
// Source of truth: `src/data/itinerary.ts` + `src/data/i18n/itinerary.he.ts`

import { readFile, writeFile, mkdir, access, mkdtemp, rm } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import {
  getGoogleAccessToken,
  googleSynthesizeToMp3Buffer,
  loadProjectEnvLocal
} from "./lib/google-tts.mjs";
import { geminiTtsToMp3Buffer, getGeminiTtsModel } from "./lib/gemini-tts.mjs";

const execFileP = promisify(execFile);

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const ITINERARY_EN = resolve(REPO_ROOT, "src", "data", "itinerary.ts");
const ITINERARY_HE = resolve(REPO_ROOT, "src", "data", "i18n", "itinerary.he.ts");
const OUT_DIR = resolve(REPO_ROOT, "public", "audio", "italian-words");

const ELEVEN_OUTPUT_FORMAT = "mp3_44100_128";

/** Resolved after `.env.local` is loaded (ElevenLabs path only). */
function getElevenTtsConfig() {
  return {
    modelId:
      process.env.ELEVEN_IT_WORDS_MODEL?.trim() ||
      process.env.ELEVEN_HE_MODEL?.trim() ||
      "eleven_v3",
    voiceItEn: process.env.ELEVEN_IT_WORDS_VOICE_ID || "ZRKmc75tGxpIMNTEiwe0",
    voiceHe: process.env.ELEVEN_HE_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"
  };
}

/** Full `voice.name` values for Cloud TTS (Chirp 3 HD). */
function getGoogleVoiceConfig() {
  const stemItEn = process.env.GOOGLE_TTS_VOICE_STEM || "Kore";
  /** Same stem as IT/EN by default — Despina’s Hebrew leg often sounded thin vs Kore. */
  const stemHe = process.env.GOOGLE_TTS_HEBREW_VOICE_STEM || stemItEn;
  return {
    voiceIt: process.env.GOOGLE_TTS_VOICE_IT || `it-IT-Chirp3-HD-${stemItEn}`,
    voiceEn: process.env.GOOGLE_TTS_VOICE_EN || `en-US-Chirp3-HD-${stemItEn}`,
    voiceHe: process.env.GOOGLE_TTS_VOICE_HE || `he-IL-Chirp3-HD-${stemHe}`
  };
}

const ELEVEN_VOICE_SETTINGS = {
  stability: 0.55,
  similarity_boost: 0.88,
  style: 0.22,
  use_speaker_boost: true,
  speed: 0.9
};

/** Silence between language segments (seconds). */
const PAUSE_SEC = 0.65;

function useElevenLabs() {
  return process.argv.includes("--elevenlabs") || process.env.ITALIAN_WORDS_TTS === "elevenlabs";
}

/** Legacy Cloud Text-to-Speech Chirp 3 HD (OAuth). Default is Gemini Flash TTS (API key). */
function useGoogleChirp3() {
  return process.argv.includes("--google-chirp3") || process.env.ITALIAN_WORDS_TTS === "google-chirp3";
}

function getGeminiVoiceConfig() {
  const d = process.env.GEMINI_TTS_VOICE_NAME?.trim() || "Kore";
  return {
    voiceIt: process.env.GEMINI_TTS_VOICE_IT?.trim() || d,
    voiceEn: process.env.GEMINI_TTS_VOICE_EN?.trim() || d,
    voiceHe: process.env.GEMINI_TTS_VOICE_HE?.trim() || d
  };
}

function geminiPromptFor(lang, literal) {
  const body = literal.replace(/\r\n/g, "\n");
  switch (lang) {
    case "it":
      return `Speak in Italian with a calm, clear travel-phrasebook tone. Read exactly the following text, with natural pacing:\n\n${body}`;
    case "en":
      return `Speak in American English with a calm, clear travel-phrasebook tone. Read exactly the following text, with natural pacing:\n\n${body}`;
    case "he":
      return `Speak in Israeli Hebrew with a calm, clear travel-phrasebook tone. Read exactly the following text, with natural pacing:\n\n${body}`;
    default:
      return body;
  }
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function elevenSynthesize(apiKey, modelId, { text, voiceId, languageCode }) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${ELEVEN_OUTPUT_FORMAT}`;
  const body = {
    text,
    model_id: modelId,
    voice_settings: ELEVEN_VOICE_SETTINGS
  };
  if (languageCode) body.language_code = languageCode;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
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

function pickField(block, key) {
  const m = block.match(new RegExp(`\\b${key}:\\s*"([^"]*)"`));
  return m ? m[1] : undefined;
}

function parseWordObjects(inner) {
  const out = [];
  let pos = 0;
  while (true) {
    const s = inner.indexOf("\n      {", pos);
    if (s < 0) break;
    const e = inner.indexOf("\n      }", s + 1);
    if (e < 0) break;
    const chunk = inner.slice(s, e + "\n      }".length);
    out.push(chunk);
    pos = e + 1;
  }
  return out;
}

function extractEnDayInner(src, dayNum) {
  if (dayNum < 10) {
    const re = new RegExp(
      `\\n  \\{\\n    dayNumber: ${dayNum},([\\s\\S]*?)\\n  \\},\\n  \\{\\n    dayNumber: ${dayNum + 1},`
    );
    const m = src.match(re);
    return m ? m[1] : null;
  }
  const m = src.match(/\n  \{\n    dayNumber: 10,([\s\S]*?)\n  \}\n\];/);
  return m ? m[1] : null;
}

function extractHeDayInner(src, dayNum) {
  if (dayNum < 10) {
    const re = new RegExp(
      `\\n  ${dayNum}: \\{([\\s\\S]*?)\\n  \\},\\n  ${dayNum + 1}: \\{`
    );
    const m = src.match(re);
    return m ? m[1] : null;
  }
  const m = src.match(/\n  10: \{([\s\S]*?)\n  \}\n\};/);
  return m ? m[1] : null;
}

function extractItalianWordsInner(dayInner) {
  const marker = "italianWords:";
  const mi = dayInner.indexOf(marker);
  if (mi < 0) return null;
  let i = mi + marker.length;
  while (i < dayInner.length && /\s/.test(dayInner[i])) i++;
  if (dayInner[i] !== "[") return null;
  const innerStart = i + 1;
  let depth = 1;
  i++;
  while (i < dayInner.length && depth > 0) {
    const c = dayInner[i];
    if (c === '"') {
      i++;
      while (i < dayInner.length) {
        if (dayInner[i] === "\\") {
          i += 2;
          continue;
        }
        if (dayInner[i] === '"') {
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    if (c === "[") depth++;
    else if (c === "]") depth--;
    i++;
  }
  if (depth !== 0) return null;
  return dayInner.slice(innerStart, i - 1);
}

function parseEnWordsForDay(src, dayNum) {
  const day = extractEnDayInner(src, dayNum);
  if (!day) throw new Error(`EN day ${dayNum} block not found`);
  const inner = extractItalianWordsInner(day);
  if (!inner) throw new Error(`EN day ${dayNum} italianWords not found`);
  const objs = parseWordObjects(inner);
  return objs.map(chunk => ({
    word: pickField(chunk, "word"),
    meaning: pickField(chunk, "meaning"),
    example: pickField(chunk, "example"),
    exampleMeaning: pickField(chunk, "exampleMeaning")
  }));
}

function parseHeWordsForDay(src, dayNum) {
  const day = extractHeDayInner(src, dayNum);
  if (!day) throw new Error(`HE day ${dayNum} block not found`);
  const inner = extractItalianWordsInner(day);
  if (!inner) throw new Error(`HE day ${dayNum} italianWords not found`);
  const objs = parseWordObjects(inner);
  return objs.map(chunk => ({
    meaning: pickField(chunk, "meaning"),
    exampleMeaning: pickField(chunk, "exampleMeaning")
  }));
}

async function ensureSilenceMp3(tmpDir) {
  const p = join(tmpDir, `silence-${Math.round(PAUSE_SEC * 1000)}ms.mp3`);
  if (await exists(p)) return p;
  await execFileP("ffmpeg", [
    "-y",
    "-f",
    "lavfi",
    "-i",
    "anullsrc=r=44100:cl=stereo",
    "-t",
    String(PAUSE_SEC),
    "-q:a",
    "9",
    "-acodec",
    "libmp3lame",
    p
  ]);
  return p;
}

/**
 * Concatenate MP3 segments + silence by decoding each leg, **normalizing format**
 * (`aformat`), then `concat`. Plain `concat=n` on mixed layouts produced MP3s
 * that browsers reject or stall on after the first segment.
 */
async function concatMp3PartsWithPauses(segmentPaths, silencePath, outPath) {
  const args = ["-y"];
  let inputIdx = 0;
  const norm = [];
  const concatLabels = [];
  const aformat =
    "aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo";
  for (let i = 0; i < segmentPaths.length; i++) {
    args.push("-i", segmentPaths[i]);
    norm.push(`[${inputIdx}:a]${aformat}[x${inputIdx}]`);
    concatLabels.push(`[x${inputIdx}]`);
    inputIdx++;
    if (i < segmentPaths.length - 1) {
      args.push("-i", silencePath);
      norm.push(`[${inputIdx}:a]${aformat}[x${inputIdx}]`);
      concatLabels.push(`[x${inputIdx}]`);
      inputIdx++;
    }
  }
  const n = concatLabels.length;
  const filterComplex = `${norm.join(";")};${concatLabels.join("")}concat=n=${n}:v=0:a=1[aout]`;
  args.push(
    "-filter_complex",
    filterComplex,
    "-map",
    "[aout]",
    "-c:a",
    "libmp3lame",
    "-ar",
    "44100",
    "-ac",
    "2",
    "-b:a",
    "128k",
    outPath
  );
  await execFileP("ffmpeg", args);
}

function googleSpeakingRates() {
  const mainRaw = process.env.GOOGLE_TTS_SPEAKING_RATE?.trim();
  const main = mainRaw !== undefined && mainRaw !== "" ? Number(mainRaw) : 0.9;
  const mainOk = Number.isFinite(main) ? main : 0.9;
  const heRaw = process.env.GOOGLE_TTS_SPEAKING_RATE_HE?.trim();
  const he =
    heRaw !== undefined && heRaw !== "" ? Number(heRaw) : mainOk;
  const heOk = Number.isFinite(he) ? he : mainOk;
  return { it: mainOk, en: mainOk, he: heOk };
}

function googleWordSegments(cfg, it, enMeaning, heMeaning) {
  const r = googleSpeakingRates();
  return [
    { text: it, languageCode: "it-IT", name: cfg.voiceIt, speakingRate: r.it },
    { text: enMeaning, languageCode: "en-US", name: cfg.voiceEn, speakingRate: r.en },
    { text: heMeaning, languageCode: "he-IL", name: cfg.voiceHe, speakingRate: r.he }
  ];
}

function geminiWordSegments(cfg, it, enMeaning, heMeaning) {
  return [
    { text: geminiPromptFor("it", it), voiceName: cfg.voiceIt },
    { text: geminiPromptFor("en", enMeaning), voiceName: cfg.voiceEn },
    { text: geminiPromptFor("he", heMeaning), voiceName: cfg.voiceHe }
  ];
}

function elevenWordSegments(cfg, it, enMeaning, heMeaning) {
  return [
    { text: it, voiceId: cfg.voiceItEn, languageCode: "it" },
    { text: enMeaning, voiceId: cfg.voiceItEn, languageCode: "en" },
    { text: heMeaning, voiceId: cfg.voiceHe, languageCode: "he" }
  ];
}

async function buildTrilingualGoogle(accessToken, tmpDir, silencePath, segments, outPath) {
  const segPaths = [];
  for (let i = 0; i < segments.length; i++) {
    const p = join(tmpDir, `seg-${randomUUID()}-${i}.mp3`);
    const { text, languageCode, name, speakingRate } = segments[i];
    const buf = await googleSynthesizeToMp3Buffer(
      accessToken,
      { languageCode, name },
      text,
      speakingRate != null && Number.isFinite(speakingRate)
        ? { speakingRate }
        : {}
    );
    await writeFile(p, buf);
    segPaths.push(p);
  }
  await concatMp3PartsWithPauses(segPaths, silencePath, outPath);
  for (const p of segPaths) await rm(p, { force: true });
}

async function buildTrilingualGemini(apiKey, tmpDir, silencePath, segments, outPath) {
  const segPaths = [];
  for (let i = 0; i < segments.length; i++) {
    const p = join(tmpDir, `seg-${randomUUID()}-${i}.mp3`);
    const { text, voiceName } = segments[i];
    const buf = await geminiTtsToMp3Buffer(apiKey, tmpDir, { text, voiceName });
    await writeFile(p, buf);
    segPaths.push(p);
  }
  await concatMp3PartsWithPauses(segPaths, silencePath, outPath);
  for (const p of segPaths) await rm(p, { force: true });
}

async function buildTrilingualEleven(apiKey, modelId, tmpDir, silencePath, segments, outPath) {
  const segPaths = [];
  for (let i = 0; i < segments.length; i++) {
    const p = join(tmpDir, `seg-${randomUUID()}-${i}.mp3`);
    const buf = await elevenSynthesize(apiKey, modelId, segments[i]);
    await writeFile(p, buf);
    segPaths.push(p);
  }
  await concatMp3PartsWithPauses(segPaths, silencePath, outPath);
  for (const p of segPaths) await rm(p, { force: true });
}

async function main() {
  const force = process.argv.includes("--force");
  const parseOnly = process.argv.includes("--parse-only");
  /** Skip the `*-ex.mp3` example sentences; only build the word/meaning clip. */
  const wordsOnly = process.argv.includes("--words-only");
  /** Skip word/meaning clips; only (re)build `*-ex.mp3` Italian example + meanings. */
  const examplesOnly = process.argv.includes("--examples-only");
  if (examplesOnly && wordsOnly) {
    console.error("Use only one of --examples-only or --words-only.");
    process.exit(1);
  }

  const eleven = useElevenLabs();

  const enSrc = (await readFile(ITINERARY_EN, "utf8")).replace(/\r\n/g, "\n");
  const heSrc = (await readFile(ITINERARY_HE, "utf8")).replace(/\r\n/g, "\n");

  if (parseOnly) {
    for (let dayNum = 1; dayNum <= 10; dayNum++) {
      const enWords = parseEnWordsForDay(enSrc, dayNum);
      const heWords = parseHeWordsForDay(heSrc, dayNum);
      if (enWords.length !== heWords.length) {
        throw new Error(`Day ${dayNum}: EN ${enWords.length} vs HE ${heWords.length}`);
      }
      let exCount = 0;
      for (let i = 0; i < enWords.length; i++) {
        if (enWords[i].example && enWords[i].exampleMeaning && heWords[i].exampleMeaning) exCount++;
      }
      console.log(`day ${dayNum}: ${enWords.length} words, ${exCount} with example (IT+EN+HE)`);
    }
    console.log("parse-only OK");
    return;
  }

  await loadProjectEnvLocal(REPO_ROOT);

  let googleToken = null;
  let geminiKey = null;
  let elevenKey = null;
  let elevenCfg = null;
  let googleVoices = null;
  let geminiVoices = null;
  /** @type {"chirp3" | "gemini" | null} */
  let googleMode = null;

  if (eleven) {
    elevenKey = process.env.ELEVEN_API_KEY?.trim();
    if (!elevenKey) {
      console.error("ElevenLabs mode: set ELEVEN_API_KEY (or add it to .env.local).");
      process.exit(1);
    }
    elevenCfg = getElevenTtsConfig();
    console.log(
      `TTS: ElevenLabs | model=${elevenCfg.modelId} | IT+EN voice=${elevenCfg.voiceItEn} | HE voice=${elevenCfg.voiceHe}`
    );
  } else if (useGoogleChirp3()) {
    googleMode = "chirp3";
    googleToken = await getGoogleAccessToken();
    googleVoices = getGoogleVoiceConfig();
    console.log(
      `TTS: Google Cloud Chirp 3 HD | IT=${googleVoices.voiceIt} | EN=${googleVoices.voiceEn} | HE=${googleVoices.voiceHe}`
    );
  } else {
    googleMode = "gemini";
    geminiKey = process.env.GEMINI_API_KEY?.trim();
    if (!geminiKey) {
      console.error(
        "Italian words TTS defaults to Gemini 3.1 Flash TTS. Set GEMINI_API_KEY (e.g. in `.env.local`).\n" +
          "For legacy Cloud Chirp3 instead: pass --google-chirp3 and authenticate with gcloud / a service account."
      );
      process.exit(1);
    }
    geminiVoices = getGeminiVoiceConfig();
    console.log(
      `TTS: Gemini Flash TTS | model=${getGeminiTtsModel()} | IT=${geminiVoices.voiceIt} | EN=${geminiVoices.voiceEn} | HE=${geminiVoices.voiceHe}`
    );
  }

  try {
    await execFileP("ffmpeg", ["-version"]);
  } catch {
    console.error("ffmpeg is required on PATH (concat + final MP3 encode).");
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const tmpDir = await mkdtemp(join(tmpdir(), "tuscany-itwords-"));
  let silencePath;
  try {
    silencePath = await ensureSilenceMp3(tmpDir);

    let wrote = 0;
    let skipped = 0;

    for (let dayNum = 1; dayNum <= 10; dayNum++) {
      const enWords = parseEnWordsForDay(enSrc, dayNum);
      const heWords = parseHeWordsForDay(heSrc, dayNum);
      if (enWords.length !== heWords.length) {
        throw new Error(`Day ${dayNum}: EN ${enWords.length} words vs HE ${heWords.length}`);
      }
      const prefix = `day-${String(dayNum).padStart(2, "0")}`;

      for (let i = 0; i < enWords.length; i++) {
        const en = enWords[i];
        const he = heWords[i];
        if (!en.word || !en.meaning || !he.meaning) {
          throw new Error(`Day ${dayNum} word ${i}: missing word/meaning`);
        }

        const wordDest = resolve(OUT_DIR, `${prefix}-${i}.mp3`);
        const exDest = resolve(OUT_DIR, `${prefix}-${i}-ex.mp3`);

        if (!examplesOnly) {
          const skipWord = !force && (await exists(wordDest));
          if (skipWord) {
            skipped++;
          } else if (eleven) {
            await buildTrilingualEleven(
              elevenKey,
              elevenCfg.modelId,
              tmpDir,
              silencePath,
              elevenWordSegments(elevenCfg, en.word, en.meaning, he.meaning),
              wordDest
            );
            console.log(`+ ${prefix}-${i}.mp3 (IT · EN · HE)`);
            wrote++;
          } else if (googleMode === "chirp3") {
            await buildTrilingualGoogle(
              googleToken,
              tmpDir,
              silencePath,
              googleWordSegments(googleVoices, en.word, en.meaning, he.meaning),
              wordDest
            );
            console.log(`+ ${prefix}-${i}.mp3 (IT · EN · HE)`);
            wrote++;
          } else {
            await buildTrilingualGemini(
              geminiKey,
              tmpDir,
              silencePath,
              geminiWordSegments(geminiVoices, en.word, en.meaning, he.meaning),
              wordDest
            );
            console.log(`+ ${prefix}-${i}.mp3 (IT · EN · HE)`);
            wrote++;
          }
        }

        if (wordsOnly) {
          /** keep existing example clips; just don't (re)generate them. */
        } else if (en.example && en.exampleMeaning && he.exampleMeaning) {
          const skipEx = !force && (await exists(exDest));
          if (skipEx) {
            skipped++;
          } else if (eleven) {
            await buildTrilingualEleven(
              elevenKey,
              elevenCfg.modelId,
              tmpDir,
              silencePath,
              elevenWordSegments(elevenCfg, en.example, en.exampleMeaning, he.exampleMeaning),
              exDest
            );
            console.log(`+ ${prefix}-${i}-ex.mp3 (IT · EN · HE)`);
            wrote++;
          } else if (googleMode === "chirp3") {
            await buildTrilingualGoogle(
              googleToken,
              tmpDir,
              silencePath,
              googleWordSegments(googleVoices, en.example, en.exampleMeaning, he.exampleMeaning),
              exDest
            );
            console.log(`+ ${prefix}-${i}-ex.mp3 (IT · EN · HE)`);
            wrote++;
          } else {
            await buildTrilingualGemini(
              geminiKey,
              tmpDir,
              silencePath,
              geminiWordSegments(geminiVoices, en.example, en.exampleMeaning, he.exampleMeaning),
              exDest
            );
            console.log(`+ ${prefix}-${i}-ex.mp3 (IT · EN · HE)`);
            wrote++;
          }
        } else {
          if (await exists(exDest)) await rm(exDest, { force: true });
        }

        await new Promise(r =>
          setTimeout(r, eleven ? 280 : googleMode === "chirp3" ? 120 : 220)
        );
      }
    }

    console.log(`\nDone. Wrote ${wrote} new clips, skipped ${skipped} (existing).`);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
