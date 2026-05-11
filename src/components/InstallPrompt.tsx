import { useEffect, useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share, MoreVertical, PlusSquare, Smartphone, Download, X, Check } from "lucide-react";
import { useT, type DictKey } from "../lib/dict";
import { useLang } from "../lib/i18n";
import { useInstallPrompt, type Platform, type IOSDevice } from "../lib/install";

/* =====================================================================
 * InstallPrompt — "Add to Home Screen" coachmark.
 * ---------------------------------------------------------------------
 * Shows a few seconds after first paint with platform-specific copy:
 *
 *  - Android (with `beforeinstallprompt` captured): an "Install" button
 *    that triggers the native dialog directly.
 *  - Android (no event): falls back to "menu → Install app" instructions.
 *  - iOS Safari: illustrated Share-icon → "Add to Home Screen" steps,
 *    with iPhone vs iPad copy for where the Share icon lives.
 *  - iOS Chrome/Firefox/Edge: a polite "open in Safari to install" note.
 *
 * Honors a "Don't show again" checkbox, soft-snoozes for 14 days on a
 * dismiss, and never shows once the app is launched as standalone.
 * ===================================================================== */

interface Step {
  /** Lucide-rendered icon for the step. */
  icon: React.ReactNode;
  /** Translation key for the step's main label. */
  titleKey: DictKey;
  /** Translation key for the step's helper hint. */
  hintKey: DictKey;
}

function buildSteps(platform: Platform, iosDevice: IOSDevice, canNativeInstall: boolean): Step[] {
  if (platform === "ios-safari") {
    const isIPad = iosDevice === "ipad";
    return [
      {
        icon: <Share size={18} />,
        titleKey: isIPad ? "install_step_share_ipad" : "install_step_share_iphone",
        hintKey: isIPad ? "install_step_share_ipad_hint" : "install_step_share_iphone_hint"
      },
      {
        icon: <PlusSquare size={18} />,
        titleKey: "install_step_a2hs",
        hintKey: "install_step_a2hs_hint"
      },
      {
        icon: <Check size={18} />,
        titleKey: "install_step_confirm",
        hintKey: "install_step_confirm_hint"
      }
    ];
  }

  if (platform === "ios-other") {
    return [
      {
        icon: <Smartphone size={18} />,
        titleKey: "install_ios_open_in_safari",
        hintKey: "install_ios_open_in_safari_hint"
      }
    ];
  }

  // Android fallback (only used when there's no captured event — when
  // there is, we render the native Install button instead of any steps).
  if (platform === "android" && !canNativeInstall) {
    return [
      {
        icon: <MoreVertical size={18} />,
        titleKey: "install_step_android_menu",
        hintKey: "install_step_android_menu_hint"
      },
      {
        icon: <PlusSquare size={18} />,
        titleKey: "install_step_android_a2hs",
        hintKey: "install_step_android_a2hs_hint"
      }
    ];
  }

  return [];
}

