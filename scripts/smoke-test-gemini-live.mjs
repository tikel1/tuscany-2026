/**
 * Smoke-test the Gemini Live WebSocket setup against a real model.
 *
 * Usage:
 *   node scripts/smoke-test-gemini-live.mjs <MODEL> [TEXT|AUDIO]
 *
 * Reads VITE_GEMINI_API_KEY from .env.local. Sends a minimal setup
 * payload (matches the one src/lib/gemininio/live.ts emits), then a
 * real text message, and prints every server message until the
 * model finishes its turn.
 */

import { readFileSync } from "node:fs";
import WebSocket from "ws";

const MODEL = process.argv[2] ?? "models/gemini-3.1-flash-live-preview";
const MODALITIES = (process.argv[3] ?? "AUDIO").split(",");

const env = readFileSync(".env.local", "utf8");
const KEY = env.match(/VITE_GEMINI_API_KEY=(.+)/)?.[1].trim();
if (!KEY) {
  console.error("No VITE_GEMINI_API_KEY in .env.local");
  process.exit(1);
}

const url =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=" +
  encodeURIComponent(KEY);

const ws = new WebSocket(url);
const wantsAudio = MODALITIES.includes("AUDIO");
let audioBytes = 0;
let transcriptText = "";
let modelTurnText = "";

const generationConfig = { response_modalities: MODALITIES };
if (wantsAudio) {
  generationConfig.speech_config = {
    voice_config: { prebuilt_voice_config: { voice_name: "Charon" } },
    language_code: "en-US"
  };
}

ws.on("open", () => {
  const setup = {
    setup: {
      model: MODEL,
      system_instruction: { parts: [{ text: "You are a test bot. Reply in ONE short sentence." }] },
      generation_config: generationConfig,
      ...(wantsAudio
        ? { input_audio_transcription: {}, output_audio_transcription: {} }
        : {})
    }
  };
  console.log(`→ Sending setup to ${MODEL} (modalities: ${MODALITIES.join(",")})`);
  ws.send(JSON.stringify(setup));
});

ws.on("message", raw => {
  const msg = JSON.parse(raw.toString());
  if (msg.setupComplete !== undefined) {
    console.log("✓ setupComplete");
    ws.send(JSON.stringify({
      client_content: {
        turns: [{ role: "user", parts: [{ text: "Say hello in five words." }] }],
        turn_complete: true
      }
    }));
    console.log("→ Sent test prompt");
    return;
  }
  const sc = msg.serverContent;
  if (sc) {
    if (sc.outputTranscription?.text) {
      transcriptText += sc.outputTranscription.text;
      console.log(`  transcript: "${sc.outputTranscription.text}"`);
    }
    if (sc.modelTurn?.parts) {
      for (const p of sc.modelTurn.parts) {
        if (p.text) {
          modelTurnText += p.text;
          console.log(`  modelTurn.text: "${p.text}"`);
        }
        if (p.inlineData?.data) {
          audioBytes += p.inlineData.data.length;
        }
      }
    }
    if (sc.turnComplete) {
      console.log("✓ turnComplete");
      console.log(`Summary: ${audioBytes}b audio, transcript="${transcriptText}", modelTurn.text="${modelTurnText}"`);
      ws.close();
      process.exit(0);
    }
  }
});

ws.on("close", e => console.log(`✗ closed: code=${e}`));
ws.on("error", err => console.error("error:", err.message));
setTimeout(() => { console.log("⏱ timeout"); ws.close(); process.exit(2); }, 12000);
