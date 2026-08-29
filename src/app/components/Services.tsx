"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import {
  ArrowUpRight,
  Boxes,
  Brain,
  Code2,
  Palette,
  Server,
  Smartphone,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { useT } from "../i18n";

const serviceIcons: LucideIcon[] = [
  Code2,
  Brain,
  Smartphone,
  Server,
  Boxes,
  Palette,
  Workflow,
];

/**
 * Bento spans, checked against both breakpoints so no cell is left empty.
 *
 *   lg (3 cols): 2+1 / 1+2 / 2+1 / 3  = 12 cells over 4 full rows
 *   md (2 cols): 1+1 / 1+1 / 1+1 / 2  =  8 cells over 4 full rows
 *
 * The md entry on the last item is what closes the hole: seven single-span
 * cards in a two-column grid leaves one dead cell in the final row.
 */
const serviceSpans: string[] = [
  "lg:col-span-2",
  "lg:col-span-1",
  "lg:col-span-1",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-1",
  "md:col-span-2 lg:col-span-3",
];

export function Services() {
  const { t } = useT();

  return (
    <section
      id="services"
      className="relative scroll-mt-24 border-t border-border py-32 md:py-48"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 max-w-3xl">
          <div className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-brand">
            {t.services.tag}
          </div>
          <h2 className="font-display text-[clamp(1.85rem,3.4vw,2.9rem)] font-semibold leading-[1.1] tracking-tight">
            {t.services.title}
          </h2>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            {t.services.sub}
          </p>
        </div>

        <div className="grid auto-rows-fr grid-flow-dense grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {t.services.items.map((s, i) => {
            const Icon = serviceIcons[i];
            const span = serviceSpans[i];
            return (
              <div
                key={s.title}
                className={`${span} reveal group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/50 p-6 backdrop-blur transition-colors hover:border-primary/40 md:p-8`}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(109,70,255,0.18),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative mb-6 flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 transition-transform duration-500 ease-out group-hover:-translate-y-0.5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>

                <div className="relative mb-2 font-mono text-xs uppercase tracking-[0.15em] text-brand">
                  {s.short}
                </div>
                <h3 className="relative mb-2 font-display text-xl font-semibold tracking-tight">
                  {s.title}
                </h3>
                <p className="relative mb-5 text-muted-foreground">
                  {s.description}
                </p>

                <ul className="relative mt-auto flex flex-wrap gap-2">
                  {s.features.map((f) => (
                    <li
                      key={f}
                      className="rounded-md border border-border bg-secondary/40 px-2 py-1 font-mono text-xs text-muted-foreground"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-14">
          <Button asChild variant="outline" size="lg" className="rounded-full px-7">
            <Link href="/services">{t.services.detailBtn}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
