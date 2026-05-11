import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Send,
  Mic,
  Settings as SettingsIcon,
  Trash2,
  ExternalLink,
  Loader2,
  MessageCircle
} from "lucide-react";
import { useT } from "../lib/dict";
import { useLang } from "../lib/i18n";
import { LiveSession } from "../lib/gemininio/live";
import { MicCapture, PcmPlayer } from "../lib/gemininio/audio";
import { buildSystemPrompt } from "../lib/gemininio/persona";
import {
  getApiKey,
  setApiKey,
  clearApiKey,
  loadHistory,
  saveHistory,
  clearHistory,
  hasBuildTimeKey,
  hasUserOverride,
  type PersistedMessage
} from "../lib/gemininio/storage";

/**
 * Gemininio — the AI tour-guide chat. A floating button on every
 * page that opens a bottom-sheet on mobile / modal on desktop.
 *
 * Architecture (recap from HOW_TO doc §15):
 * - Static SPA on GitHub Pages → no backend, so no shared API key.
 * - Each user pastes their own free Gemini key once; saved in
 *   localStorage on their device only.
 * - Browser opens a WebSocket directly to the Gemini Live API,
 *   streaming 16 kHz PCM mic audio up and 24 kHz PCM voice down.
 * - System prompt rebuilt from the live trip data so any itinerary
 *   edit is immediately known to Gemininio.
 *
 * The connection is lazy: we only connect on first message of a
 * session, and tear down on close — so opening the panel "just to
 * see" doesn't burn quota.
 */

type ChatStatus =
  | "closed"           // panel not open
  | "needs-key"        // panel open, no API key yet
  | "ready"            // key present, no live session
  | "connecting"
  | "listening"        // mic is open, capturing user's voice
  | "thinking"         // user finished, waiting for / receiving model reply
  | "speaking"         // model is currently producing audio
  | "error";

interface Message extends PersistedMessage {
  /** Lets us update the SAME bubble as text streams in. */
  streaming?: boolean;
}

