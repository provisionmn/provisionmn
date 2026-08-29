"use client";

import { ArrowUpRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useT } from "../i18n";

const projectImages: string[] = [
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=500&fit=crop",
];

const projectTech: string[][] = [
  ["Claude", "pgvector", "Next.js", "Python"],
  ["Next.js", "Postgres", "Stripe", "Redis"],
  ["React Native", "Supabase", "MapLibre"],
  ["Kubernetes", "Terraform", "ArgoCD", "Grafana"],
  ["Odoo 17", "Python", "Postgres", "Docker"],
  ["Power Automate", "Excel", "SharePoint", "Outlook"],
  ["Power Automate", "Odoo", "Excel", "SQL"],
  ["Power Automate", "Excel", "Teams", "Email"],
];

export function Portfolio() {
  const { t } = useT();

  return (
    <section
      id="portfolio"
      className="relative scroll-mt-24 border-t border-border py-32 md:py-48"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 max-w-3xl">
          <div className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-brand">
            {t.portfolio.tag}
          </div>
          <h2 className="font-display text-[clamp(1.85rem,3.4vw,2.9rem)] font-semibold leading-[1.1] tracking-tight">
            {t.portfolio.title}
          </h2>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            {t.portfolio.sub}
          </p>
        </div>

        {/*
          Horizontal accordion, desktop only. The expanded copy is always in
          the DOM and only faded out, so a screen reader still reads every
          project from the collapsed state; `tabIndex` plus focus-visible
          expansion covers keyboard users, who would otherwise be the one
          group that can reach this layout and not open it.

          The inner content block is a fixed width rather than a fluid one so
          the text does not reflow line by line while the slice grows.
        */}
        <div className="hidden h-[34rem] gap-2 lg:flex">
          {t.portfolio.projects.map((p, i) => (
            <article
              key={p.title}
              tabIndex={0}
              className="group/slice relative isolate h-full min-w-0 flex-1 basis-0 grow overflow-hidden rounded-2xl border border-border transition-[flex-grow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:grow-[3.6] focus-visible:grow-[3.6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ImageWithFallback
                src={projectImages[i]}
                alt={p.title}
                className="absolute inset-0 h-full w-full scale-105 object-cover brightness-[0.32] contrast-125 grayscale transition-all duration-700 ease-out group-hover/slice:scale-100 group-hover/slice:brightness-[0.62] group-hover/slice:grayscale-0 group-focus-within/slice:scale-100 group-focus-within/slice:brightness-[0.62] group-focus-within/slice:grayscale-0"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-transparent"
                aria-hidden
              />

              <div className="absolute bottom-0 left-0 p-5 transition-opacity duration-300 group-hover/slice:opacity-0 group-focus-within/slice:opacity-0">
                <span className="rotate-180 font-mono text-xs uppercase tracking-[0.22em] text-foreground/90 [writing-mode:vertical-rl]">
                  {p.category}
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 w-[24rem] max-w-full p-6 opacity-0 transition-opacity delay-150 duration-500 group-hover/slice:opacity-100 group-focus-within/slice:opacity-100">
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-brand">
                  {p.category}
                </span>
                <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {p.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {projectTech[i].map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md border border-border bg-background/60 px-2 py-1 font-mono text-xs text-muted-foreground backdrop-blur"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Below lg the accordion has no room to open, so the same projects
            render as cards. The scroll-driven scale/fade lives on a wrapper,
            not on the img — an animation on transform would otherwise beat
            the hover transition on the same property. */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden">
          {t.portfolio.projects.map((p, i) => (
            <article
              key={p.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur transition-colors hover:border-primary/40"
            >
              <div className="media-scroll relative aspect-[16/10] overflow-hidden">
                <ImageWithFallback
                  src={projectImages[i]}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute left-4 top-4">
                  <span className="inline-flex items-center rounded-md border border-border bg-background/70 px-2 py-1 font-mono text-xs uppercase tracking-wider text-foreground backdrop-blur">
                    {p.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    {p.title}
                  </h3>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  {p.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {projectTech[i].map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md border border-border px-2 py-1 font-mono text-xs text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
