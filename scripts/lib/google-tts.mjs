/**
 * Shared Google Cloud Text-to-Speech (Chirp 3 HD) helpers for local scripts.
 * Auth: `gcloud auth application-default login` or `GOOGLE_APPLICATION_CREDENTIALS`.
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const ENV_LINE_RE =
  /^\s*(ELEVEN_[A-Z0-9_]+|GOOGLE_[A-Z0-9_]+|GOOGLE_APPLICATION_CREDENTIALS)\s*=\s*(.*)$/;

/** Merge `.env.local` into `process.env` for known keys (does not override existing). */
export async function loadProjectEnvLocal(repoRoot) {
  const p = resolve(repoRoot, ".env.local");
  let raw;
  try {
    raw = (await readFile(p, "utf8")).replace(/\r\n/g, "\n");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const m = line.match(ENV_LINE_RE);
    if (!m) continue;
    const key = m[1];
    if (process.env[key]?.trim()) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!v) continue;
    process.env[key] = v;
  }
}

export async function getGoogleAccessToken() {
  const { GoogleAuth } = await import("google-auth-library");
  try {
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-texttospeech"]
    });
    const client = await auth.getClient();
    const at = await client.getAccessToken();
    if (!at.token) {
      throw new Error("Google returned an empty access token.");
    }
    return at.token;
  } catch (e) {
    const inner = e instanceof Error ? e.message : String(e);
    throw new Error(
      `${inner}\n` +
        "Fix: run `gcloud auth application-default login`, or set `GOOGLE_APPLICATION_CREDENTIALS` " +
        "to a service-account JSON path (you can put that line in `.env.local`; scripts load it automatically)."
    );
  }
}

/**
 * @param {string} accessToken
 * @param {{ languageCode: string; name: string }} voice BCP-47 + full Chirp3 voice name
 * @param {string} text
 * @param {{ speakingRate?: number }} [opts] defaults to `GOOGLE_TTS_SPEAKING_RATE` or 0.9
 */
export async function googleSynthesizeToMp3Buffer(accessToken, voice, text, opts = {}) {
  const fromEnv = Number(process.env.GOOGLE_TTS_SPEAKING_RATE || 0.9);
  const speakingRate = Number.isFinite(opts.speakingRate)
    ? opts.speakingRate
    : Number.isFinite(fromEnv)
      ? fromEnv
      : 0.9;

  const url = "https://texttospeech.googleapis.com/v1/text:synthesize";
  const audioConfig = {
    audioEncoding: "MP3",
    speakingRate
  };
  const srRaw = process.env.GOOGLE_TTS_SAMPLE_RATE_HERTZ?.trim();
  if (srRaw) {
    const sr = Number(srRaw);
    if (Number.isFinite(sr) && sr > 0) {
      audioConfig.sampleRateHertz = sr;
    }
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: voice.languageCode,
        name: voice.name
      },
      audioConfig
    })
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Google TTS ${res.status}: ${raw.slice(0, 500)}`);
  }
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error("Google TTS returned non-JSON body.");
  }
  const b64 = json.audioContent;
  if (!b64) {
    throw new Error(`Google TTS missing audioContent: ${raw.slice(0, 300)}`);
  }
  const buf = Buffer.from(b64, "base64");
  if (buf.length < 80) {
    throw new Error("Google TTS returned suspiciously small audio.");
  }
  return buf;
}
