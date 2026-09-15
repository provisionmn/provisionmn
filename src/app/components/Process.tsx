"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, Check, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { useT } from "../i18n";

/** How long a full press-and-hold takes to lock the scope. */
const HOLD_MS = 1400;
const DOT_COUNT = 28;

/**
 * Scatter offsets for the dot row, from a seeded LCG rather than Math.random:
 * this array is baked into the prerendered HTML, so it has to come out the
 * same on the server and on the client.
 */
const dots = (() => {
  let s = 7;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  return Array.from({ length: DOT_COUNT }, () => ({
    y: Math.round((rnd() - 0.5) * 560) / 10,
    o: Math.round((0.2 + rnd() * 0.45) * 100) / 100,
  }));
})();

/**
 * The page's one interactive moment. The hero shows scattered sparks settling
 * into rows; here the visitor does it themselves — holding the button pulls
 * the scattered dots into a line and lights the four steps in order.
 *
 * All motion runs off one `--p` custom property (0..1) on the root, written
 * only when it changes, from a rAF loop that stops as soon as it is idle.
 * Everything visual derives from `--p` in CSS, so a frame costs one style write
 * and zero React renders.
 */
export function Process() {
  const { t } = useT();
  const rootRef = useRef<HTMLDivElement>(null);
  const [locked, setLocked] = useState(false);

  const progress = useRef(0);
  const holding = useRef(false);
  const rafId = useRef<number | null>(null);
  const lastTick = useRef(0);
  const written = useRef(-1);
  const pinnedByMotionPref = useRef(false);

  function write() {
    const v = Math.round(progress.current * 1000) / 1000;
    if (v === written.current) return;
    written.current = v;
    rootRef.current?.style.setProperty("--p", String(v));
  }

  function tick(now: number) {
    const dt = Math.min(100, now - (lastTick.current || now));
    lastTick.current = now;
    if (holding.current) {
      progress.current = Math.min(1, progress.current + dt / HOLD_MS);
    } else {
      // Letting go early drains back toward zero, slowing as it gets there
      // rather than snapping.
      const rate = 1.6 * Math.max(0.2, progress.current);
      progress.current = Math.max(0, progress.current - (dt / HOLD_MS) * rate);
    }
    write();

    const done = progress.current >= 1;
    const drained = !holding.current && progress.current <= 0;
    if (done || drained) {
      rafId.current = null;
      lastTick.current = 0;
      holding.current = false;
      if (done) setLocked(true);
      return;
    }
    rafId.current = requestAnimationFrame(tick);
  }

  function start() {
    if (locked) return;
    holding.current = true;
    if (rafId.current === null) rafId.current = requestAnimationFrame(tick);
  }

  function stop() {
    holding.current = false;
    if (rafId.current === null && progress.current > 0 && !locked) {
      rafId.current = requestAnimationFrame(tick);
    }
  }

  // Reduced motion gets the finished state with no hold required, live in
  // both directions: flipping the preference back off un-pins it.
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (mql.matches) {
        if (rafId.current !== null) cancelAnimationFrame(rafId.current);
        rafId.current = null;
        holding.current = false;
        progress.current = 1;
        pinnedByMotionPref.current = true;
        write();
        setLocked(true);
      } else if (pinnedByMotionPref.current) {
        pinnedByMotionPref.current = false;
        progress.current = 0;
        write();
        setLocked(false);
      }
    };
    apply();
    mql.addEventListener("change", apply);
    return () => {
      mql.removeEventListener("change", apply);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
    // write() only touches refs; the effect must run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = t.process.steps;

  return (
    <section id="process" className="relative scroll-mt-24 py-32 md:py-48">
      <div
        ref={rootRef}
        style={{ "--p": 0 } as CSSProperties}
        className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-4 sm:px-6 lg:grid-cols-12 lg:gap-20 lg:px-8"
      >
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <div className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-brand">
              {t.process.tag}
            </div>
            <h2 className="font-display text-[clamp(1.85rem,3.4vw,2.9rem)] font-semibold leading-[1.1] tracking-display">
              {t.process.title}
            </h2>

            {/* Scattered dots that settle into a line as the hold builds. */}
            <div
              className="mt-12 flex h-16 items-center justify-between"
              aria-hidden
            >
              {dots.map((d, i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-brand"
                  style={{
                    transform: `translateY(calc(${d.y}px * (1 - var(--p))))`,
                    opacity: `calc(${d.o} + ${1 - d.o} * var(--p))`,
                  }}
                />
              ))}
            </div>

            <div className="mt-8 flex flex-col items-start gap-4">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  start();
                }}
                onPointerUp={stop}
                onPointerCancel={stop}
                onKeyDown={(e) => {
                  if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                    e.preventDefault();
                    start();
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === " " || e.key === "Enter") stop();
                }}
                onContextMenu={(e) => e.preventDefault()}
                aria-disabled={locked || undefined}
                className="group relative inline-flex h-14 touch-none select-none items-center gap-3 overflow-hidden rounded-full border border-primary/40 bg-card px-7 text-base font-medium elev-2 transition-[transform,border-color] duration-300 ease-out-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className="pointer-events-none absolute inset-0 origin-left bg-primary/25"
                  style={{ transform: "scaleX(var(--p))" }}
                  aria-hidden
                />
                {locked ? (
                  <Check strokeWidth={1.75} className="relative h-5 w-5 text-success" />
                ) : (
                  <Lock strokeWidth={1.5} className="relative h-5 w-5 text-brand" />
                )}
                <span className="relative">
                  {locked ? t.process.locked : t.process.hold}
                </span>
              </button>
              <span className="sr-only" role="status">
                {locked ? t.process.locked : ""}
              </span>

              {/* What the hold earns: the next step, revealed on lock. */}
              <div
                className={`transition-[opacity,transform] duration-500 ease-out-strong ${
                  locked
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0"
                }`}
                aria-hidden={!locked}
              >
                <Button
                  asChild
                  size="lg"
                  className="group h-12 rounded-full py-0 pl-7 pr-1.5 text-base"
                >
                  <Link href="/calculator" tabIndex={locked ? undefined : -1}>
                    {t.hero.startBtn}
                    <span className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/15 transition-transform duration-300 ease-out-strong group-hover:translate-x-0.5">
                      <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <ol className="relative lg:col-span-7">
          {/* The track, and the line that draws down it as the hold builds. */}
          <span
            className="absolute bottom-6 left-[1.1875rem] top-6 w-px bg-border"
            aria-hidden
          />
          <span
            className="absolute bottom-6 left-[1.1875rem] top-6 w-px origin-top bg-brand"
            style={{ transform: "scaleY(var(--p))" }}
            aria-hidden
          />
          {steps.map((step, i) => {
            // Each step lights across its own quarter of the hold.
            const lit = `clamp(0, (var(--p) * ${steps.length} - ${i}) * 1.6, 1)`;
            return (
              <li
                key={step.title}
                style={{ "--i": i } as CSSProperties}
                className="reveal reveal-stagger relative flex gap-6 pb-14 last:pb-0"
              >
                <span
                  className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background"
                  aria-hidden
                >
                  <span
                    className="absolute inset-0 rounded-full border border-brand bg-primary/15"
                    style={{ opacity: lit, transform: `scale(calc(0.6 + 0.4 * ${lit}))` }}
                  />
                  <span className="relative font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>
                <div className="pt-1.5">
                  <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-[48ch] text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
