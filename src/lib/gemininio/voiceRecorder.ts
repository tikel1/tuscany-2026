/**
 * Thin wrapper around MediaRecorder for one-shot voice capture.
 *
 * Pattern: `start()` → user speaks → `stop()` → returns a Blob ready
 * to ship to Gemini's REST transcription endpoint. We pick the best
 * MIME type the current browser supports (webm/opus on Chromium,
 * mp4/aac on Safari, ogg/opus on Firefox); Gemini's audio understanding
 * accepts any of those.
 *
 * Why a class? So Gemininio can hold a single ref and `start()` /
 * `stop()` between renders without re-wiring listeners.
 */

const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/mp4",
  "audio/aac"
];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  for (const t of PREFERRED_MIME_TYPES) {
    try {
      if (MediaRecorder.isTypeSupported(t)) return t;
    } catch {
      /* some browsers throw on unknown types — ignore and continue */
    }
  }
  return undefined;
}

export class VoiceRecorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stopPromise: Promise<Blob> | null = null;
  private resolveStop: ((b: Blob) => void) | null = null;
  private rejectStop: ((e: Error) => void) | null = null;
  private mimeType: string = "audio/webm";

  /** Open the mic and begin capturing. Resolves once the recorder is
   *  actually in the `recording` state (so the caller can flip UI). */
  async start(): Promise<void> {
    if (this.recorder && this.recorder.state === "recording") return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone is not available in this browser.");
    }
    if (typeof MediaRecorder === "undefined") {
      throw new Error("Audio recording is not supported in this browser.");
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1
      }
    });

    const mime = pickMimeType();
    this.mimeType = mime ?? "audio/webm";
    this.chunks = [];

    try {
      this.recorder = mime
        ? new MediaRecorder(this.stream, { mimeType: mime })
        : new MediaRecorder(this.stream);
    } catch {
      this.recorder = new MediaRecorder(this.stream);
    }

    this.recorder.ondataavailable = e => {
      if (e.data && e.data.size > 0) this.chunks.push(e.data);
    };

    this.stopPromise = new Promise<Blob>((resolve, reject) => {
      this.resolveStop = resolve;
      this.rejectStop = reject;
    });

    this.recorder.onstop = () => {
      const type = this.recorder?.mimeType || this.mimeType;
      const blob = new Blob(this.chunks, { type });
      this.chunks = [];
      this.cleanupStream();
      this.resolveStop?.(blob);
    };

    this.recorder.onerror = ev => {
      const err =
        (ev as unknown as { error?: Error }).error ??
        new Error("Recording failed.");
      this.cleanupStream();
      this.rejectStop?.(err);
    };

    this.recorder.start();
  }

  /** Stop recording and resolve with the captured audio blob. Safe to
   *  call multiple times — only the first call does work. */
  stop(): Promise<Blob> {
    if (!this.recorder || !this.stopPromise) {
      return Promise.resolve(new Blob([], { type: this.mimeType }));
    }
    if (this.recorder.state === "recording") {
      try {
        this.recorder.stop();
      } catch (e) {
        this.cleanupStream();
        this.rejectStop?.(e instanceof Error ? e : new Error(String(e)));
      }
    }
    const p = this.stopPromise;
    return p;
  }

  /** Hard-cancel the recording without resolving with audio. */
  cancel(): void {
    if (this.recorder?.state === "recording") {
      try {
        this.recorder.stop();
      } catch {
        /* ignore */
      }
    }
    this.chunks = [];
    this.cleanupStream();
    this.resolveStop?.(new Blob([], { type: this.mimeType }));
    this.recorder = null;
    this.stopPromise = null;
    this.resolveStop = null;
    this.rejectStop = null;
  }

  private cleanupStream(): void {
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
  }

  isRecording(): boolean {
    return this.recorder?.state === "recording";
  }
}
