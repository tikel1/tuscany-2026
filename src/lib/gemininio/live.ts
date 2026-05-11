/**
 * Tiny client for the Gemini Live API (BidiGenerateContent).
 *
 * Talks the JSON-over-WebSocket protocol described at
 * https://ai.google.dev/api/live — just the bits Gemininio needs:
 *
 *   1. Connect to wss://…BidiGenerateContent?key=API_KEY
 *   2. Send a `setup` message (model + system instruction + voice)
 *   3. Stream user audio (16 kHz PCM base64) and/or text
 *   4. Receive interleaved text + audio chunks (24 kHz PCM base64)
 *      with intermediate "input transcription" deltas so the user
 *      sees what the mic heard, and "model turn" deltas + final
 *      "turn complete" markers
 *
 * The class is event-emitter-ish: callers register callbacks
 * (onText, onAudio, onTranscript, onError, onClose, onTurnComplete)
 * and call sendText() / sendAudioChunk() / endTurn() / close().
 */

import { bytesToBase64 } from "./audio";

/* The `-native-audio` preview model gives the most natural voice
 * out and best language steerability via prompts. If it's unavailable
 * for an account, fall back to `gemini-live-2.5-flash-preview`. */
const PRIMARY_MODEL = "models/gemini-2.5-flash-native-audio-preview-09-2025";
const FALLBACK_MODEL = "models/gemini-live-2.5-flash-preview";

const WS_BASE =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

/** Voices ship with the Live model. "Charon" is warm, slightly
 *  husky, the most "tour guide"-feeling of the lot once steered with
 *  an Italian persona prompt. "Puck" is a good lighter alternative. */
const VOICE_NAME = "Charon";

export type ResponseModality = "AUDIO" | "TEXT";

export interface LiveCallbacks {
  /** Streamed text deltas from the model's reply. */
  onText?: (delta: string) => void;
  /** Streamed PCM audio (24 kHz, mono, 16-bit LE). */
  onAudio?: (pcm: Uint8Array) => void;
  /** Transcript of what the user actually said (server-side ASR
   *  Gemini does on our 16 kHz mic stream). */
  onTranscript?: (delta: string, isFinal: boolean) => void;
  /** Model finished its turn — safe to enable input again. */
  onTurnComplete?: () => void;
  /** Connection-level errors. */
  onError?: (err: string) => void;
  /** WebSocket closed (clean or otherwise). */
  onClose?: () => void;
}

export interface LiveOptions {
  apiKey: string;
  systemInstruction: string;
  /** "he" → he-IL transcription / output, otherwise en-US. */
  language: "en" | "he";
  /** Default ["AUDIO"]; pass ["TEXT"] for typed-only sessions. */
  responseModalities?: ResponseModality[];
}

export class LiveSession {
  private ws: WebSocket | null = null;
  private cb: LiveCallbacks;
  private opts: LiveOptions;
  private setupComplete = false;
  private closed = false;
  private modelTried = PRIMARY_MODEL;

  constructor(opts: LiveOptions, cb: LiveCallbacks = {}) {
    this.opts = opts;
    this.cb = cb;
  }

