"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useT } from "../i18n";

export function NotFound() {
  const { t } = useT();

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-grid mask-radial-fade opacity-60"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse at center, var(--hero-glow) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto flex max-w-7xl flex-col items-start px-4 py-28 sm:px-6 md:py-40 lg:px-8">
        <div className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-brand">
          {t.notFound.tag}
        </div>
        <h1 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-balance md:text-6xl">
          {t.notFound.title}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
          {t.notFound.body}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 px-6 text-base">
            <Link href="/">
              {t.notFound.home}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-6 text-base"
          >
            <Link href="/services">{t.notFound.services}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
