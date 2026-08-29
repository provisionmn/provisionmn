"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { Component, lazy, Suspense, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useT } from "../i18n";

const HeroScene = lazy(() => import("./HeroScene"));

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    if (typeof console !== "undefined") {
      console.warn("HeroScene failed, falling back:", error);
    }
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl2") || c.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export function Hero() {
  const { t } = useT();
  const [sceneEnabled, setSceneEnabled] = useState(false);

  useEffect(() => {
    setSceneEnabled(hasWebGL());
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="home" className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-grid mask-radial-fade opacity-50"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-mesh opacity-50 dark:opacity-100"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-grain" aria-hidden />
      {/* Glow follows the media column rather than the page centre, so the
          asymmetry of the split reads as intentional. */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-[620px] w-[900px] -translate-y-1/4 translate-x-1/4"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse at center, var(--hero-glow) 0%, transparent 62%)",
        }}
      />

      {sceneEnabled && (
        <div
          // The scene is lit for the ink background; at full strength it
          // swamps the light theme and drops the sub-headline below readable
          // contrast. On lg it sits behind the media column, not the copy.
          className="pointer-events-none absolute -top-12 left-1/2 h-[520px] w-[520px] -translate-x-1/2 opacity-20 transition-opacity lg:left-auto lg:-right-24 lg:top-4 lg:h-[780px] lg:w-[780px] lg:translate-x-0 dark:opacity-90"
          aria-hidden
          style={{
            maskImage:
              "radial-gradient(circle at center, black 50%, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(circle at center, black 50%, transparent 85%)",
          }}
        >
          <SceneBoundary>
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          </SceneBoundary>
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 md:pb-32 md:pt-24 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 font-mono text-xs text-muted-foreground backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              <span>{t.hero.badge}</span>
            </div>

            {/* clamp, not a step scale: the cap is what keeps the second line
                ("бодитой барьж байгуулна", 23 characters) inside the 7-of-12
                column instead of wrapping into a third line. 23 × 0.52em ×
                47.6px ≈ 569px against ~616px of column. */}
            <h1 className="mt-7 font-display text-[clamp(2rem,4.2vw,3.4rem)] font-semibold leading-[1.08] tracking-tight">
              {t.hero.headline1}
              <br />
              <span className="text-gradient-brand">{t.hero.headline2}</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
              {t.hero.sub}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full px-7 text-base">
                <Link href="/calculator">
                  {t.hero.startBtn}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-full px-7 text-base"
                onClick={() => scrollTo("portfolio")}
              >
                {t.hero.workBtn}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 lg:-mr-6 xl:-mr-10">
            <div className="overflow-hidden rounded-2xl border border-border bg-card/85 shadow-2xl shadow-primary/10 backdrop-blur">
              <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-[#FF5F56]" />
                <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                {/* macOS window controls — literal chrome, deliberately not brand colours */}
                <span className="h-3 w-3 rounded-full bg-[#27C93F]" />
                <span className="ml-3 font-mono text-xs text-muted-foreground">
                  ~/provision — zsh
                </span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[0.8125rem] leading-7 text-foreground">
                <code>
                  <span className="text-muted-foreground">$ </span>
                  <span>provision ship</span>
                  <span className="text-muted-foreground"> --stack=all</span>
                  {"\n\n"}
                  <span className="text-brand">➜</span>{" "}
                  <span className="text-muted-foreground">
                    Fullstack     Next.js · Django · Postgres
                  </span>{" "}
                  <span className="text-success">✓</span>
                  {"\n"}
                  <span className="text-brand">➜</span>{" "}
                  <span className="text-muted-foreground">
                    Mobile        React Native · Swift · Kotlin
                  </span>{" "}
                  <span className="text-success">✓</span>
                  {"\n"}
                  <span className="text-brand">➜</span>{" "}
                  <span className="text-muted-foreground">
                    AI / LLM      RAG · Agent · Fine-tune
                  </span>{" "}
                  <span className="text-success">✓</span>
                  {"\n"}
                  <span className="text-brand">➜</span>{" "}
                  <span className="text-muted-foreground">
                    DevOps        Kubernetes · Terraform · CI/CD
                  </span>{" "}
                  <span className="text-success">✓</span>
                  {"\n"}
                  <span className="text-brand">➜</span>{" "}
                  <span className="text-muted-foreground">
                    RPA           Power Automate · Workflow
                  </span>{" "}
                  <span className="text-success">✓</span>
                  {"\n"}
                  <span className="text-brand">➜</span>{" "}
                  <span className="text-muted-foreground">
                    Odoo · UX/UI  Custom module · Design system
                  </span>{" "}
                  <span className="text-success">✓</span>
                  {"\n\n"}
                  <span className="text-primary">{t.hero.termReady}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    {t.hero.termAfter}{" "}
                  </span>
                  <span>{t.hero.termDays}</span>
                  <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-foreground" />
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
