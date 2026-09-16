"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useT } from "../i18n";

/**
 * The objections buyers raise before hiring an agency, answered in their own
 * words. Native <details> so it works with no JS, keyboard and screen readers
 * included; the open animation lives in globals.css (`.faq-answer`).
 */
export function Faq() {
  const { t } = useT();

  return (
    <section id="faq" className="relative scroll-mt-24 py-32 md:py-48">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-brand">
          {t.faq.tag}
        </div>
        <h2 className="font-display text-[clamp(1.85rem,3.4vw,2.9rem)] font-semibold leading-[1.1] tracking-display">
          {t.faq.title}
        </h2>

        <div className="mt-14 border-t border-border">
          {t.faq.items.map((item, i) => (
            <div
              key={item.q}
              style={{ "--i": i } as CSSProperties}
              className="reveal reveal-stagger border-b border-border"
            >
              <details className="group">
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 rounded-lg py-6 text-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <Plus
                    strokeWidth={1.5}
                    className="h-5 w-5 shrink-0 translate-y-1 text-brand transition-transform duration-300 ease-out-strong group-open:rotate-45"
                    aria-hidden
                  />
                </summary>
                <p className="faq-answer max-w-[60ch] pb-7 pr-10 text-muted-foreground">
                  {item.a}
                </p>
              </details>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <Button
            asChild
            size="lg"
            className="group h-12 rounded-full py-0 pl-7 pr-1.5 text-base"
          >
            <Link href="/calculator">
              {t.faq.cta}
              <span className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/15 transition-transform duration-300 ease-out-strong group-hover:translate-x-0.5">
                <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
