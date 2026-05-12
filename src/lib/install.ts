import { useEffect, useRef, useState } from "react";

import { takeDeferredInstallPrompt } from "./installBootstrap";

/* =====================================================================
 * Add-to-Home-Screen (A2HS) plumbing
 * ---------------------------------------------------------------------
 * The browser story is split clean down the middle:
 *
 *  - Android Chrome / Edge / desktop Chrome:
 *      Fires `beforeinstallprompt`. We capture the event, suppress the
 *      default mini-infobar, and re-fire it from our own button so the
 *      install dialog is one tap away inside our prompt.
 *
 *  - iOS Safari:
 *      No install API at all. Apple insists the user goes through the
 *      Share sheet → "Add to Home Screen". We can't trigger anything;
 *      the best we can do is show illustrated steps.
 *
 *  - iOS Chrome / Firefox / Edge:
 *      A2HS is gated to Safari on iOS. We tell the user to switch.
 *
 * Plus a respectful "don't show again" + soft-snooze stored in
 * localStorage so the popup isn't a nag.
 * ===================================================================== */

export type Platform =
  | "ios-safari"
  | "ios-other"
  | "android"
  | "desktop-chromium"
  | "other";

export type IOSDevice = "iphone" | "ipad";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

/* ---------- Platform detection ---------- */

function ua(): string {
  if (typeof navigator === "undefined") return "";
  return navigator.userAgent || "";
}

/** True for both classic iPhone/iPad UAs and iPadOS 13+ (which lies and
 *  reports Mac, but exposes touch points). */
function isIOS(): boolean {
  const u = ua();
  if (/iPad|iPhone|iPod/.test(u)) return true;
  // iPadOS 13+ desktop-class UA
  return /Macintosh/.test(u) && typeof navigator !== "undefined" && navigator.maxTouchPoints > 1;
}

export function detectIOSDevice(): IOSDevice {
  const u = ua();
  if (/iPhone|iPod/.test(u)) return "iphone";
  if (/iPad/.test(u)) return "ipad";
  // iPadOS-as-Mac case
  if (/Macintosh/.test(u) && typeof navigator !== "undefined" && navigator.maxTouchPoints > 1) {
    return "ipad";
  }
  return "iphone";
}

function isIOSNonSafari(): boolean {
  // Chrome (CriOS), Firefox (FxiOS), Edge (EdgiOS), Brave/Opera variants on iOS
  return /CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser/.test(ua());
}

function isAndroid(): boolean {
  return /Android/.test(ua());
}

export function detectPlatform(): Platform {
  if (isIOS()) return isIOSNonSafari() ? "ios-other" : "ios-safari";
  if (isAndroid()) return "android";
  // Desktop Chromium can also receive beforeinstallprompt; we treat it as
  // its own bucket so we don't pester desktop users by default.
  if (typeof navigator !== "undefined" && /Chrome|Edg|OPR/.test(ua())) {
    return "desktop-chromium";
  }
  return "other";
}

/* ---------- "Already installed" detection ---------- */

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  // iOS legacy flag
  const navAny = navigator as Navigator & { standalone?: boolean };
  return navAny.standalone === true;
}

/* ---------- Mobile-only gate ---------- */

/** Maximum viewport width (CSS pixels) that we treat as "mobile" for
 *  the install prompt. Phone landscape goes up to ~932px (iPhone 14
 *  Pro Max in landscape); 1024px gives us comfortable headroom while
 *  still blocking every common desktop window. */
const MOBILE_MAX_VIEWPORT = 1024;

/** Hard viewport gate. The user explicitly doesn't want this prompt on
 *  desktop — and the cleanest signal for "is this a desktop browser"
 *  is the actual window width, not UA strings or touch capability
 *  (both of which lie on hybrid laptops, IDE preview panes, etc.). */
export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < MOBILE_MAX_VIEWPORT;
}

/** Belt-and-suspenders mobile check, on top of UA-based platform
 *  detection. We only ever want this prompt on a phone or small
 *  tablet — not on a desktop Chrome that happens to share the same
 *  Chromium engine, or on a touchscreen monitor.
 *
 *  Three checks combined: phone-sized viewport AND coarse primary
 *  pointer (= touch-driven UI) AND actual touch capability. The
 *  viewport gate is the dominant one — a Windows touch laptop with a
 *  1920px-wide screen has all the touch APIs but is still a desktop. */
