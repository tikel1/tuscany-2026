import { useCallback, useEffect, useRef, useState } from "react";
import { claimPlayback, releasePlayback } from "./audioBus";

export type PageAudioState = "idle" | "loading" | "playing" | "error";

type Options = {
  fallbackUrl?: string | null;
  onEnded?: () => void;
};

/**
 * Lazy `HTMLAudioElement` with optional **fallback URL** (e.g. Hebrew clip
 * then English). When `url` changes, the player resets. If `play()` fails
 * on the primary source, we try the fallback once before `error`.
 */
export function usePageAudio(url: string | null, options?: Options) {
  const fallbackUrl = options?.fallbackUrl ?? null;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PageAudioState>("idle");
  const onEndedRef = useRef(options?.onEnded);
  onEndedRef.current = options?.onEnded;
  const fallbackRef = useRef(fallbackUrl);
  fallbackRef.current = fallbackUrl;

  const dispose = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      releasePlayback(a);
      audioRef.current = null;
    }
    setState("idle");
  }, []);

  useEffect(() => {
    dispose();
  }, [url, fallbackUrl, dispose]);

  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (a) {
        a.pause();
        releasePlayback(a);
      }
    };
  }, []);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "none";
      a.addEventListener("playing", () => setState("playing"));
      a.addEventListener("waiting", () => setState("loading"));
      a.addEventListener("pause", () =>
        setState(s => (s === "loading" ? s : "idle"))
      );
      a.addEventListener("ended", () => {
        setState("idle");
        releasePlayback(a);
        onEndedRef.current?.();
      });
      audioRef.current = a;
    }
    return audioRef.current;
  }, []);

  const toggle = useCallback(
    (e?: React.SyntheticEvent) => {
      e?.stopPropagation();
      if (!url) return;

      const a = ensureAudio();

      if (!a.paused) {
        a.pause();
        setState("idle");
        releasePlayback(a);
        return;
      }

      const playFrom = (src: string, stage: "primary" | "fallback") => {
        a.src = src;
        setState("loading");
        claimPlayback(a);
        a.play().catch(() => {
          if (stage === "primary" && fallbackRef.current) {
            playFrom(fallbackRef.current, "fallback");
          } else {
            setState("error");
            releasePlayback(a);
          }
        });
      };

      playFrom(url, "primary");
    },
    [url, ensureAudio]
  );

  return { state, toggle, dispose };
}
