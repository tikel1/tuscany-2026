import { useCallback, useEffect, useRef, useState } from "react";
import { claimPlayback, releasePlayback } from "./audioBus";

export type PageAudioState = "idle" | "loading" | "playing" | "error";

type Options = {
  fallbackUrl?: string | null;
  onEnded?: () => void;
  /** Default `none`. Long clips (e.g. trilingual word audio) use `auto` so the browser buffers ahead. */
  preload?: HTMLMediaElement["preload"];
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
  const fallbackRef = useRef(fallbackUrl);
  const preloadRef = useRef(options?.preload ?? "none");

  useEffect(() => {
    onEndedRef.current = options?.onEnded;
  }, [options?.onEnded]);

  useEffect(() => {
    fallbackRef.current = fallbackUrl;
  }, [fallbackUrl]);

  useEffect(() => {
    const p = options?.preload ?? "none";
    preloadRef.current = p;
    const a = audioRef.current;
    if (a) a.preload = p;
  }, [options?.preload]);

  const stopAndDetach = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      releasePlayback(a);
      audioRef.current = null;
    }
  }, []);

  const dispose = useCallback(() => {
    stopAndDetach();
    setState("idle");
  }, [stopAndDetach]);

  useEffect(() => {
    stopAndDetach();
    queueMicrotask(() => {
      setState("idle");
    });
  }, [url, fallbackUrl, options?.preload, stopAndDetach]);

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
      a.preload = preloadRef.current;
      a.addEventListener("playing", () => setState("playing"));
      /** Do not clobber `playing` with `loading` mid-playback (buffering at MP3 stitch points looks "stuck"). */
      a.addEventListener("waiting", () =>
        setState(s => (s === "playing" ? "playing" : "loading"))
      );
      a.addEventListener("pause", () =>
        setState(s => (s === "loading" ? s : "idle"))
      );
      a.addEventListener("ended", () => {
        setState("idle");
        releasePlayback(a);
        onEndedRef.current?.();
      });
      /** Without this, 404 / decode failures never leave `loading` (no `playing` event). */
      a.addEventListener("error", () => {
        if (a.error?.code === MediaError.MEDIA_ERR_ABORTED) return;
        setState("error");
        releasePlayback(a);
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
        /* Re-start the media pipeline (helps some browsers after `preload="none"`). */
        a.load();
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
