"use client";

import Link from "next/link";
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
} from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { useT } from "../i18n";
import { useScrubHero } from "./scrub/useScrubHero";

const VIDEO_SRC = "/hero/hero-scrub.mp4";
/** Real byte size of the encoded file; the ring's fallback when Content-Length is missing. */
const VIDEO_BYTES = 2_655_242;
const POSTER = "/hero/hero-poster.jpg";

/**
 * Caption bands in scroll progress (0..1 across the 300vh scrub range).
 * Starting points from the design package, validated by the flick test.
 *
 *   band 1  sparks drift down, scattered     drift-down words
 *   band 2  the fall slows, sparks align     scatter-assemble characters
 *   band 3  rows of light at rest             word rise, then sub, then CTAs
 */
const BANDS: readonly [number, number][] = [
  [0, 0.3],
  [0.34, 0.62],
  [0.68, 1],
];
/** Progress it takes each band's text to assemble (--k 0 → 1). ~20vh, longer for the settle. */
const RAMPS = [0.07, 0.08, 0.2];
/**
 * Peak scrim alpha per band, from the worst-frame audit: the lightest pixel
 * in each band's text zone across its busiest frames, under the scrim at its
 * 46% stop, against brand mist. Band 1 sits over the densest spark field and
 * needs 0.84 to clear 3.5:1 (3.81:1); 0.86 leaves margin. Band 2 clears at
 * 0.66 (3.98:1), band 3 over the settled dark sky at 0.7 (12.35:1).
 */
