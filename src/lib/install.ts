import { useEffect, useRef, useState } from "react";

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

/** Belt-and-suspenders mobile check, on top of UA-based platform
 *  detection. We only ever want this prompt on a phone or tablet — not
 *  on a desktop Chrome that happens to share the same Chromium engine.
 *
 *  We require *both* a coarse primary pointer (= touch-driven UI) and
 *  actual touch capability, so a desktop with a touchscreen monitor
 *  (which still uses a fine mouse pointer) doesn't trigger the popup. */
export function isLikelyMobile(): boolean {
  if (typeof window === "undefined") return false;

  const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const hasTouch =
    (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) ||
    "ontouchstart" in window;

  return coarsePointer && hasTouch;
}

/* ---------- Persistence ---------- */

const STORAGE_KEY = "tuscany:a2hs-prefs:v1";
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

    // Skip outright if we have nothing useful to say.
    if (platform === "other") return;
    // Mobile-only by design — this app lives on the phone in the user's
    // pocket. Desktop Chromium *can* receive `beforeinstallprompt`, but
    // we deliberately don't surface the install offer there.
    if (platform === "desktop-chromium") return;
    // Belt-and-suspenders: even if UA detection put us in a mobile
    // bucket, require an actual touch-driven device (catches devtools
    // emulation that doesn't simulate touch, exotic Chromium forks, etc.).
    if (!isLikelyMobile()) return;
    if (isStandalone()) return;
    if (isSnoozed(readPrefs())) return;

    const id = window.setTimeout(() => {
      // Re-check at fire time — a lot can happen in 6 seconds.
      if (isStandalone()) return;
      if (isSnoozed(readPrefs())) return;
      setOpen(true);
    }, openDelayMs);

    return () => window.clearTimeout(id);
  }, [platform, openDelayMs]);

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
