import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { lazy, Suspense } from "react";
import { useT } from "../i18n";

const HeroScene = lazy(() => import("./HeroScene"));

interface HeroProps {
  onGetQuote?: () => void;
}

export function Hero({ onGetQuote }: HeroProps) {
  const { t } = useT();

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="home" className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-grid mask-radial-fade opacity-60"
        aria-hidden
      />
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[1100px] pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(124,110,255,0.18) 0%, transparent 60%)",
        }}
      />

      <div
        className="absolute left-1/2 top-16 md:top-20 -translate-x-1/2 h-[520px] w-[520px] md:h-[640px] md:w-[640px] pointer-events-none opacity-70 mix-blend-screen"
        aria-hidden
        style={{
          maskImage:
            "radial-gradient(circle at center, black 35%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 35%, transparent 75%)",
        }}
      >
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 backdrop-blur px-4 py-1.5 text-xs font-mono text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span>{t.hero.badge}</span>
          </div>

          <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]">
            {t.hero.headline1}
            <br />
            <span className="text-gradient-brand">{t.hero.headline2}</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.hero.sub}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="h-12 px-6 text-base"
              onClick={onGetQuote}
            >
              {t.hero.startBtn}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 text-base"
              onClick={() => scrollTo("portfolio")}
            >
              {t.hero.workBtn}
            </Button>
          </div>
        </div>

        <div className="mt-16 mx-auto max-w-3xl">
          <div className="rounded-xl border border-border bg-card/80 backdrop-blur shadow-2xl shadow-primary/10 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/40">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
              <span className="ml-3 font-mono text-xs text-muted-foreground">
                ~/provision — zsh
              </span>
            </div>
            <pre className="p-6 font-mono text-sm leading-7 overflow-x-auto text-foreground">
              <code>
                <span className="text-muted-foreground">$ </span>
                <span>provision ship</span>
                <span className="text-muted-foreground"> --stack=all</span>
                {"\n\n"}
                <span className="text-accent">➜</span>{" "}
                <span className="text-muted-foreground">
                  Fullstack     Next.js · Django · Postgres
                </span>{" "}
                <span className="text-[#27C93F]">✓</span>
                {"\n"}
                <span className="text-accent">➜</span>{" "}
                <span className="text-muted-foreground">
                  Mobile        React Native · Swift · Kotlin
                </span>{" "}
                <span className="text-[#27C93F]">✓</span>
                {"\n"}
                <span className="text-accent">➜</span>{" "}
                <span className="text-muted-foreground">
                  AI / LLM      RAG · Agent · Fine-tune
                </span>{" "}
                <span className="text-[#27C93F]">✓</span>
                {"\n"}
                <span className="text-accent">➜</span>{" "}
                <span className="text-muted-foreground">
                  DevOps        Kubernetes · Terraform · CI/CD
                </span>{" "}
                <span className="text-[#27C93F]">✓</span>
                {"\n"}
                <span className="text-accent">➜</span>{" "}
                <span className="text-muted-foreground">
                  RPA           Power Automate · Workflow
                </span>{" "}
                <span className="text-[#27C93F]">✓</span>
                {"\n"}
                <span className="text-accent">➜</span>{" "}
                <span className="text-muted-foreground">
                  Odoo · UX/UI  Custom module · Design system
                </span>{" "}
                <span className="text-[#27C93F]">✓</span>
                {"\n\n"}
                <span className="text-primary">{t.hero.termReady}</span>
                <span className="text-muted-foreground">
                  {" "}
                  {t.hero.termAfter}{" "}
                </span>
                <span>{t.hero.termDays}</span>
                <span className="inline-block w-2 h-4 translate-y-0.5 bg-foreground ml-1 animate-pulse" />
              </code>
            </pre>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground/70">
          <span>TypeScript</span>
          <span className="opacity-40">·</span>
          <span>Next.js</span>
          <span className="opacity-40">·</span>
          <span>React Native</span>
          <span className="opacity-40">·</span>
          <span>Python</span>
          <span className="opacity-40">·</span>
          <span>PostgreSQL</span>
          <span className="opacity-40">·</span>
          <span>Kubernetes</span>
          <span className="opacity-40">·</span>
          <span>AWS</span>
          <span className="opacity-40">·</span>
          <span>Odoo</span>
        </div>
      </div>
    </section>
  );
}
