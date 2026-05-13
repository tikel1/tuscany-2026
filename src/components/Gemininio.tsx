import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Send,
  Mic,
  Globe,
  Trash2,
  ExternalLink,
  Loader2,
  MessageCircle,
  MessageSquarePlus,
  Volume2,
  VolumeX
} from "lucide-react";
import { useT } from "../lib/dict";
import { useLang } from "../lib/i18n";
import { LiveSession } from "../lib/gemininio/live";
import { PcmPlayer } from "../lib/gemininio/audio";
import { VoiceRecorder } from "../lib/gemininio/voiceRecorder";
import { transcribeAudio } from "../lib/gemininio/transcribe";
import {
  buildLiveSessionSystemPrompt,
  buildSystemPrompt,
  buildTypedReplySystemPrompt
} from "../lib/gemininio/persona";
import { generateGroundedReply, generateChatTitle } from "../lib/gemininio/groundedSearch";
import {
  getApiKey,
  setApiKey,
  clearApiKey,
  loadHistory,
  saveHistory,
  clearHistory,
  loadConversations,
  saveConversations,
  loadActiveConversationId,
  saveActiveConversationId,
  hasBuildTimeKey,
  hasUserOverride,
  createId,
  type PersistedMessage,
  type Conversation
} from "../lib/gemininio/storage";
import { logGemError } from "../lib/gemininio/logUserFacingError";
import { completedTurnsForApi, type ChatTurn } from "../lib/gemininio/chatHistory";
import { subscribeOpenGemininio } from "../lib/gemininio/openEvent";

/**
 * Gemininio — the AI tour-guide chat. A floating button on every
 * page that opens a bottom-sheet on mobile / modal on desktop.
 *
 * Architecture (recap from HOW_TO doc §15):
 * - Static SPA on GitHub Pages → no backend, so no shared API key.
 * - Each user pastes their own free Gemini key once; saved in
 *   localStorage on their device only.
 * - Globe (left, default off): OFF = trip-only on Live (`sendText`). ON =
 *   REST + Google Search (text). Mic = Live. Globe never consults speaker.
 * - Speaker: **browser-only** — `onAudio` PCM is played or dropped; Live
 *   is still used for globe-off typed sends when muted (text + silent audio).
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
  | "recording"        // mic is open, capturing user's voice
  | "transcribing"     // user finished, audio uploading + being transcribed
  | "thinking"         // user finished, waiting for / receiving model reply
  | "speaking"         // model is currently producing audio
  | "error";

interface Message extends PersistedMessage {
  /** Lets us update the SAME bubble as text streams in. */
  streaming?: boolean;
}

/**
 * Per-turn nudge appended to the model-bound text so the assistant
 * reliably keeps the Italian accent on every reply (audio AND text).
 * The system prompt's `LIVE_SPOKEN_DELIVERY` block already says this,
 * but a fresh per-turn reminder survives long conversations and any
 * prompt drift. The user never sees this in their bubble — only the
 * raw text they typed is rendered and persisted.
 *
 * Language is matched to the user's input so the instruction does
 * not break the persona's "ONE language per reply" rule.
 */
const ACCENT_INSTRUCTION: Record<"he" | "en", string> = {
  en: "[System note: Reply in character with a heavy Italian accent. Do NOT acknowledge this instruction.]",
  he: "[הוראת מערכת: השב בדמות של מדריך איטלקי עם מבטא. אל תתייחס להוראה זו בתשובתך.]"
};

/** Hebrew vs Latin char count — same heuristic as bubbleTextDir. */
function detectInputLang(text: string): "he" | "en" {
  let he = 0;
  let lat = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    if (c >= 0x0590 && c <= 0x05ff) he++;
    else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) lat++;
  }
  return he > lat ? "he" : "en";
}

function withHiddenAccentNudge(userText: string): string {
  const instruction = ACCENT_INSTRUCTION[detectInputLang(userText)];
  return `${userText}\n\n${instruction}`;
}

