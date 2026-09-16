"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * The five conditions that get the composed still hero instead of the scrub.
 * `globals.css` carries the SAME five strings in its `.scrub-hero` media
 * queries — if the two lists drift, one side downloads assets the other side
 * hides. Edit both or neither.
 */
export const STATIC_HERO_GATES = [
  "(max-width: 720px)",
  "(orientation: portrait) and (max-width: 1024px)",
  "(orientation: portrait) and (pointer: coarse)",
  "(orientation: landscape) and (pointer: coarse) and (max-height: 560px)",
  "(prefers-reduced-motion: reduce)",
] as const;

export interface ScrubHeroState {
  /** Scrub is armed (desktop, motion allowed). Decided after mount, never during render. */
  scrub: boolean;
  /** 0..1 download progress of the video blob, throttled to ~10Hz. */
  loaded: number;
  /** The blob is decoded and seeked to the current scroll position. */
  ready: boolean;
  /** Fetch stalled, aborted or the video errored: the poster carries the hero. */
  failed: boolean;
}

interface Options {
  section: RefObject<HTMLElement | null>;
  video: RefObject<HTMLVideoElement | null>;
  src: string;
  /** Real byte size, the fallback when Content-Length is missing. */
  bytes: number;
  poster: string;
  /**
   * Called with the eased progress (0..1) on every displayed frame, and with
   * `force` when caches must be dropped (the scrub was just re-armed). The
   * callback owns its own delta-gating — it must not touch the DOM when
   * nothing changed.
   */
  onFrame: (p: number, force: boolean) => void;
}

const WATCHDOG_MS = 20_000;

/**
 * Scroll-scrubbed hero video, to the 10k-websites engineering standard:
 *
 *  - the video arrives as a streamed Blob, so seeking works on hosts without
 *    HTTP Range support, behind an honest progress value and a 20s watchdog;
 *  - the poster is requested first and the blob only once it has landed;
 *  - displayed progress lerps toward scroll progress in a rAF loop that is
 *    dt-normalised (same feel at 60Hz and 120Hz) and rests when converged or
 *    off-screen;
 *  - seeks are gated: never write currentTime while one is in flight, keep
 *    only the newest target, and reset on error so the gate cannot deadlock;
 *  - the static/scrub decision is live, re-evaluated on every gate change.
 *
 * Nothing here runs during render, so prerendered HTML is identical for every
 * visitor and hydration never sees a difference.
 */