  /** Open the socket and send the `setup` message. Resolves once the
   *  server has acknowledged setup; rejects on early failure. */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.openOnce(this.modelTried)
        .then(resolve)
        .catch(err => {
          // Some Google accounts don't have the preview native-audio
          // model enabled. Fall back to the standard live-2.5 model
          // once before giving up.
          if (this.modelTried === PRIMARY_MODEL) {
            this.modelTried = FALLBACK_MODEL;
            this.openOnce(this.modelTried).then(resolve).catch(reject);
          } else {
            reject(err);
          }
        });
    });
  }

  private openOnce(model: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${WS_BASE}?key=${encodeURIComponent(this.opts.apiKey)}`;
      let ws: WebSocket;
      try {
        ws = new WebSocket(url);
      } catch (e) {
        reject(e);
        return;
      }
      this.ws = ws;
      ws.binaryType = "arraybuffer";

      ws.onopen = () => {
        const modalities = this.opts.responseModalities ?? ["AUDIO"];
        const wantsAudio = modalities.includes("AUDIO");
        const generationConfig: Record<string, unknown> = {
          response_modalities: modalities,
          // Native-audio preview model emits chain-of-thought text
          // by default. Force the budget to 0 so the model jumps
          // straight to the answer — the user doesn't want to see
          // "I'm now considering whether…". We also defensively
          // filter `part.thought` parts on the client below in
          // case the server still emits any.
          thinking_config: { thinking_budget: 0 }
        };
        // speech_config only matters when we're asking for audio
        // back. Including it for a TEXT-only session is harmless
        // but makes the wire log noisy; leave it out.
        if (wantsAudio) {
          generationConfig.speech_config = {
            voice_config: {
              prebuilt_voice_config: { voice_name: VOICE_NAME }
            },
            language_code: this.opts.language === "he" ? "he-IL" : "en-US"
          };
        }
        const setup: Record<string, unknown> = {
          setup: {
            model,
            system_instruction: {
              parts: [{ text: this.opts.systemInstruction }]
            },
            generation_config: generationConfig,
            input_audio_transcription: {},
            // Only ask the server to transcribe its own audio when
            // there IS audio. In TEXT mode this would be a no-op.
            ...(wantsAudio ? { output_audio_transcription: {} } : {})
          }
        };
        ws.send(JSON.stringify(setup));
      };

      ws.onmessage = ev => this.handleMessage(ev, resolve);
      ws.onerror = () => reject(new Error("WebSocket error connecting to Gemini Live"));
      ws.onclose = e => {
        this.closed = true;
        if (!this.setupComplete) {
          // Closed before we got setupComplete — propagate as connect
          // failure so the fallback model can try.
          reject(new Error(`Gemini Live closed before setup (code ${e.code})`));
        }
        this.cb.onClose?.();
      };
    });
  }

  private async handleMessage(ev: MessageEvent, resolveSetup: () => void) {
    let payload: unknown;
    try {
      const raw =
        ev.data instanceof ArrayBuffer
          ? new TextDecoder().decode(ev.data)
          : typeof ev.data === "string"
            ? ev.data
            : await (ev.data as Blob).text();
      payload = JSON.parse(raw);
    } catch (e) {
      this.cb.onError?.("Bad message from Gemini Live: " + String(e));
      return;
    }

    const msg = payload as Record<string, unknown>;

    if (msg.setupComplete !== undefined) {
      this.setupComplete = true;
      resolveSetup();
      return;
    }

    // Server content: text + audio + transcripts.
    const sc = msg.serverContent as Record<string, unknown> | undefined;
    if (sc) {
      // Track whether the current setup intends to speak audio. If
      // it does, the canonical visible text is the AUDIO transcript
      // (outputTranscription) — modelTurn text parts in that mode
      // are usually internal thoughts / reasoning that we don't
      // want to surface. In TEXT-only mode, modelTurn text IS the
      // answer, so we forward it.
      const wantsAudio = (this.opts.responseModalities ?? ["AUDIO"]).includes("AUDIO");

      // User-side transcript of our mic input.
      const it = sc.inputTranscription as { text?: string } | undefined;
      if (it?.text) this.cb.onTranscript?.(it.text, false);

      // Model-side transcript (text version of what the audio says).
      const ot = sc.outputTranscription as { text?: string } | undefined;
      if (ot?.text) this.cb.onText?.(ot.text);

      const turn = sc.modelTurn as
        | { parts?: Array<Record<string, unknown>> }
        | undefined;
      if (turn?.parts) {
        for (const part of turn.parts) {
          // Defensive filter — even with thinking_budget=0 in
          // setup, some preview models still emit thought summaries
          // tagged with `thought: true`. Drop them on the client.
          if (part.thought === true) continue;

          // For AUDIO sessions, skip text parts entirely — the
          // visible text comes from outputTranscription. Anything
          // else here is reasoning / metadata that bloats the bubble.
          if (!wantsAudio) {
            const t = part.text as string | undefined;
            if (typeof t === "string" && t.length > 0) this.cb.onText?.(t);
          }

          const inline = part.inlineData as
            | { mimeType?: string; data?: string }
            | undefined;
          if (inline?.data && inline.mimeType?.startsWith("audio/")) {
            try {
              const bin = atob(inline.data);
              const bytes = new Uint8Array(bin.length);
              for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
              this.cb.onAudio?.(bytes);
            } catch (e) {
              this.cb.onError?.("Bad audio chunk: " + String(e));
            }
          }
        }
      }

      if (sc.turnComplete) this.cb.onTurnComplete?.();
    }

    // Top-level error from the server (rare).
    if (msg.error) {
      const err = msg.error as { message?: string };
      this.cb.onError?.(err.message ?? "Unknown Gemini Live error");
    }
  }

  /** Send a typed user message. Triggers a model turn. */
  sendText(text: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const msg = {
      client_content: {
        turns: [{ role: "user", parts: [{ text }] }],
        turn_complete: true
      }
    };
    this.ws.send(JSON.stringify(msg));
  }

  /** Push one chunk of mic audio. Multiple chunks may flow per turn;
   *  call endTurn() (or stop sending and let VAD wrap up) when done. */
  sendAudioChunk(pcm16: Uint8Array): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const msg = {
      realtime_input: {
        media_chunks: [
          {
            mime_type: "audio/pcm;rate=16000",
            data: bytesToBase64(pcm16)
          }
        ]
      }
    };
    this.ws.send(JSON.stringify(msg));
  }

  /** Tell the server the user has finished speaking — the server's
   *  voice activity detection usually catches this on its own, but
   *  flushing on stop() makes the response snappier. */
  endTurn(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const msg = { realtime_input: { activity_end: {} } };
    this.ws.send(JSON.stringify(msg));
  }

  close(): void {
    this.closed = true;
    try {
      this.ws?.close();
    } catch {
      /* ignore */
    }
    this.ws = null;
  }

  isOpen(): boolean {
    return !this.closed && this.ws?.readyState === WebSocket.OPEN;
  }
}
