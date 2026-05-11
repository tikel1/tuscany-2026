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

/* Currently-valid bidiGenerateContent models on v1beta (verified
 * against the live ListModels response — both `gemini-live-2.5-
 * flash-preview` and `gemini-2.0-flash-live-001` were retired on
 * 2025-12-09 and now return a 1008 "model not found").
 *
 * IMPORTANT: every Live model on this account currently rejects
 * `response_modalities: ["TEXT"]`. The 2.5 native-audio family
 * returns code 1007 "Cannot extract voices from a non-audio
 * request"; the 3.1 live preview returns a generic 1011 internal
 * error even with a minimal payload. So we ALWAYS open the
 * session in AUDIO mode and, when the user has the chat muted,
 * simply drop the incoming PCM bytes on the client side
 * (outputTranscription still flows, so the visible reply works).
 * Less efficient than per-modality switching but actually works.
 *
 * `gemini-3.1-flash-live-preview` is the documented "all use
 * cases" recommendation: native audio out, clean transcripts, no
 * chain-of-thought leakage. Falls back to the 2.5 native-audio
 * "latest" alias if the preview is ever pulled. */
const PRIMARY_MODEL  = "models/gemini-3.1-flash-live-preview";
const FALLBACK_MODEL = "models/gemini-2.5-flash-native-audio-latest";

const WS_BASE =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

/** Voices ship with the Live model. "Charon" is warm, slightly
 *  husky, the most "tour guide"-feeling of the lot once steered with
 *  an Italian persona prompt. "Puck" is a good lighter alternative. */
const VOICE_NAME = "Charon";

export interface LiveCallbacks {
  /** Streamed text deltas from the model's reply (sourced from
   *  the server's outputTranscription channel). */
  onText?: (delta: string) => void;
  /** Streamed PCM audio (24 kHz, mono, 16-bit LE). The caller is
   *  free to ignore this — when the user has muted the chat, just
   *  drop the bytes. The text reply still arrives via `onText`. */
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
}

export class LiveSession {
  private ws: WebSocket | null = null;
  private cb: LiveCallbacks;
  private opts: LiveOptions;
  private setupComplete = false;
  private closed = false;

  constructor(opts: LiveOptions, cb: LiveCallbacks = {}) {
    this.opts = opts;
    this.cb = cb;
  }

  /** Open the socket and send the `setup` message. Resolves once the
   *  server has acknowledged setup; rejects on early failure. Tries
   *  the primary model first; on any setup-time failure, retries
   *  once with the fallback model so the chat still works if the
   *  primary preview is ever pulled. */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.openOnce(PRIMARY_MODEL)
        .then(resolve)
        .catch(() =>
          this.openOnce(FALLBACK_MODEL).then(resolve).catch(reject)
        );
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
        // Always AUDIO modality (see top-of-file note on why TEXT
        // is broken across every Live model right now). The caller
        // can still mute output by ignoring the `onAudio` callback;
        // the visible text reply comes from outputTranscription
        // which the server emits regardless.
        const setup = {
          setup: {
            model,
            system_instruction: {
              parts: [{ text: this.opts.systemInstruction }]
            },
            generation_config: {
              response_modalities: ["AUDIO"],
              speech_config: {
                voice_config: {
                  prebuilt_voice_config: { voice_name: VOICE_NAME }
                },
                language_code: this.opts.language === "he" ? "he-IL" : "en-US"
              }
              // NOTE: we used to send `thinking_config: { thinking_budget: 0 }`
              // here to suppress chain-of-thought leakage. The Live preview
              // models are NOT thinking models, and including the field
              // caused 1008 policy violation before setupComplete. The
              // defense-in-depth `part.thought` filter in handleMessage()
              // below drops any thought parts client-side, which is enough.
            },
            input_audio_transcription: {},
            output_audio_transcription: {}
          }
        };
        ws.send(JSON.stringify(setup));
      };

      ws.onmessage = ev => this.handleMessage(ev, resolve);
      ws.onerror = () => reject(new Error("WebSocket error connecting to Gemini Live"));
      ws.onclose = e => {
        this.closed = true;
        if (!this.setupComplete) {
          // Closed before setupComplete — most often a 1008 policy
          // violation on the setup payload (unsupported config field
          // for this model, bad model name, key restriction, etc).
          // Surface `e.reason` if the server included one — that's
          // where the actionable detail lives.
          const reason = e.reason ? ` — ${e.reason}` : "";
          reject(
            new Error(
              `Gemini Live closed before setup (code ${e.code} on ${model})${reason}`
            )
          );
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
      // User-side transcript of our mic input.
      const it = sc.inputTranscription as { text?: string } | undefined;
      if (it?.text) this.cb.onTranscript?.(it.text, false);

      // Model-side transcript — the canonical visible reply. We
      // always run AUDIO sessions, so this is the source of truth
      // for what the model "said". `modelTurn.parts[].text` is
      // skipped because in AUDIO mode it carries internal scratch
      // (reasoning, narration) and would just bloat the bubble.
      const ot = sc.outputTranscription as { text?: string } | undefined;
      if (ot?.text) this.cb.onText?.(ot.text);

      const turn = sc.modelTurn as
        | { parts?: Array<Record<string, unknown>> }
        | undefined;
      if (turn?.parts) {
        for (const part of turn.parts) {
          // Defensive filter for thought summaries (some preview
          // models still emit them).
          if (part.thought === true) continue;

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