export default function InstallPrompt() {
  const t = useT();
  const { dir } = useLang();
  const checkboxId = useId();

  const { open, platform, iosDevice, canNativeInstall, install, dismiss, dismissForever } =
    useInstallPrompt();

  /* The "Don't show again" checkbox is local UI state; we only persist
   * the choice when the user actually closes the popup, so that ticking
   * + then hitting "Install" doesn't punish them later. */
  const [neverAgain, setNeverAgain] = useState(false);

  /* Reset the checkbox each time the popup opens — otherwise a previously
   * ticked-and-cancelled state would carry over to a future visit. */
  useEffect(() => {
    if (open) setNeverAgain(false);
  }, [open]);

  const handleClose = () => {
    if (neverAgain) dismissForever();
    else dismiss();
  };

  const handleInstallClick = async () => {
    const outcome = await install();
    // If the native dialog was dismissed by the user, treat it the same
    // as our own "Maybe later" — soft-snooze and respect the checkbox.
    if (outcome === "dismissed") handleClose();
  };

  // Steps to render below the header. Empty for the "native install"
  // Android case — that one just gets the big Install button.
  const steps =
    platform === "android" && canNativeInstall
      ? []
      : buildSteps(platform, iosDevice, canNativeInstall);

  const title =
    platform.startsWith("ios") ? t("install_title_ios") : t("install_title_android");
  const subtitle =
    platform === "android" && !canNativeInstall
      ? t("install_subtitle_android_fallback")
      : platform.startsWith("ios")
      ? t("install_subtitle_ios")
      : t("install_subtitle_android");

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — click anywhere off the sheet to soft-dismiss. */}
          <motion.div
            key="a2hs-backdrop"
            className="fixed inset-0 z-[60] bg-ink-900/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={handleClose}
            aria-hidden
          />

          {/* The sheet. On mobile it slides up from the bottom (true
              bottom-sheet feel), on md+ it centers as a card. */}
          <motion.div
            key="a2hs-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${checkboxId}-title`}
            dir={dir}
            className="fixed z-[61] inset-x-0 bottom-0 md:inset-0 md:m-auto md:h-fit md:max-w-md
                       bg-cream-50 text-ink-900
                       rounded-t-3xl md:rounded-3xl
                       border border-cream-300/70 shadow-[0_-12px_40px_-8px_rgba(42,31,26,0.25)] md:shadow-[0_24px_60px_-12px_rgba(42,31,26,0.35)]
                       pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] px-5 md:p-6"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            {/* Drag handle — visual only, signals "this is a sheet" on mobile */}
            <div
              className="md:hidden mx-auto mb-3 h-1 w-10 rounded-full bg-ink-900/15"
              aria-hidden
            />

            {/* Close (X) */}
            <button
              type="button"
              onClick={handleClose}
              aria-label={t("install_close_aria")}
              className="absolute top-3 end-3 inline-flex items-center justify-center w-8 h-8 rounded-full
                         text-ink-700/70 hover:text-ink-900 hover:bg-cream-100 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-start gap-3 pe-8">
              <span
                className="mt-0.5 inline-flex items-center justify-center w-10 h-10 rounded-2xl
                           bg-terracotta-500/10 text-terracotta-600"
                aria-hidden
              >
                <Download size={20} />
              </span>
              <div className="min-w-0">
                <p className="section-eyebrow !mb-1">{t("install_eyebrow")}</p>
                <h3
                  id={`${checkboxId}-title`}
                  className="font-serif text-2xl leading-tight text-ink-900"
                >
                  {title}
                </h3>
                <p className="mt-1 text-sm text-ink-700/85">{subtitle}</p>
              </div>
            </div>

            {/* Body — either steps or just the native install button */}
            {steps.length > 0 && (
              <ol className="mt-5 space-y-3">
                {steps.map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-cream-300/60 bg-cream-50 px-3 py-2.5"
                  >
                    <span
                      className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full
                                 bg-ink-900 text-cream-50 text-xs font-semibold"
                      aria-hidden
                    >
                      {i + 1}
                    </span>
                    <span
                      className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg
                                 bg-cream-100 text-ink-800"
                      aria-hidden
                    >
                      {step.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-ink-900">
                        {t(step.titleKey)}
                      </span>
                      <span className="block text-xs text-ink-700/75 mt-0.5">
                        {t(step.hintKey)}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            )}

            {/* Native Install CTA — Android-with-event only */}
            {platform === "android" && canNativeInstall && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full
                           bg-terracotta-500 px-5 py-3 text-base font-medium text-cream-50
                           shadow-md shadow-terracotta-700/20 active:scale-[0.99] transition-transform
                           hover:bg-terracotta-600 focus:outline-none focus:ring-2 focus:ring-terracotta-500/40"
              >
                <Download size={18} />
                {t("install_install_button")}
              </button>
            )}

            {/* Footer — checkbox + dismiss */}
            <div className="mt-5 flex items-center justify-between gap-3">
              <label
                htmlFor={checkboxId}
                className="inline-flex items-center gap-2 text-xs text-ink-700/85 cursor-pointer select-none"
              >
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={neverAgain}
                  onChange={(e) => setNeverAgain(e.target.checked)}
                  className="h-4 w-4 rounded border-cream-300 text-terracotta-500
                             focus:ring-terracotta-500/40 accent-terracotta-500"
                />
                {t("install_dont_show_again")}
              </label>
              <button
                type="button"
                onClick={handleClose}
                className="text-xs font-medium text-ink-700 hover:text-terracotta-600 transition-colors px-2 py-1"
              >
                {t("install_dismiss")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
