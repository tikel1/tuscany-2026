/**
 * Gemini API text-to-speech (e.g. **Gemini 3.1 Flash TTS** preview) via
 * `generateContent` + `responseModalities: ["AUDIO"]`.
 *
 * Auth: `GEMINI_API_KEY` (Google AI Studio key; load via `.env.local` through
 * `loadProjectEnvLocal` in `google-tts.mjs`).
 *
 * Output is raw PCM (s16le); this module transcodes to MP3 with ffmpeg.
 */

import { writeFile, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";

const execFileP = promisify(execFile);

const API_ROOT = "https://generativelanguage.googleapis.com/v1beta";

/** @returns {string} */
export function getGeminiTtsModel() {
  const m = process.env.GEMINI_TTS_MODEL?.trim();
  return m || "gemini-3.1-flash-tts-preview";
}

/**
 * Proactive pacing so we don't burst into the per-minute quota and trigger
 * exponentially growing 429 backoffs. Free tier on `gemini-3.1-flash-tts-preview`
 * is 3 requests/min → ~21 s gap. Override with `GEMINI_TTS_RPM` (set to 0 to
 * disable pacing if you have a paid quota).
 */
let lastCallAt = 0;
function minIntervalMs() {
  const raw = process.env.GEMINI_TTS_RPM?.trim();
  const rpm = raw === undefined || raw === "" ? 3 : Number(raw);
  if (!Number.isFinite(rpm) || rpm <= 0) return 0;
  return Math.ceil(60_000 / rpm) + 250;
}
async function paceBeforeCall() {
  const gap = minIntervalMs();
  if (!gap) return;
  const now = Date.now();
  const wait = lastCallAt + gap - now;
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCallAt = Date.now();
}

/**
 * @param {string} apiKey
 * @param {string} workDir writable temp directory (caller-owned)
 * @param {{ text: string; voiceName?: string }} opts
 * @returns {Promise<Buffer>} MP3 (stereo 44.1 kHz CBR ~128k from ffmpeg)
 */
export async function geminiTtsToMp3Buffer(apiKey, workDir, opts) {
  const model = getGeminiTtsModel();
  const voiceName = (opts.voiceName || "Kore").trim() || "Kore";
  const url = `${API_ROOT}/models/${encodeURIComponent(model)}:generateContent`;

  const body = {
    contents: [{ parts: [{ text: opts.text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName }
        }
      }
    }
  };

  const maxAttempts = 8;
  let attempt = 0;
  let b64 = null;
  let mime = "";
  while (true) {
    attempt++;
    await paceBeforeCall();
    let res;
    let raw = "";
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "content-type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(body)
      });
      raw = await res.text();
    } catch (err) {
      /** Transient DNS / TCP / TLS failures (e.g. ENOTFOUND, ECONNRESET). */
      if (attempt < maxAttempts) {
        const waitMs = Math.min(60_000, 1500 * 2 ** (attempt - 1));
        const reason = err?.cause?.code || err?.code || err?.message || "network error";
        console.warn(
          `  Gemini TTS network error (${reason}) — retrying in ${(waitMs / 1000).toFixed(2)}s (attempt ${attempt}/${maxAttempts - 1}).`
        );
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      throw err;
    }

    if (!res.ok) {
      /** Free tier returns 429 + a `retryDelay` (e.g. "1.039951861s"); honor it, else exp backoff. */
      if ((res.status === 429 || res.status === 503) && attempt < maxAttempts) {
        let waitMs = 0;
        const m = /"retryDelay"\s*:\s*"([\d.]+)s"/.exec(raw);
        if (m) waitMs = Math.ceil(Number(m[1]) * 1000) + 250;
        const m2 = /retry in ([\d.]+)s/i.exec(raw);
        if (!waitMs && m2) waitMs = Math.ceil(Number(m2[1]) * 1000) + 250;
        if (!waitMs) waitMs = Math.min(60_000, 1500 * 2 ** (attempt - 1));
        /** A daily-quota 429 returns a delay of hours; bail rather than sleep forever. */
        const maxRetryMs = Number(process.env.GEMINI_TTS_MAX_RETRY_MS || 180_000);
        if (waitMs > maxRetryMs) {
          throw new Error(
            `Gemini TTS ${res.status}: API asks for ${(waitMs / 1000).toFixed(0)}s wait — likely a daily quota cap. ` +
              `Set GEMINI_TTS_MAX_RETRY_MS=<ms> to override. Body: ${raw.slice(0, 500)}`
          );
        }
        console.warn(
          `  Gemini TTS ${res.status} — retrying in ${(waitMs / 1000).toFixed(2)}s (attempt ${attempt}/${maxAttempts - 1}).`
        );
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      throw new Error(`Gemini TTS ${res.status}: ${raw.slice(0, 600)}`);
    }

    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      throw new Error("Gemini TTS returned non-JSON body.");
    }

    const cand = json.candidates?.[0];
    const block = cand?.content?.parts?.[0];
    const inline = block?.inlineData || block?.inline_data;
    mime = String(inline?.mimeType || inline?.mime_type || "");
    b64 = inline?.data;

    if (!b64) {
      const br = json.promptFeedback?.blockReason || cand?.finishReason;
      /** Some Gemini TTS responses come back with finishReason "OTHER" and no inlineData. Treat as transient. */
      if (br === "OTHER" && attempt < maxAttempts) {
        const waitMs = Math.min(30_000, 1500 * 2 ** (attempt - 1));
        console.warn(
          `  Gemini TTS empty audio (finish=OTHER) — retrying in ${(waitMs / 1000).toFixed(2)}s (attempt ${attempt}/${maxAttempts - 1}).`
        );
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      throw new Error(
        `Gemini TTS missing audio inlineData${br ? ` (finish/block: ${br})` : ""}: ${raw.slice(0, 400)}`
      );
    }
    
    break; // We have b64, exit retry loop
  }

  const pcm = Buffer.from(b64, "base64");
  if (pcm.length < 32) {
    throw new Error("Gemini TTS returned suspiciously small audio.");
  }

  let sampleRate = 24000;
  const rateM = /rate=(\d+)/i.exec(mime);
  if (rateM) {
    const n = Number(rateM[1]);
    if (Number.isFinite(n) && n > 0) sampleRate = n;
  }

  const id = randomUUID();
  const pcmPath = join(workDir, `gemini-${id}.pcm`);
  const mp3Path = join(workDir, `gemini-${id}.mp3`);
  await writeFile(pcmPath, pcm);

  try {
    await execFileP("ffmpeg", [
      "-y",
      "-f",
      "s16le",
      "-ar",
      String(sampleRate),
      "-ac",
      "1",
      "-i",
      pcmPath,
      "-c:a",
      "libmp3lame",
      "-b:a",
      "128k",
      "-ar",
      "44100",
      "-ac",
      "2",
      mp3Path
    ]);
    return await readFile(mp3Path);
  } finally {
    await rm(pcmPath, { force: true });
    await rm(mp3Path, { force: true });
  }
}
