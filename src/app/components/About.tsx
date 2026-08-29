"use client";

import type { CSSProperties } from "react";
import {
  ArrowRight,
  Award,
  ShieldCheck,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useT } from "../i18n";

const statIcons: LucideIcon[] = [Zap, Users, Award, ShieldCheck];

/**
 * Pills set inside the heading. Both ids are already used by Portfolio, so
 * they are known to resolve; they are decoration, hence aria-hidden and no
 * alt text. Sized down at the CDN because they render about 90px wide.
 */
const headingPills: string[] = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=320&h=160&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=320&h=160&fit=crop",
];

export function About() {
  const { t } = useT();

  return (
    <section
      id="about"
      className="relative scroll-mt-24 border-t border-border py-32 md:py-48"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-7">
            <div className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-brand">
              {t.about.tag}
            </div>

            {/* Pills are inline-block spans sized in em, so they scale with
                the clamp instead of breaking the line box at small widths. */}
            <h2 className="mb-8 font-display text-[clamp(1.85rem,3.6vw,3rem)] font-semibold leading-[1.15] tracking-tight">
              {t.about.title1}
              <span
                aria-hidden
                className="mx-2 inline-block h-[0.68em] w-[1.85em] translate-y-[0.02em] rounded-full bg-cover bg-center align-middle ring-1 ring-border"
                style={{ backgroundImage: `url(${headingPills[0]})` }}
              />
              <br />
              {t.about.title2}
              <span
                aria-hidden
                className="ml-2 inline-block h-[0.68em] w-[1.85em] translate-y-[0.02em] rounded-full bg-cover bg-center align-middle ring-1 ring-border"
                style={{ backgroundImage: `url(${headingPills[1]})` }}
              />
            </h2>

            {/* Word-level scrub. Each word carries its index; globals.css turns
                that into a staggered slice of the paragraph's view timeline. */}
            <p className="scrub mb-4 text-lg text-muted-foreground">
              {t.about.p1.split(" ").map((word, i) => (
                <span
                  key={`${word}-${i}`}
                  style={{ "--i": i } as CSSProperties}
                >
                  {word}{" "}
                </span>
              ))}
            </p>
            <p className="mb-10 text-lg text-muted-foreground">{t.about.p2}</p>

            <ul className="space-y-3 font-mono text-sm">
              {t.about.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span className="text-muted-foreground">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:col-span-5">
            {t.about.stats.map((stat, i) => {
              const Icon = statIcons[i];
              return (
                <div
                  key={stat.label}
                  className="reveal rounded-2xl border border-border bg-card/50 p-6 backdrop-blur"
                >
                  <Icon className="mb-6 h-5 w-5 text-brand" />
                  <div className="mb-1 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