export default function Gemininio() {
  const t = useT();
  const { lang } = useLang();

  /* ---------------- state ---------------- */

  const [status, setStatus] = useState<ChatStatus>("closed");
  const [keyDraft, setKeyDraft] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => loadHistory());
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  /* ---------------- refs ---------------- */

  const sessionRef = useRef<LiveSession | null>(null);
  const playerRef = useRef<PcmPlayer | null>(null);
  const micRef = useRef<MicCapture | null>(null);
  const transcriptRef = useRef<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ---------------- side effects ---------------- */

  // Persist transcript on change (skipping streaming intermediates is
  // not worth the bookkeeping — the JSON is tiny).
  useEffect(() => {
    saveHistory(messages.map(m => ({ role: m.role, text: m.text, ts: m.ts })));
  }, [messages]);

  // Auto-scroll the message list when something new lands.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  // Tear everything down when the panel closes.
  useEffect(() => {
    if (status !== "closed") return;
    sessionRef.current?.close();
    sessionRef.current = null;
    micRef.current?.stop();
    micRef.current = null;
    playerRef.current?.stop();
    playerRef.current = null;
  }, [status]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      sessionRef.current?.close();
      micRef.current?.stop();
      playerRef.current?.stop();
    };
  }, []);

  /* ---------------- helpers ---------------- */

  function open() {
    const key = getApiKey();
    setError(null);
    if (!key) {
      setStatus("needs-key");
      return;
    }
    setStatus("ready");
  }

  function close() {
    setStatus("closed");
    setShowSettings(false);
  }

  /** Open or reuse a Live session. We connect lazily on first send so
   *  opening the panel for a peek doesn't establish a socket. */
  async function ensureSession(): Promise<LiveSession | null> {
    if (sessionRef.current?.isOpen()) return sessionRef.current;

    const apiKey = getApiKey();
    if (!apiKey) {
      setStatus("needs-key");
      return null;
    }

    setStatus("connecting");
    setError(null);

    const session = new LiveSession(
      {
        apiKey,
        systemInstruction: buildSystemPrompt(lang),
        language: lang,
        responseModalities: ["AUDIO"]
      },
      {
        onText: delta => {
          // Append the delta to the in-flight model bubble (or
          // create one if this is the first chunk of a turn).
          // Pure functional update — no ref mutation, so React's
          // reconciler can't get out of sync with our state.
          setMessages(ms => {
            const last = ms[ms.length - 1];
            if (last && last.role === "model" && last.streaming) {
              return [...ms.slice(0, -1), { ...last, text: last.text + delta }];
            }
            return [...ms, { role: "model", text: delta, ts: Date.now(), streaming: true }];
          });
        },
        onAudio: pcm => {
          if (!playerRef.current) playerRef.current = new PcmPlayer();
          playerRef.current.enqueue(pcm);
          setStatus("speaking");
        },
        onTranscript: delta => {
          // Accumulate user-speech transcript into a buffer; commit
          // it as a user bubble when the turn completes.
          transcriptRef.current += delta;
        },
        onTurnComplete: () => {
          // Commit any pending transcript as a user message,
          // inserting it BEFORE the model's reply so the chat
          // reads in the right order.
          const transcript = transcriptRef.current.trim();
          transcriptRef.current = "";
          setMessages(ms => {
            let next = ms;
            if (transcript) {
              const lastIsStreamingModel =
                ms.length > 0 && ms[ms.length - 1].role === "model" && ms[ms.length - 1].streaming;
              const userMsg: Message = {
                role: "user",
                text: transcript,
                ts: Date.now() - 1
              };
              next = lastIsStreamingModel
                ? [...ms.slice(0, -1), userMsg, ms[ms.length - 1]]
                : [...ms, userMsg];
            }
            // Mark every still-streaming bubble as final.
            return next.map(m => (m.streaming ? { ...m, streaming: false } : m));
          });
          setStatus("ready");
        },
        onError: msg => {
          setError(msg);
          setStatus("error");
          // Strip any in-flight empty placeholder so the user isn't
          // staring at typing dots that will never resolve.
          setMessages(ms =>
            ms.filter(m => !(m.role === "model" && m.streaming && !m.text))
              .map(m => (m.streaming ? { ...m, streaming: false } : m))
          );
        },
        onClose: () => {
          if (status !== "closed") setStatus("ready");
        }
      }
    );
    try {
      await session.connect();
      sessionRef.current = session;
      setStatus("ready");
      return session;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
      return null;
    }
  }

  async function sendText() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    // Append BOTH the user's question and a placeholder "streaming"
    // model bubble in one update — the empty bubble with
    // `streaming: true` is what triggers the bouncing typing dots
    // in <Bubble />. We don't want a flicker between "user message"
    // and "model bubble appears", so they land together.
    setMessages(ms => [
      ...ms,
      { role: "user", text: trimmed, ts: Date.now() },
      { role: "model", text: "", ts: Date.now() + 1, streaming: true }
    ]);
    setStatus("thinking");
    const s = await ensureSession();
    if (!s) {
      // Connection failed — strip the placeholder back out so the
      // user isn't left staring at perpetually-bouncing dots.
      setMessages(ms => ms.filter(m => !(m.role === "model" && m.streaming && !m.text)));
      return;
    }
    s.sendText(trimmed);
  }

  async function startMic() {
    const s = await ensureSession();
    if (!s) return;
    if (!micRef.current) {
      micRef.current = new MicCapture(pcm => s.sendAudioChunk(pcm));
    }
    try {
      await micRef.current.start();
      transcriptRef.current = "";
      setStatus("listening");
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      // Heuristic: NotAllowedError → permission blocked.
      if (m.toLowerCase().includes("not allow") || m.toLowerCase().includes("denied")) {
        setError(t("gem_error_mic"));
      } else {
        setError(m);
      }
      setStatus("error");
    }
  }

  async function stopMic() {
    await micRef.current?.stop();
    sessionRef.current?.endTurn();
    setStatus("thinking");
    // Same trick as sendText — drop a placeholder streaming bubble
    // so the typing dots appear immediately while we wait for the
    // model's reply. The user transcript will be inserted just
    // BEFORE this bubble in onTurnComplete, and the model's reply
    // text (from outputTranscription) flows INTO this bubble.
    setMessages(ms => [
      ...ms,
      { role: "model", text: "", ts: Date.now(), streaming: true }
    ]);
  }

  function handleSaveKey() {
    const v = keyDraft.trim();
    if (!v) return;
    setApiKey(v);
    setKeyDraft("");
    setStatus("ready");
    setError(null);
  }

  function handleForgetKey() {
    clearApiKey();
    setShowSettings(false);
    // Re-evaluate: if a build-time env key still exists, we just
    // fall back to it and keep the chat alive. Otherwise, show
    // the setup screen so the user can paste a new key.
    setStatus(hasBuildTimeKey() ? "ready" : "needs-key");
  }

  function handleClearHistory() {
    clearHistory();
    setMessages([]);
  }

  /* ---------------- JSX ---------------- */

  return (
    <>
      {/* Floating launcher — sits on the start side so it doesn't
          collide with the existing map FAB on the end side. */}
      <button
        onClick={open}
        aria-label={t("gem_open")}
        title={t("gem_open")}
        className="fixed z-30 start-4 sm:start-6 md:start-8 bottom-[calc(80px+env(safe-area-inset-bottom))] md:bottom-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-terracotta-500 to-sienna-600 text-cream-50 px-4 py-3 shadow-lg shadow-terracotta-700/30 active:scale-95 transition-transform"
        style={{ display: status === "closed" ? "inline-flex" : "none" }}
      >
        <Sparkles size={16} />
        <span className="text-sm font-medium">{t("gem_title")}</span>
      </button>

      <AnimatePresence>
        {status !== "closed" && (
          <>
            {/* Backdrop */}
            <motion.div
              key="gem-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
              className="fixed inset-0 z-40 bg-ink-900/55 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              key="gem-panel"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed z-50 inset-x-0 bottom-0 sm:inset-x-auto sm:end-6 sm:bottom-6 sm:start-auto sm:w-[420px] sm:h-[calc(100vh-3rem)] sm:max-h-[760px] bg-cream-50 sm:rounded-3xl rounded-t-3xl shadow-2xl shadow-ink-900/40 flex flex-col overflow-hidden"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
              data-compact-ui
            >
              {/* Header */}
              <div className="px-5 pt-4 pb-3 border-b border-cream-300/70 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-terracotta-500 to-sienna-600 text-cream-50 flex items-center justify-center shrink-0">
                  <Sparkles size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-lg leading-tight text-ink-900">
                    {t("gem_title")}
                  </div>
                  <div className="text-[11px] text-ink-700/60 leading-tight">
                    {t("gem_tagline")}
                  </div>
                </div>
                <button
                  onClick={() => setShowSettings(s => !s)}
                  aria-label={t("gem_settings")}
                  title={t("gem_settings")}
                  className="p-2 rounded-full hover:bg-cream-200 transition"
                >
                  <SettingsIcon size={16} />
                </button>
                <button
                  onClick={close}
                  aria-label={t("gem_close")}
                  className="p-2 rounded-full hover:bg-cream-200 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body — settings, setup, or chat */}
              {showSettings ? (
                <SettingsView
                  // The "Forget my key" button only does something
                  // useful if there's a user-pasted override on top
                  // of the built-in env key. With a build-time key
                  // and no override, "forget" would just fall back
                  // to the same env key — so we hide the button
                  // entirely to avoid a confusing no-op.
                  showForgetKey={hasUserOverride()}
                  hasBuildTimeKey={hasBuildTimeKey()}
                  onForgetKey={handleForgetKey}
                  onClearHistory={handleClearHistory}
                  onBack={() => setShowSettings(false)}
                />
              ) : status === "needs-key" ? (
                <SetupView
                  draft={keyDraft}
                  setDraft={setKeyDraft}
                  onSave={handleSaveKey}
                />
              ) : (
                <ChatView
                  messages={messages}
                  status={status}
                  error={error}
                  text={text}
                  setText={setText}
                  scrollRef={scrollRef}
                  inputRef={inputRef}
                  onSend={sendText}
                  onMicDown={startMic}
                  onMicUp={stopMic}
                />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ================================================================== */
/* Subviews                                                            */
/* ================================================================== */

function SetupView({
  draft,
  setDraft,
  onSave
}: {
  draft: string;
  setDraft: (s: string) => void;
  onSave: () => void;
}) {
  const t = useT();
  return (
    <div className="px-5 py-5 overflow-y-auto flex-1 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-full bg-cream-200 text-ink-700 flex items-center justify-center">
          <MessageCircle size={16} />
        </div>
        <div className="flex-1">
          <div className="font-serif text-lg text-ink-900">{t("gem_setup_title")}</div>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-700/85">
            {t("gem_setup_blurb")}
          </p>
        </div>
      </div>
      <a
        href="https://aistudio.google.com/apikey"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[12px] text-terracotta-700 underline self-start"
      >
        <ExternalLink size={12} /> {t("gem_setup_link")}
      </a>
      <input
        type="password"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder={t("gem_key_placeholder")}
        className="px-4 py-3 rounded-xl border border-cream-300 bg-cream-100 text-ink-900 text-[14px] focus:outline-none focus:ring-2 focus:ring-terracotta-500/40"
        spellCheck={false}
        autoComplete="off"
      />
      <button
        onClick={onSave}
        disabled={!draft.trim()}
        className="px-4 py-3 rounded-xl bg-terracotta-500 text-cream-50 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-terracotta-600 transition"
      >
        {t("gem_save_key")}
      </button>
    </div>
  );
}

function SettingsView({
  showForgetKey,
  hasBuildTimeKey: builtIn,
  onForgetKey,
  onClearHistory,
  onBack
}: {
  showForgetKey: boolean;
  hasBuildTimeKey: boolean;
  onForgetKey: () => void;
  onClearHistory: () => void;
  onBack: () => void;
}) {
  const t = useT();
  return (
    <div className="px-5 py-5 overflow-y-auto flex-1 flex flex-col gap-3">
      <button
        onClick={onBack}
        className="self-start text-[12px] uppercase tracking-[0.16em] text-ink-700/70 hover:text-ink-900"
      >
        ← {t("gem_back")}
      </button>
      <button
        onClick={onClearHistory}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-cream-100 hover:bg-cream-200 transition text-ink-800 text-[13px]"
      >
        <Trash2 size={14} /> {t("gem_reset_history")}
      </button>
      {showForgetKey && (
        <button
          onClick={onForgetKey}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-cream-100 hover:bg-terracotta-500/10 hover:text-terracotta-700 transition text-ink-800 text-[13px]"
        >
          <Trash2 size={14} /> {t("gem_clear_key")}
        </button>
      )}
      {builtIn && (
        <div className="text-[11px] text-ink-700/60 leading-relaxed mt-2 px-1">
          {t("gem_builtin_key_note")}
        </div>
      )}
    </div>
  );
}

function ChatView({
  messages,
  status,
  error,
  text,
  setText,
  scrollRef,
  inputRef,
  onSend,
  onMicDown,
  onMicUp
}: {
  messages: Message[];
  status: ChatStatus;
  error: string | null;
  text: string;
  setText: (s: string) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSend: () => void;
  onMicDown: () => void;
  onMicUp: () => void;
}) {
  const t = useT();

  return (
    <>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-cream-100/40"
      >
        {messages.length === 0 && (
          <div className="text-[12.5px] italic text-ink-700/65 leading-relaxed self-center max-w-[280px] text-center pt-6">
            {t("gem_first_hint")}
          </div>
        )}
        {messages.map((m, i) => (
          <Bubble key={i} message={m} />
        ))}
        {error && (
          <div className="text-[12px] text-terracotta-700 bg-terracotta-500/10 border border-terracotta-500/25 rounded-lg px-3 py-2 leading-snug">
            {error}
          </div>
        )}
      </div>

      <StatusBar status={status} />

      <div className="px-3 py-3 border-t border-cream-300/70 bg-cream-50 flex items-center gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={t("gem_input_placeholder")}
          className="flex-1 min-w-0 px-3 py-2.5 rounded-full border border-cream-300 bg-cream-100 text-[14px] focus:outline-none focus:ring-2 focus:ring-terracotta-500/40"
          inputMode="text"
        />
        <button
          onClick={onSend}
          disabled={!text.trim()}
          aria-label={t("gem_send")}
          className="shrink-0 w-10 h-10 rounded-full bg-ink-900 text-cream-50 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ink-800 transition"
        >
          <Send size={16} />
        </button>
        <button
          onPointerDown={onMicDown}
          onPointerUp={onMicUp}
          onPointerCancel={onMicUp}
          onPointerLeave={status === "listening" ? onMicUp : undefined}
          aria-label={
            status === "listening" ? t("gem_mic_release") : t("gem_mic_hold")
          }
          title={status === "listening" ? t("gem_mic_release") : t("gem_mic_hold")}
          className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition select-none ${
            status === "listening"
              ? "bg-terracotta-500 text-cream-50 scale-110 shadow-lg shadow-terracotta-700/30"
              : "bg-olive-600 text-cream-50 hover:bg-olive-700"
          }`}
        >
          <Mic size={16} />
        </button>
      </div>
    </>
  );
}

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  // We treat "model bubble with no text yet" as the waiting state —
  // that's the moment between "user pressed send" and "first token
  // arrives". Show three bouncing dots so the bubble feels alive.
  // Once text starts arriving (streaming === true) we show the
  // text plus a blinking caret. When the turn completes the caret
  // disappears.
  const isWaiting = !isUser && message.streaming && !message.text;
  const isStreaming = !isUser && message.streaming && !!message.text;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? "bg-ink-900 text-cream-50 rounded-br-sm"
            : "bg-cream-50 text-ink-800 ring-1 ring-cream-300 rounded-bl-sm"
        }`}
      >
        {isWaiting ? (
          <TypingDots />
        ) : (
          <>
            {message.text}
            {isStreaming && <BlinkingCaret />}
          </>
        )}
      </div>
    </div>
  );
}

/** Three-dot typing indicator used while we wait for the first token. */
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1 px-0.5" aria-label="typing">
      <span className="w-1.5 h-1.5 rounded-full bg-ink-700/55 animate-typing-dot [animation-delay:-300ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-ink-700/55 animate-typing-dot [animation-delay:-150ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-ink-700/55 animate-typing-dot" />
    </span>
  );
}

/** Blinking text caret rendered at the tail of a streaming bubble. */
function BlinkingCaret() {
  return (
    <span
      aria-hidden
      className="inline-block w-[2px] h-[1em] -mb-[0.15em] ms-[1px] bg-ink-700 align-baseline animate-caret-blink"
    />
  );
}

function StatusBar({ status }: { status: ChatStatus }) {
  const t = useT();
  let label: string | null = null;
  let icon: React.ReactNode = null;

  switch (status) {
    case "connecting":
      label = t("gem_connecting");
      icon = <Loader2 size={12} className="animate-spin" />;
      break;
    case "listening":
      label = t("gem_listening");
      icon = <Mic size={12} className="text-terracotta-600" />;
      break;
    case "thinking":
      label = t("gem_thinking");
      icon = <Loader2 size={12} className="animate-spin" />;
      break;
    case "speaking":
      label = t("gem_thinking"); // same icon, just to show activity
      icon = <Sparkles size={12} className="text-terracotta-500" />;
      break;
    case "error":
      label = t("gem_error_generic");
      break;
    default:
      return null;
  }

  return (
    <div className="px-4 py-1.5 text-[11px] uppercase tracking-[0.14em] text-ink-700/65 bg-cream-100/70 border-t border-cream-300/40 flex items-center gap-1.5">
      {icon}
      <span>{label}</span>
    </div>
  );
}