export function isLikelyMobile(): boolean {
  if (typeof window === "undefined") return false;
  if (!isMobileViewport()) return false;

  const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const hasTouch =
    (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) ||
    "ontouchstart" in window;

  return coarsePointer && hasTouch;
}

/* ---------- Persistence ---------- */

/** Bump (`v2`) resets soft-snooze / "don't show again" once after install UX fixes. */
const STORAGE_KEY = "tuscany:a2hs-prefs:v2";
/** How long a "Maybe later" tap suppresses the popup. Long enough that the
 *  user isn't pestered, short enough that they'll see it again on a future
 *  visit (e.g. a week before the trip). */
const SOFT_DISMISS_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

interface Prefs {
  /** Set when the user ticks "Don't show this again". */
  neverShow?: boolean;
  /** Unix-ms when the user soft-dismissed ("Maybe later" / X). */
  dismissedAt?: number;
}

function readPrefs(): Prefs {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as Prefs;
    return {};
  } catch {
    return {};
  }
}

function writePrefs(p: Prefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* storage may be full / blocked — fail quietly */
  }
}

function isSnoozed(p: Prefs): boolean {
  if (p.neverShow) return true;
  if (typeof p.dismissedAt === "number" && Date.now() - p.dismissedAt < SOFT_DISMISS_MS) {
    return true;
  }
  return false;
}

/* ---------- Manual / imperative trigger ----------
 *
 * The auto-open path in `useInstallPrompt` respects a "Don't show
 * again" preference and a 14-day soft snooze. But sometimes the user
 * wants to install AFTER they've dismissed (e.g. they tapped "Maybe
 * later", then changed their mind two weeks before the trip and went
 * looking for it in a menu).
 *
 * This event-bus pattern lets any component anywhere in the tree
 * say "open the prompt now" without the install hook having to be
 * lifted into a context. The hook listens for the event below and
 * sets `open = true` directly, bypassing the snooze gate but still
 * honouring the safety check that we're not already in standalone
 * mode (i.e. already installed).
 */
const FORCE_OPEN_EVENT = "tuscany:a2hs:force-open";

/** Imperatively open the install prompt from anywhere in the app
 *  (e.g. a "Install app" link in the More menu). Bypasses the soft
 *  snooze and "don't show again" preferences, but still respects
 *  the standalone-mode safety gate (no point offering install when
 *  the app already runs as a standalone PWA). */
export function triggerInstallPrompt(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(FORCE_OPEN_EVENT));
}

/** True if the current platform has a meaningful install path we can
 *  actually offer through the prompt. Used to decide whether to show
 *  a manual "Install app" entry in menus. */
export function canShowInstallOption(): boolean {
  if (typeof window === "undefined") return false;
  if (isStandalone()) return false;
  const p = detectPlatform();
  return p === "ios-safari" || p === "ios-other" || p === "android";
}

/* ---------- The hook ---------- */

export interface InstallPromptApi {
  /** Should we render the prompt right now? */
  open: boolean;
  /** Detected platform — drives which copy / steps to render. */
  platform: Platform;
  /** Specific iOS device, for tailored Share-icon copy. Only meaningful
   *  when `platform` is "ios-safari" or "ios-other". */
  iosDevice: IOSDevice;
  /** True iff Android Chrome handed us a real `beforeinstallprompt` event
   *  (i.e. we can trigger an in-page install dialog). */
  canNativeInstall: boolean;
  /** Fires the captured native install dialog. Resolves to the outcome,
   *  or `null` if no native event was available. */
  install: () => Promise<"accepted" | "dismissed" | null>;
  /** Soft dismiss — won't ask again for ~2 weeks. */
  dismiss: () => void;
  /** Hard dismiss — won't ask again on this device, ever (until user
   *  clears storage). */
  dismissForever: () => void;
}

interface Options {
  /** Delay before opening, so the popup doesn't trample the first paint.
   *  Defaults to 6000ms — enough time to see the hero + scroll a bit. */
  openDelayMs?: number;
}