const SCRIM_ALPHA = [0.86, 0.66, 0.7];

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const smoothstep = (p: number, e0: number, e1: number) => {
  const t = clamp((p - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Seeded LCG: split offsets are baked into the prerendered HTML, so no Math.random. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

function Words({
  text,
  spread,
  wordClass = "",
}: {
  text: string;
  spread: number;
  wordClass?: string;
}) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span
            className={`w ${wordClass}`}
            style={
              { "--th": ((i / words.length) * spread).toFixed(3) } as CSSProperties
            }
          >
            {word}
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

function Chars({ text, seed, spread }: { text: string; seed: number; spread: number }) {
  const r = rng(seed);
  const words = text.split(" ");
  return (
    <>
      {words.map((word, wi) => (
        <Fragment key={`${word}-${wi}`}>
          {/* Keeps a word's characters on one line while they fly in. */}
          <span className="inline-block whitespace-nowrap">
            {[...word].map((ch, ci) => (
              <span
                key={ci}
                className="c"
                style={
                  {
                    "--th": (r() * spread).toFixed(3),
                    "--jx": `${((r() - 0.5) * 90).toFixed(1)}px`,
                    "--jy": `${((r() - 0.5) * 70).toFixed(1)}px`,
                    "--jr": `${((r() - 0.5) * 40).toFixed(1)}deg`,
                  } as CSSProperties
                }
              >
                {ch}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

/**
 * Cinematic scroll hero: a generated shot of violet and blue sparks drifting
 * down and settling into calm rows of light, scrubbed by scroll, with the
 * journey told in three caption bands. Engine and gates live in
 * `scrub/useScrubHero.ts`; this file owns layout, copy and choreography.
 *
 * Phones, portrait tablets and reduced motion get `.static-hero` instead —
 * CSS decides visibility, the hook decides whether anything downloads.
 */
export function Hero() {
  const { t } = useT();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bandRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cueRef = useRef<HTMLDivElement>(null);

  const cache = useRef(BANDS.map(() => ({ op: -1, k: -1, live: true })));
  const cueCache = useRef(-1);
  const lastP = useRef(0);
  const loadK = useRef(0);

  const applyFrame = useCallback((p: number, force: boolean) => {
    lastP.current = p;
    const last = BANDS.length - 1;
    BANDS.forEach(([a, b], i) => {
      const el = bandRefs.current[i];
      if (!el) return;
      const c = cache.current[i];
      const f = Math.min(0.06, (b - a) / 3);
      // First band opens settled, last band never fades out.
      const fadeIn = i === 0 ? 1 : smoothstep(p, a, a + f);
      const fadeOut = i === last ? 1 : 1 - smoothstep(p, b - f, b);
      const op = Math.round(fadeIn * fadeOut * 1000) / 1000;
      let k = clamp((p - a) / RAMPS[i], 0, 1);
      if (i === 0) k = Math.max(k, loadK.current);
      k = Math.round(k * 1000) / 1000;

      const edge = (v: number, prev: number) =>
        (v === 0 || v === 1) && v !== prev;
      if (force || Math.abs(op - c.op) >= 0.004 || edge(op, c.op)) {
        c.op = op;
        el.style.opacity = String(op);
      }
      if (force || Math.abs(k - c.k) >= 0.008 || edge(k, c.k)) {
        c.k = k;
        el.style.setProperty("--k", String(k));
      }
      // A faded band keeps its links out of the tab order.
      const live = op > 0.5;
      if (force || live !== c.live) {
        c.live = live;
        el.toggleAttribute("inert", !live);
      }
    });

    const cue = cueRef.current;
    if (cue) {
      const op = Math.round((1 - smoothstep(p, 0.02, 0.1)) * 100) / 100;
      if (force || op !== cueCache.current) {
        cueCache.current = op;
        cue.style.opacity = String(op);
      }
    }
  }, []);

  const hero = useScrubHero({
    section: sectionRef,
    video: videoRef,
    src: VIDEO_SRC,
    bytes: VIDEO_BYTES,
    poster: POSTER,
    onFrame: applyFrame,
  });

  // Band one assembles once on load, then hands over to scroll (k = max).
  useEffect(() => {
    if (!hero.scrub) return;
    let id = 0;
    const t0 = performance.now();
    const run = (now: number) => {
      const t = clamp((now - t0) / 1100, 0, 1);
      loadK.current = 1 - Math.pow(1 - t, 3);
      applyFrame(lastP.current, false);
      if (t < 1) id = requestAnimationFrame(run);
    };
    id = requestAnimationFrame(run);
    return () => cancelAnimationFrame(id);
  }, [hero.scrub, applyFrame]);

  // Copy changes with the language toggle; the new spans need the current --k.
  useEffect(() => {
    applyFrame(lastP.current, true);
  }, [t, applyFrame]);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const ring = 126;
  const ctas = (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        asChild
        size="lg"
        className="group h-12 rounded-full py-0 pl-7 pr-1.5 text-base"
      >
        <Link href="/calculator">
          {t.hero.startBtn}
          <span className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/15 transition-transform duration-300 ease-out-strong group-hover:translate-x-0.5">
            <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
          </span>
        </Link>
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="h-12 rounded-full border-brand-mist/30 bg-transparent px-7 text-base text-brand-mist hover:bg-brand-mist/10 hover:text-brand-mist dark:border-brand-mist/30 dark:bg-transparent"
        onClick={() => scrollTo("portfolio")}
      >
        {t.hero.workBtn}
      </Button>
    </div>
  );

  const badge = (
    <div className="scrub-chip inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs text-brand-mist/85">
      <span className="relative flex h-2 w-2">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
      </span>
      <span>{t.hero.badge}</span>
    </div>
  );

  return (
    <section id="home" ref={sectionRef} className="scrub-hero">
      <div className="scrub-stage">
        <video
          ref={videoRef}
          className="scrub-video"
          muted
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          data-failed={hero.failed || undefined}
        />
        <div className="scrub-scrim" aria-hidden />

        {/* Band 1 — left third, words drift down with the sparks. */}
        <div
          ref={(el) => {
            bandRefs.current[0] = el;
          }}
          className="scrub-band band-drift left-[6vw] top-[30%] max-w-[min(38rem,44vw)]"
          style={{ "--scrim-a": SCRIM_ALPHA[0], opacity: 1 } as CSSProperties}
        >
          <p className="sr-only">{t.journey.band1}</p>
          <p
            aria-hidden
            className="font-display text-[clamp(2.2rem,4.4vw,4.2rem)] font-semibold leading-[1.08] tracking-display"
          >
            <Words text={t.journey.band1} spread={0.55} />
          </p>
        </div>

        {/* Band 2 — right third, characters gather as the sparks align. */}
        <div
          ref={(el) => {
            bandRefs.current[1] = el;
          }}
          className="scrub-band band-scatter right-[6vw] top-[36%] max-w-[min(38rem,44vw)] text-right"
          style={{ "--scrim-a": SCRIM_ALPHA[1] } as CSSProperties}
        >
          <p className="sr-only">{t.journey.band2}</p>
          <p
            aria-hidden
            className="font-display text-[clamp(2.2rem,4.4vw,4.2rem)] font-semibold leading-[1.08] tracking-display"
          >
            <Chars text={t.journey.band2} seed={11} spread={0.5} />
          </p>
        </div>

        {/* Band 3 — the settle. Upper centre, above the rows of light. */}
        <div
          ref={(el) => {
            bandRefs.current[2] = el;
          }}
          className="scrub-band band-rise inset-x-0 top-[17%] mx-auto flex w-[min(62rem,90vw)] flex-col items-center text-center"
          style={{ "--scrim-a": SCRIM_ALPHA[2] } as CSSProperties}
        >
          <div className="settle-sub mb-7">{badge}</div>
          <h1 className="font-display text-[clamp(2.4rem,5vw,4.8rem)] font-semibold leading-[1.05] tracking-display">
            <span className="sr-only">
              {t.hero.headline1} {t.hero.headline2}
            </span>
            <span aria-hidden>
              <Words text={t.hero.headline1} spread={0.3} />
              <br />
              <Words
                text={t.hero.headline2}
                spread={0.3}
                wordClass="text-gradient-brand"
              />
            </span>
          </h1>
          <p className="settle-sub mt-6 max-w-[46ch] text-lg text-brand-mist/85 md:text-xl">
            {t.hero.sub}
          </p>
          <div className="settle-cta mt-9">{ctas}</div>
        </div>

        {hero.scrub && !hero.ready && !hero.failed && (
          <svg
            className="scrub-ring"
            viewBox="0 0 48 48"
            role="img"
            aria-label={t.journey.loading}
          >
            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="3" />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={ring}
              strokeDashoffset={Math.round(ring * (1 - hero.loaded))}
              transform="rotate(-90 24 24)"
            />
          </svg>
        )}
        {(hero.ready || hero.failed) && (
          <div ref={cueRef} className="scrub-cue" aria-hidden>
            <ChevronDown strokeWidth={1.5} className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Composed still hero for phones, portrait tablets and reduced motion. */}
      <div className="static-hero">
        <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-40 sm:px-6">
          {badge}
          <h1 className="mt-7 font-display text-[clamp(2.2rem,8vw,3.4rem)] font-semibold leading-[1.08] tracking-display text-brand-mist">
            {t.hero.headline1}
            <br />
            <span className="text-gradient-brand">{t.hero.headline2}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-brand-mist/85">{t.hero.sub}</p>
          <div className="mt-9">{ctas}</div>
        </div>
      </div>
    </section>
  );
}