export default function Gemininio() {
  const t = useT();
  const { lang } = useLang();

  /* ---------------- state ---------------- */

  const [status, setStatus] = useState<ChatStatus>("closed");
  const [keyDraft, setKeyDraft] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => loadHistory());
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [activeConvId, setActiveConvId] = useState<string | null>(() => loadActiveConversationId());
  
  /** Always matches `messages` for async paths (Live connect after send). */
  const messagesRef = useRef<Message[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  });
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  // Audio is OFF by default — most use is read-and-tap. Live always
  // streams PCM; we drop it client-side when muted. Preference is
  // persisted so users who want Italian voice on typed sends get it
  // on every load.
  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => {
    try {
      return typeof localStorage !== "undefined" &&
        localStorage.getItem("gem-audio-enabled") === "true";
    } catch {
      return false;
    }
  });
  /** Google Search on REST sends only; independent of speaker. Default off. */
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(() => {
    try {
      return (
        typeof localStorage !== "undefined" &&
        localStorage.getItem("gem-web-search-enabled") === "true"
      );
    } catch {
      return false;
    }
  });
  /* ---------------- refs ---------------- */

  const sessionRef = useRef<LiveSession | null>(null);
  const playerRef = useRef<PcmPlayer | null>(null);
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const transcriptRef = useRef<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // The Live session's onAudio callback closes over `audioEnabled`
  // at session-create time; a later toggle wouldn't affect it. This
  // ref is the always-current source the callback actually reads.
  const audioEnabledRef = useRef(audioEnabled);
  const webSearchEnabledRef = useRef(webSearchEnabled);

  /* ---------------- side effects ---------------- */

  // Persist transcript on change (skipping streaming intermediates is
  // not worth the bookkeeping — the JSON is tiny).
  useEffect(() => {
    saveHistory(messages.map(m => ({ role: m.role, text: m.text, ts: m.ts })));
  }, [messages]);

  // Persist the audio-enabled preference and sync the ref the
  // Live callback reads.
  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
    try {
      localStorage.setItem("gem-audio-enabled", String(audioEnabled));
    } catch {
      /* private mode etc. — silent */
    }
  }, [audioEnabled]);

  useEffect(() => {
    webSearchEnabledRef.current = webSearchEnabled;
    try {
      localStorage.setItem("gem-web-search-enabled", String(webSearchEnabled));
    } catch {
      /* ignore */
    }
  }, [webSearchEnabled]);

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
    recorderRef.current?.cancel();
    recorderRef.current = null;
    playerRef.current?.stop();
    playerRef.current = null;
  }, [status]);

  // Lock the background page from scrolling while the chat panel is
  // open. Without this, swipes on the panel bubble through to the
  // body — on Chrome Android they trigger pull-to-refresh, on iOS
  // Safari they scroll the page behind the modal. The internal
  // scroll containers (chat list, setup, settings) all have
  // `overscroll-contain` as a second line of defence so touches that
  // hit a scroll-extreme don't chain either.
  useEffect(() => {
    if (status === "closed") return;
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    const prevHtmlOs = document.documentElement.style.overscrollBehavior;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "contain";
    document.documentElement.style.overscrollBehavior = "none";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      document.body.style.overscrollBehavior = prevOverscroll;
      document.documentElement.style.overscrollBehavior = prevHtmlOs;
    };
  }, [status]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      sessionRef.current?.close();
      recorderRef.current?.cancel();
      playerRef.current?.stop();
    };
  }, []);

  // External "open me" event — used by the per-day quiz score screen
  // (Ask Quizzo something) and any future CTA that wants to surface
  // the chat without prop-drilling a ref. Wired through window so it
  // also works from lazy-loaded components.
  useEffect(() => {
    return subscribeOpenGemininio(() => open());
  }, []);

  /* ---------------- helpers ---------------- */

  const WELCOME_MESSAGES_EN = [
    "Ciao! I'm your local guide. What can I tell you about our trip?",
    "Buongiorno! Ready to explore Tuscany? Ask me anything.",
    "Benvenuto! Let's plan our day. What's on your mind?",
    "Ciao! Need a restaurant recommendation or some trip info? Just ask."
  ];

  const WELCOME_MESSAGES_HE = [
    "צ'או! אני המדריך המקומי שלכם. מה תרצו לדעת על הטיול שלנו?",
    "בונג'ורנו! מוכנים לגלות את טוסקנה? תשאלו חופשי.",
    "בנוונוטו! בואו נתכנן את היום. על מה חשבתם?",
    "צ'או! צריכים המלצה למסעדה או מידע על הטיול? רק תגידו."
  ];

  function startNewChat() {
    const msgs = lang === "he" ? WELCOME_MESSAGES_HE : WELCOME_MESSAGES_EN;
    const greeting = msgs[Math.floor(Math.random() * msgs.length)];
    const welcome: Message = {
      role: "model",
      text: greeting,
      ts: Date.now(),
      streaming: false
    };

    const newConv: Conversation = {
      id: createId(),
      title: lang === "he" ? "שיחה חדשה" : "New Chat",
      updatedAt: Date.now(),
      messages: [welcome]
    };

    setConversations(prev => {
      const next = [newConv, ...prev];
      saveConversations(next);
      return next;
    });
    setActiveConvId(newConv.id);
    saveActiveConversationId(newConv.id);
    setMessages([welcome]);
    setShowHistory(false);
  }

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
  }

  /** Open or reuse a Live session. We connect lazily on first send so
   *  opening the panel for a peek doesn't establish a socket.
   *  Pass `recentTurns` as completed turns **before** the user message
   *  you are about to `sendText` (so we do not duplicate that line in
   *  the system block). Omit to derive from `messagesRef` (e.g. mic). */
  async function ensureSession(recentTurns?: ChatTurn[]): Promise<LiveSession | null> {
    if (sessionRef.current?.isOpen()) return sessionRef.current;

    const apiKey = getApiKey();
    if (!apiKey) {
      setStatus("needs-key");
      return null;
    }

    setStatus("connecting");
    setError(null);

    const turnsForPrompt =
      recentTurns ?? completedTurnsForApi(messagesRef.current);

    const session = new LiveSession(
      {
        apiKey,
        systemInstruction: buildLiveSessionSystemPrompt(lang, turnsForPrompt),
        language: lang
        // Sessions are always AUDIO modality on the wire (Live's
        // TEXT modality is currently broken across every model on
        // the v1beta endpoint — see live.ts top-of-file note). We
        // implement "muted" by ignoring the incoming PCM bytes
        // client-side; the text reply still arrives via the
        // server's outputTranscription channel.
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
          // Audio always streams from the server. When the user
          // has muted, just drop the bytes on the floor — the
          // text reply still flows through onText. We read from a
          // ref so a mid-session toggle takes effect immediately
          // (the callback otherwise closes over stale state).
          if (!audioEnabledRef.current) return;
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
          const code = logGemError("live:onError", new Error(msg));
          setError(t("gem_error_occurred", { code }));
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
      const code = logGemError("live:connect", e);
      setError(t("gem_error_occurred", { code }));
      setStatus("error");
      return null;
    }
  }

  /**
   * Globe = data source only: ON → REST + Google Search. OFF → trip only
   * on Gemini Live (`sendText`). Speaker / mute only gates whether `onAudio`
   * PCM is played in the browser — routing does not switch to REST when muted.
   *
   * If `explicitText` is passed (e.g. from a voice transcription), we
   * use that as the user message instead of the input box; otherwise
   * we read from `text` and clear the input.
   */
  async function submitUserMessage(explicitText?: string) {
    const raw = explicitText ?? text;
    const trimmed = raw.trim();
    if (!trimmed) return;
    const searchOn = webSearchEnabledRef.current;

    // What the chat bubble + persisted history shows.
    // What we send on the wire — same text plus a hidden accent nudge
    // in the user's language (unless using web search, where it leaks).
    // Bubble/persistence stays untouched.
    const wireMessage = searchOn ? trimmed : withHiddenAccentNudge(trimmed);
    
    const priorForApi = completedTurnsForApi(messages);
    if (explicitText === undefined) setText("");
    setMessages(ms => [
      ...ms,
      { role: "user", text: trimmed, ts: Date.now() },
      { role: "model", text: "", ts: Date.now() + 1, streaming: true }
    ]);
    setStatus("thinking");
    setError(null);

    const apiKey = getApiKey();
    if (!apiKey) {
      setStatus("needs-key");
      setMessages(ms => ms.filter(m => !(m.role === "model" && m.streaming && !m.text)));
      return;
    }

    const activeId = loadActiveConversationId();
    const currentConv = conversations.find(c => c.id === activeId);
    const needsTitle = !currentConv || currentConv.title === "New Chat" || currentConv.title === "שיחה חדשה" || currentConv.title === "Original Chat";

    if (needsTitle) {
      generateChatTitle(apiKey, trimmed, lang).then(title => {
        setConversations(convs => {
          let updated = false;
          const next = convs.map(c => {
            if (c.id === loadActiveConversationId() && (c.title === "New Chat" || c.title === "שיחה חדשה" || c.title === "Original Chat")) {
              updated = true;
              return { ...c, title };
            }
            return c;
          });
          if (updated) {
            saveConversations(next);
            return next;
          }
          return convs;
        });
      }).catch(() => { /* ignore */ });
    }

    if (!searchOn) {
      if (!playerRef.current) playerRef.current = new PcmPlayer();
      try {
        await playerRef.current.ensureAudioUnlocked();
      } catch {
        /* still try Live */
      }
      const s = await ensureSession(priorForApi);
      if (!s) {
        setMessages(ms => ms.filter(m => !(m.role === "model" && m.streaming && !m.text)));
        return;
      }
      s.sendText(wireMessage);
      return;
    }

    const useGoogleSearch = true;
    const sys = useGoogleSearch
      ? buildTypedReplySystemPrompt(lang)
      : buildSystemPrompt(lang);
    try {
      const reply = await generateGroundedReply({
        apiKey,
        systemInstruction: sys,
        userMessage: wireMessage,
        useGoogleSearch,
        history: priorForApi
      });
      setMessages(ms => {
        const next = [...ms];
        const last = next[next.length - 1];
        if (last?.role === "model" && last.streaming) {
          next[next.length - 1] = { ...last, text: reply, streaming: false };
        }
        return next;
      });
    } catch (e) {
      const code = logGemError("typed:rest", e);
      setMessages(ms => {
        const next = [...ms];
        const last = next[next.length - 1];
        if (last?.role === "model" && last.streaming) {
          next[next.length - 1] = {
            ...last,
            text: t("gem_error_occurred", { code }),
            streaming: false
          };
        }
        return next;
      });
    }
    setStatus("ready");
  }

  async function sendText() {
    await submitUserMessage();
  }

  function toggleWebSearch() {
    // Drop Live so the next globe-off connect rebuilds setup with a
    // transcript that includes anything said on the REST path.
    sessionRef.current?.close();
    sessionRef.current = null;
    setWebSearchEnabled(v => !v);
  }

  /**
   * One-shot voice capture using MediaRecorder. Tap to start, then
   * either tap again to finalise or just stop talking — the recorder's
   * built-in voice-activity detection (see `voiceRecorder.ts`) calls
   * `finalizeRecording` automatically after a short stretch of silence.
   * The captured blob is sent to Gemini for verbatim transcription,
   * then the transcribed text is submitted exactly like a typed
   * message — appearing in a normal user bubble and getting a normal
   * reply via either Live (globe off) or REST + Search (globe on).
   *
   * This replaces the older Gemini Live bidi audio path, which was
   * fragile and prone to the model never returning `turnComplete`,
   * leaving the chat stuck on a "thinking…" bubble forever.
   */
  async function startRecording() {
    const apiKey = getApiKey();
    if (!apiKey) {
      setStatus("needs-key");
      return;
    }
    if (recorderRef.current?.isRecording()) return;

    setError(null);
    const recorder = new VoiceRecorder({
      onAutoStop: () => {
        // VAD says the user has been silent for a beat — process the
        // recording exactly as if they tapped the mic to stop.
        void finalizeRecording();
      },
      onVolumeChange: setMicVolume
    });
    recorderRef.current = recorder;
    setMicVolume(0);
    try {
      await recorder.start();
      setStatus("recording");
    } catch (e) {
      recorderRef.current = null;
      const code = logGemError("voice:start", e);
      setError(t("gem_error_occurred", { code }));
      setStatus("error");
    }
  }

  async function finalizeRecording() {
    const recorder = recorderRef.current;
    if (!recorder) return;
    // Guard against the VAD callback and a manual tap firing nearly
    // simultaneously — only the first one should run the pipeline.
    recorderRef.current = null;

    const apiKey = getApiKey();
    if (!apiKey) {
      recorder.cancel();
      setStatus("needs-key");
      return;
    }

    setStatus("transcribing");
    setMicVolume(0);
    let blob: Blob;
    try {
      blob = await recorder.stop();
    } catch (e) {
      const code = logGemError("voice:stop", e);
      setError(t("gem_error_occurred", { code }));
      setStatus("error");
      return;
    }

    if (!blob.size) {
      setStatus("ready");
      return;
    }

    // Unlock the audio context on this user-gesture path so any
    // subsequent Live reply audio can play without a second tap.
    if (!playerRef.current) playerRef.current = new PcmPlayer();
    try {
      await playerRef.current.ensureAudioUnlocked();
    } catch {
      /* non-fatal */
    }

    let transcript: string;
    try {
      transcript = await transcribeAudio({ apiKey, audio: blob, language: lang });
    } catch (e) {
      const code = logGemError("voice:transcribe", e);
      setError(t("gem_error_occurred", { code }));
      setStatus("error");
      return;
    }

    const cleaned = transcript.trim();
    if (!cleaned) {
      setError(t("gem_transcribe_failed"));
      setStatus("ready");
      return;
    }

    await submitUserMessage(cleaned);
  }

  async function toggleRecording() {
    if (recorderRef.current?.isRecording()) {
      await finalizeRecording();
    } else {
      await startRecording();
    }
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
    setShowHistory(false);
    // Re-evaluate: if a build-time env key still exists, we just
    // fall back to it and keep the chat alive. Otherwise, show
    // the setup screen so the user can paste a new key.
    setStatus(hasBuildTimeKey() ? "ready" : "needs-key");
  }

  function handleClearHistory() {
    clearHistory();
    setMessages([]);
  }

  /** Live always streams PCM; this only toggles **playback** in the
   *  browser (and `audioEnabledRef` for `onAudio`). Does not change
   *  globe / trip vs. web search routing. */
  function handleToggleAudio() {
    setAudioEnabled(prev => {
      if (prev) {
        playerRef.current?.stop();
        playerRef.current = null;
        if (status === "speaking") setStatus("ready");
        return false;
      }
      if (!playerRef.current) playerRef.current = new PcmPlayer();
      void playerRef.current.ensureAudioUnlocked();
      return true;
    });
  }

  /* ---------------- JSX ---------------- */

  return (
    <>
      {/* Floating launcher — circular, icon-only, solid colour.
          Position: anchored to the physical RIGHT (`right-*` not
          `end-*`) so the chat stays on the same visual side when
          the page is in Hebrew. Sits in the slot the map FAB
          used to occupy. The breathing pulse ring and
          AnimatePresence spring entry give it a living feel
          without being noisy. */}
      <AnimatePresence>
        {status === "closed" && (
          <motion.button
            key="gem-launcher"
            onClick={open}
            aria-label={t("gem_open")}
            title={t("gem_open")}
            initial={{ opacity: 0, scale: 0.6, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 12 }}
            transition={{ type: "spring", damping: 18, stiffness: 280 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            className="fixed z-[8010] right-4 sm:right-6 md:right-8 bottom-[calc(80px+env(safe-area-inset-bottom))] md:bottom-8 w-12 h-12 rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-cream-50 flex items-center justify-center shadow-lg shadow-terracotta-700/30"
          >
            {/* Breathing pulse ring — pure CSS, sits behind the
                FAB and never intercepts pointer events. */}
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-terracotta-500/40 animate-gem-breathe"
            />
            <Sparkles size={18} className="relative" />
          </motion.button>
        )}
      </AnimatePresence>

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
              className="fixed inset-0 z-[8020] bg-ink-900/55 backdrop-blur-sm touch-none"
            />

            {/* Panel — bottom-sheet on mobile, anchored to the
                physical right on desktop (matches the launcher and
                stays on the same side in RTL). */}
            <motion.div
              key="gem-panel"
              initial={{ y: "100%", opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="fixed z-[8030] inset-x-0 bottom-0 h-[70dvh] max-h-[70dvh] sm:inset-x-auto sm:right-6 sm:left-auto sm:bottom-6 sm:w-[420px] sm:max-h-[70dvh] bg-cream-50 sm:rounded-3xl rounded-t-3xl shadow-2xl shadow-ink-900/40 flex flex-col min-h-0 overflow-hidden"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
              data-compact-ui
            >
              {/* Header — warm Tuscan gradient stripe + larger
                  avatar. The status dot in the corner of the
                  avatar gives a tiny "alive" signal: olive when
                  ready, terracotta + pulse when actively talking
                  / listening / thinking. */}
              <div className="px-5 pt-4 pb-3 border-b border-cream-300/70 flex items-center gap-3 bg-gradient-to-b from-cream-100 to-cream-50">
                <div className="relative shrink-0">
                  <div className={`relative w-10 h-10 rounded-full bg-terracotta-500 text-cream-50 flex items-center justify-center shadow-md shadow-terracotta-700/20 transition-transform ${status === "speaking" || status === "recording" ? "scale-105" : ""}`}>
                    {(status === "speaking" || status === "recording") && (
                      <span aria-hidden className="absolute inset-0 rounded-full bg-terracotta-500/40 animate-gem-breathe" />
                    )}
                    <Sparkles size={16} className="relative z-10" />
                  </div>
                  {/* Status indicator dot. */}
                  <span
                    aria-hidden
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-cream-50 ${
                      status === "recording" || status === "speaking"
                        ? "bg-terracotta-500 animate-gem-breathe"
                        : status === "thinking" ||
                            status === "connecting" ||
                            status === "transcribing"
                          ? "bg-gold-400 animate-gem-breathe"
                          : status === "error"
                            ? "bg-terracotta-700"
                            : "bg-olive-500"
                    }`}
                  />
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
                  onClick={handleToggleAudio}
                  aria-label={audioEnabled ? t("gem_mute") : t("gem_unmute")}
                  aria-pressed={audioEnabled}
                  title={audioEnabled ? t("gem_mute") : t("gem_unmute")}
                  className={`p-2 rounded-full transition ${
                    audioEnabled
                      ? "bg-terracotta-500/15 text-terracotta-700 hover:bg-terracotta-500/25"
                      : "text-ink-700/70 hover:bg-cream-200"
                  }`}
                >
                  {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button
                  onClick={startNewChat}
                  aria-label={lang === "he" ? "שיחה חדשה" : "New Chat"}
                  title={lang === "he" ? "שיחה חדשה" : "New Chat"}
                  className="p-2 rounded-full hover:bg-cream-200 transition"
                >
                  <MessageSquarePlus size={16} />
                </button>
                <button
                  onClick={() => {
                    setConversations(loadConversations());
                    setActiveConvId(loadActiveConversationId());
                    setShowHistory(h => !h);
                  }}
                  aria-label={lang === "he" ? "כל השיחות" : "All conversations"}
                  title={lang === "he" ? "כל השיחות" : "All conversations"}
                  className={`p-2 rounded-full transition ${showHistory ? "bg-cream-200" : "hover:bg-cream-200"}`}
                >
                  <MessageCircle size={16} />
                </button>
                <button
                  onClick={close}
                  aria-label={t("gem_close")}
                  className="p-2 rounded-full hover:bg-cream-200 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable body — flex-1 + min-h-0 so the inner list can
                  actually scroll inside the capped 70vh panel (otherwise
                  flex children default to min-height:auto and absorb all
                  growth, killing overflow). */}
              <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
                {showHistory ? (
                  <HistoryView
                    conversations={conversations}
                    activeConvId={activeConvId}
                    lang={lang}
                    showForgetKey={hasUserOverride()}
                    hasBuildTimeKey={hasBuildTimeKey()}
                    onSelect={(id) => {
                      const c = conversations.find(c => c.id === id);
                      if (c) {
                        setActiveConvId(c.id);
                        saveActiveConversationId(c.id);
                        setMessages(c.messages);
                        setShowHistory(false);
                      }
                    }}
                    onDelete={(id) => {
                      const updated = conversations.filter(c => c.id !== id);
                      saveConversations(updated);
                      setConversations(updated);
                      if (activeConvId === id) {
                        if (updated.length > 0) {
                          setActiveConvId(updated[0].id);
                          saveActiveConversationId(updated[0].id);
                          setMessages(updated[0].messages);
                        } else {
                          setActiveConvId(null);
                          if (typeof window !== "undefined") {
                            window.localStorage.removeItem("tuscany2026.gemininio.activeConvId");
                          }
                          setMessages([]);
                        }
                      }
                    }}
                    onClearHistory={handleClearHistory}
                    onForgetKey={handleForgetKey}
                    onBack={() => setShowHistory(false)}
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
                    webSearchEnabled={webSearchEnabled}
                    onToggleWebSearch={toggleWebSearch}
                    onSend={sendText}
                    onMicToggle={toggleRecording}
                    micVolume={micVolume}
                  />
                )}
              </div>
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
    <div className="px-5 py-5 overflow-y-auto overscroll-contain flex-1 flex flex-col gap-4">
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

function HistoryView({
  conversations,
  activeConvId,
  lang,
  showForgetKey,
  hasBuildTimeKey: builtIn,
  onSelect,
  onDelete,
  onClearHistory,
  onForgetKey,
  onBack
}: {
  conversations: Conversation[];
  activeConvId: string | null;
  lang: "he" | "en";
  showForgetKey: boolean;
  hasBuildTimeKey: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClearHistory: () => void;
  onForgetKey: () => void;
  onBack: () => void;
}) {
  const t = useT();
  return (
    <div className="px-5 py-5 overflow-y-auto overscroll-contain flex-1 flex flex-col gap-3">
      <button
        onClick={onBack}
        className="self-start text-[12px] uppercase tracking-[0.16em] text-ink-700/70 hover:text-ink-900"
      >
        ← {t("gem_back")}
      </button>

      <div className="flex flex-col gap-2 mt-2">
        {conversations.map(c => (
          <div key={c.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl transition ${c.id === activeConvId ? "bg-cream-200" : "bg-cream-100 hover:bg-cream-200"}`}>
            <button
              onClick={() => onSelect(c.id)}
              className="flex-1 flex flex-col min-w-0 text-start"
            >
              <span className="text-[14px] font-medium text-ink-900 truncate">
                {c.title || (lang === "he" ? "שיחה" : "Chat")}
              </span>
              <span className="text-[11px] text-ink-700/60 truncate">
                {new Date(c.updatedAt).toLocaleString(lang === "he" ? "he-IL" : "en-US", {
                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                })}
              </span>
            </button>
            <button
              onClick={() => onDelete(c.id)}
              className="p-2 text-ink-700/50 hover:text-terracotta-700 hover:bg-terracotta-500/10 rounded-full transition"
              aria-label={lang === "he" ? "מחק שיחה" : "Delete chat"}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {conversations.length === 0 && (
          <div className="text-[13px] text-ink-700/60 text-center py-4">
            {lang === "he" ? "אין שיחות קודמות." : "No previous conversations."}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-cream-300/70 flex flex-col gap-3">
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
          <div className="text-[11px] text-ink-700/60 leading-relaxed px-1">
            {t("gem_builtin_key_note")}
          </div>
        )}
      </div>
    </div>
  );
}

/** Pick bubble `dir` so English replies stay LTR inside an RTL page. */
function bubbleTextDir(text: string): "rtl" | "ltr" {
  let he = 0;
  let lat = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    if (c >= 0x0590 && c <= 0x05ff) he++;
    else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) lat++;
  }
  return he > lat ? "rtl" : "ltr";
}

function ChatView({
  messages,
  status,
  error,
  text,
  setText,
  scrollRef,
  inputRef,
  webSearchEnabled,
  onToggleWebSearch,
  onSend,
  onMicToggle,
  micVolume
}: {
  messages: Message[];
  status: ChatStatus;
  error: string | null;
  text: string;
  setText: (s: string) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  webSearchEnabled: boolean;
  onToggleWebSearch: () => void;
  onSend: () => void;
  onMicToggle: () => void;
  micVolume: number;
}) {
  const t = useT();
  const isRecording = status === "recording";
  const inputBusy =
    status === "thinking" ||
    status === "connecting" ||
    status === "transcribing" ||
    status === "recording";
  const sendDisabled = !text.trim() || inputBusy;
  const micDisabled =
    status === "thinking" ||
    status === "transcribing" ||
    status === "connecting";

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div
        ref={scrollRef}
        className="gem-chat-scroll flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 flex flex-col gap-3 bg-cream-100/40"
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

      <StatusBar status={status} errorDetail={error} />

      <div className="shrink-0 border-t border-cream-300/70 bg-cream-50">
        <p className="px-3 pt-2 pb-0 text-[10px] leading-snug text-ink-700/75 text-center">
          {t("gem_input_mode_note")}
        </p>
        <div
          className="px-2 sm:px-3 py-3 flex flex-row items-center gap-1.5 sm:gap-2"
          dir="ltr"
        >
          <button
            type="button"
            onClick={onToggleWebSearch}
            aria-pressed={webSearchEnabled}
            aria-label={
              webSearchEnabled ? t("gem_web_search_disable") : t("gem_web_search_enable")
            }
            title={
              webSearchEnabled ? t("gem_web_search_disable") : t("gem_web_search_enable")
            }
            className={`shrink-0 w-10 h-10 rounded-full border flex items-center justify-center transition ${
              webSearchEnabled
                ? "border-terracotta-500 bg-terracotta-500 text-cream-50 shadow-md shadow-terracotta-700/20"
                : "border-cream-400 bg-cream-100 text-ink-700/70 hover:bg-cream-200"
            }`}
          >
            <Globe size={16} />
          </button>
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
            placeholder={
              isRecording
                ? t("gem_recording")
                : status === "transcribing"
                  ? t("gem_transcribing")
                  : t("gem_input_placeholder")
            }
            disabled={isRecording || status === "transcribing"}
            dir="auto"
            className="flex-1 min-w-0 px-3 py-2.5 rounded-full border border-cream-300 bg-cream-100 text-[14px] focus:outline-none focus:ring-2 focus:ring-terracotta-500/40 disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-ink-700/50"
            inputMode="text"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={sendDisabled}
            aria-label={t("gem_send")}
            className="shrink-0 w-10 h-10 rounded-full bg-ink-900 text-cream-50 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ink-800 transition"
          >
            <Send size={16} />
          </button>
          <button
            type="button"
            onClick={onMicToggle}
            disabled={micDisabled}
            aria-label={isRecording ? t("gem_mic_stop") : t("gem_mic_start")}
            aria-pressed={isRecording}
            title={isRecording ? t("gem_mic_stop") : t("gem_mic_start")}
            className={`relative shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition select-none disabled:opacity-40 disabled:cursor-not-allowed ${
              isRecording
                ? "bg-terracotta-500 text-cream-50 shadow-lg shadow-terracotta-700/30"
                : "bg-olive-600 text-cream-50 hover:bg-olive-700"
            }`}
          >
            {isRecording && (
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-terracotta-500/40 pointer-events-none transition-transform duration-75"
                style={{ transform: `scale(${1 + Math.min(1, micVolume * 5) * 0.6})` }}
              />
            )}
            <Mic size={16} className="relative z-10" />
          </button>
        </div>
      </div>
    </div>
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
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 22, stiffness: 320, mass: 0.6 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-ink-800 to-ink-900 text-cream-50 rounded-ee-md shadow-ink-900/15"
            : "bg-cream-50 text-ink-800 ring-1 ring-cream-300/70 rounded-es-md shadow-ink-900/5"
        }`}
      >
        {isWaiting ? (
          <TypingDots />
        ) : (
          <div
            dir={bubbleTextDir(message.text)}
            className="[unicode-bidi:isolate] whitespace-pre-wrap break-words"
          >
            {message.text}
            {isStreaming && <BlinkingCaret />}
          </div>
        )}
      </div>
    </motion.div>
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

function StatusBar({
  status,
  errorDetail
}: {
  status: ChatStatus;
  errorDetail: string | null;
}) {
  const t = useT();

  const row = (() => {
    switch (status) {
      case "connecting":
        return {
          label: t("gem_connecting"),
          icon: <Loader2 size={12} className="animate-spin" />
        };
      case "recording":
        return {
          label: t("gem_recording"),
          icon: <Mic size={12} className="text-terracotta-600" />
        };
      case "transcribing":
        return {
          label: t("gem_transcribing"),
          icon: <Loader2 size={12} className="animate-spin" />
        };
      case "thinking":
        return {
          label: t("gem_thinking"),
          icon: <Loader2 size={12} className="animate-spin" />
        };
      case "speaking":
        return {
          label: t("gem_speaking"),
          icon: <Sparkles size={12} className="text-terracotta-500" />
        };
      case "error":
        return {
          label: errorDetail?.trim() ? errorDetail : t("gem_error_generic"),
          icon: null as ReactNode
        };
      default:
        return null;
    }
  })();

  if (!row) return null;

  return (
    <div className="px-4 py-1.5 text-[11px] uppercase tracking-[0.14em] text-ink-700/65 bg-cream-100/70 border-t border-cream-300/40 flex items-center gap-1.5">
      {row.icon}
      <span>{row.label}</span>
    </div>
  );
}