export function useInstallPrompt(opts: Options = {}): InstallPromptApi {
  const { openDelayMs = 6000 } = opts;

  const [open, setOpen] = useState(false);
  const [platform] = useState<Platform>(() => detectPlatform());
  const [iosDevice] = useState<IOSDevice>(() => detectIOSDevice());
  const [canNativeInstall, setCanNativeInstall] = useState(false);
  const bipRef = useRef<BeforeInstallPromptEvent | null>(null);

  /* Capture beforeinstallprompt as early as possible. Chrome can fire it
   * before our component mounts, so we also accept that the listener may
   * never fire during this session. */
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Event may have fired before React mounted (`installBootstrap.ts`).
    const queued = takeDeferredInstallPrompt();
    if (queued) {
      bipRef.current = queued;
      queueMicrotask(() => setCanNativeInstall(true));
    }

    const onBip = (e: Event) => {
      e.preventDefault(); // suppress Chrome's mini-infobar
      bipRef.current = e as BeforeInstallPromptEvent;
      setCanNativeInstall(true);
    };
    const onInstalled = () => {
      // App was installed — close the popup and persist a "never" so we
      // don't ask again on this device.
      bipRef.current = null;
      setCanNativeInstall(false);
      setOpen(false);
      writePrefs({ ...readPrefs(), neverShow: true });
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  /* Decide whether to open. We wait a beat so the user sees content before
   * being interrupted, and we re-check standalone in case they install
   * during the delay. */
  useEffect(() => {
    if (typeof window === "undefined") return;

    // PRIMARY GATE: viewport width. The user explicitly doesn't want this
    // prompt on desktop, and the most reliable "am I a desktop" signal is
    // the actual window size — not UA strings, not touch capability. This
    // catches Cursor / Electron preview panes, Windows touch laptops,
    // touchscreen desktop monitors, "Request desktop site" mode, and any
    // other edge case that lies about being mobile.
    if (!isMobileViewport()) return;

    // Skip outright if we have nothing useful to say.
    if (platform === "other") return;
    // Mobile-only by design — this app lives on the phone in the user's
    // pocket. Desktop Chromium *can* receive `beforeinstallprompt`, but
    // we deliberately don't surface the install offer there.
    if (platform === "desktop-chromium") return;
    const uaTrustedMobilePhone =
      platform === "android" || platform === "ios-safari" || platform === "ios-other";
    // Mainstream phone/tablet OS from UA gets the popup on narrow viewports even
    // when `(pointer: coarse)` lies (Samsung DeX, some in-app browsers, emulators).
    if (!uaTrustedMobilePhone && !isLikelyMobile()) return;
    if (isStandalone()) return;
    if (isSnoozed(readPrefs())) return;

    const id = window.setTimeout(() => {
      // Re-check at fire time — a lot can happen in 6 seconds.
      if (!isMobileViewport()) return;
      if (isStandalone()) return;
      if (isSnoozed(readPrefs())) return;
      if (!uaTrustedMobilePhone && !isLikelyMobile()) return;
      setOpen(true);
    }, openDelayMs);

    return () => window.clearTimeout(id);
  }, [platform, openDelayMs]);

  /* If the user widens the window past the mobile threshold while the
   * prompt is open (or scheduled), close it. The prompt is mobile-only
   * by contract; resizing into desktop territory should make it vanish
   * the same way it would if you'd loaded the page that wide to start. */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onResize = () => {
      if (!isMobileViewport()) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* Listen for manual "open the prompt now" events from the More menu
   * (or anywhere else in the app). Bypasses snooze / never-show prefs
   * — if the user explicitly tapped "Install app", they want to see it
   * regardless of past dismissals — but still honours the standalone
   * gate so we don't ask people to install something they're already
   * running. */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onForce = () => {
      if (isStandalone()) return;
      setOpen(true);
    };
    window.addEventListener(FORCE_OPEN_EVENT, onForce);
    return () => window.removeEventListener(FORCE_OPEN_EVENT, onForce);
  }, []);

  const install: InstallPromptApi["install"] = async () => {
    const evt = bipRef.current;
    if (!evt) return null;
    try {
      await evt.prompt();
      const choice = await evt.userChoice;
      // The spec says the event is single-use.
      bipRef.current = null;
      setCanNativeInstall(false);
      if (choice.outcome === "accepted") {
        // `appinstalled` will close the popup, but close eagerly too.
        setOpen(false);
      }
      return choice.outcome;
    } catch {
      return null;
    }
  };

  const dismiss = () => {
    writePrefs({ ...readPrefs(), dismissedAt: Date.now() });
    setOpen(false);
  };

  const dismissForever = () => {
    writePrefs({ ...readPrefs(), neverShow: true, dismissedAt: Date.now() });
    setOpen(false);
  };

  return { open, platform, iosDevice, canNativeInstall, install, dismiss, dismissForever };
}