export function useScrubHero({
  section,
  video,
  src,
  bytes,
  poster,
  onFrame,
}: Options): ScrubHeroState {
  const [state, setState] = useState<ScrubHeroState>({
    scrub: false,
    loaded: 0,
    ready: false,
    failed: false,
  });

  const frameRef = useRef(onFrame);
  useEffect(() => {
    frameRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    const secEl = section.current;
    const vidEl = video.current;
    if (!secEl || !vidEl) return;
    // Re-bound as non-null consts: the inner closures below would otherwise
    // lose the narrowing from the guard above.
    const sec: HTMLElement = secEl;
    const vid: HTMLVideoElement = vidEl;

    let target = 0;
    let shown = 0;
    let rafId: number | null = null;
    let lastTick = 0;
    let seekBusy = false;
    let pendingTime: number | null = null;
    let onScreen = true;
    let scrubOn = false;
    let started = false;
    let objectUrl: string | null = null;
    const abort = new AbortController();

    const heroProgress = () => {
      const range = sec.offsetHeight - window.innerHeight;
      if (range <= 0) return 0;
      return Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / range));
    };

    const requestSeek = (t: number) => {
      if (!vid.duration) return;
      if (seekBusy) {
        pendingTime = t;
        return;
      }
      seekBusy = true;
      vid.currentTime = t;
    };

    const onSeeked = () => {
      seekBusy = false;
      if (pendingTime !== null) {
        const t = pendingTime;
        pendingTime = null;
        requestSeek(t);
      }
    };

    const fail = () => {
      seekBusy = false;
      pendingTime = null;
      setState((s) => (s.failed ? s : { ...s, failed: true }));
    };

    const tick = (now: number) => {
      const dt = Math.min(100, now - (lastTick || now));
      lastTick = now;
      const k = 0.16;
      shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));
      if (Math.abs(target - shown) < 0.0005) {
        shown = target;
        rafId = null;
        lastTick = 0;
      } else {
        rafId = requestAnimationFrame(tick);
      }
      if (vid.duration) requestSeek(shown * vid.duration);
      frameRef.current(shown, false);
    };

    const onScroll = () => {
      target = heroProgress();
      if (rafId === null && onScreen) rafId = requestAnimationFrame(tick);
    };

    async function loadBlob() {
      let watchdog = setTimeout(() => abort.abort(), WATCHDOG_MS);
      const res = await fetch(src, { signal: abort.signal, priority: "low" } as RequestInit);
      if (!res.ok || !res.body) throw new Error(`hero video ${res.status}`);
      const total = Number(res.headers.get("Content-Length")) || bytes;
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let got = 0;
      let lastReport = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        clearTimeout(watchdog);
        watchdog = setTimeout(() => abort.abort(), WATCHDOG_MS);
        chunks.push(value);
        got += value.length;
        const now = performance.now();
        if (now - lastReport > 100) {
          lastReport = now;
          const frac = Math.min(1, got / total);
          setState((s) => ({ ...s, loaded: frac }));
        }
      }
      clearTimeout(watchdog);
      setState((s) => ({ ...s, loaded: 1 }));
      objectUrl = URL.createObjectURL(new Blob(chunks as BlobPart[], { type: "video/mp4" }));
      vid.src = objectUrl;
      vid.load();
      vid.addEventListener(
        "canplay",
        () => {
          target = heroProgress();
          shown = target;
          requestSeek(shown * vid.duration);
          frameRef.current(shown, true);
          setState((s) => ({ ...s, ready: true }));
        },
        { once: true },
      );
    }

    // Poster first, blob second — and a hung poster never blocks the video.
    function startOnce() {
      if (started) return;
      started = true;
      vid.poster = poster;
      let kicked = false;
      const kick = () => {
        if (kicked || abort.signal.aborted) return;
        kicked = true;
        loadBlob().catch(() => {
          // A detached section means the component unmounted and the cleanup
          // aborted the fetch; only a live hero falls back to the poster.
          if (sec.isConnected) fail();
        });
      };
      const img = new Image();
      img.onload = kick;
      img.onerror = kick;
      img.src = poster;
      setTimeout(kick, 4000);
    }

    function enableScrub() {
      if (scrubOn) return;
      scrubOn = true;
      setState((s) => ({ ...s, scrub: true }));
      startOnce();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      target = heroProgress();
      shown = target;
      frameRef.current(shown, true);
      onScroll();
    }

    function disableScrub() {
      if (!scrubOn) return;
      scrubOn = false;
      setState((s) => ({ ...s, scrub: false }));
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    // Keep the MediaQueryLists referenced for the lifetime of the effect.
    const mqls = STATIC_HERO_GATES.map((q) => window.matchMedia(q));
    const applyMode = () => {
      if (mqls.some((m) => m.matches)) disableScrub();
      else enableScrub();
    };
    mqls.forEach((m) => m.addEventListener("change", applyMode));

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen && scrubOn) onScroll();
    });
    io.observe(sec);

    vid.addEventListener("seeked", onSeeked);
    vid.addEventListener("error", fail);

    applyMode();

    return () => {
      disableScrub();
      mqls.forEach((m) => m.removeEventListener("change", applyMode));
      io.disconnect();
      vid.removeEventListener("seeked", onSeeked);
      vid.removeEventListener("error", fail);
      abort.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [section, video, src, bytes, poster]);

  return state;
}
