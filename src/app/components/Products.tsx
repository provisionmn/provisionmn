"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Landmark,
  ShoppingBag,
  Sparkles,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { useT } from "../i18n";

type ProductStatus = "Production" | "Beta" | "Early access";

interface ProductBrand {
  name: string;
  icon: LucideIcon;
  status: ProductStatus;
  stack: string[];
}

const featuredBrand: ProductBrand = {
  name: "Credix",
  icon: Landmark,
  status: "Production",
  stack: [
    "Odoo 17",
    "Python",
    "PostgreSQL",
    "pgvector",
    "Claude API",
    "Next.js",
    "Docker",
  ],
};

const productBrands: ProductBrand[] = [
  {
    name: "Stockix",
    icon: Warehouse,
    status: "Production",
    stack: ["Odoo 17", "Python", "TimescaleDB", "MQTT"],
  },
  {
    name: "Retailix",
    icon: ShoppingBag,
    status: "Production",
    stack: ["Odoo 17", "React Native", "Python", "Redis"],
  },
];

function StatusBadge({ status }: { status: ProductStatus }) {
  const isLive = status === "Production";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider ${
        isLive
          ? "border-success/30 bg-success/10 text-success"
          : "border-brand/30 bg-brand/10 text-brand"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isLive ? "bg-success" : "bg-brand"
        } animate-pulse`}
      />
      {status}
    </span>
  );
}

export function Products() {
  const { t } = useT();
  const FeaturedIcon = featuredBrand.icon;

  return (
    <section
      id="products"
      className="relative scroll-mt-24 border-t border-border py-32 md:py-48"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 max-w-3xl">
          <div className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-brand">
            {t.products.tag}
          </div>
          <h2 className="font-display text-[clamp(1.85rem,3.4vw,2.9rem)] font-semibold leading-[1.1] tracking-tight">
            {t.products.title}
          </h2>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            {t.products.sub}
          </p>
        </div>

        {/*
          Card stack. Two sticky layers rather than three: the flagship card
          is the tall one, so it has to arrive last — a taller card stuck
          underneath a shorter one hangs its bottom edge out below the stack.
          The two smaller products therefore share one layer side by side and
          Credix lands on top of them.

          Both layers are opaque (`bg-card`, not `bg-card/50`); a translucent
          card in a stack shows the card beneath it through the fill and the
          whole thing reads as a z-index bug.

          Nothing in this subtree may take `overflow: hidden` — that makes a
          scroll container and silently kills the sticky positioning.
        */}
        <div className="space-y-6 pb-8 lg:space-y-10">
          <div className="sticky top-24 z-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {productBrands.map((brand, i) => {
              const Icon = brand.icon;
              const copy = t.products.items[i];
              return (
                <article
                  key={brand.name}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-xl transition-colors hover:border-primary/40 md:p-8 lg:min-h-[30rem]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(109,70,255,0.16),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative flex flex-1 flex-col">
                    <div className="mb-6 flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={brand.status} />
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                      </div>
                    </div>

                    <h3 className="mb-2 font-display text-2xl font-semibold tracking-tight">
                      {brand.name}
                    </h3>
                    <p className="mb-2 text-base text-foreground">
                      {copy.tagline}
                    </p>
                    <p className="mb-5 text-sm text-muted-foreground">
                      {copy.description}
                    </p>

                    <ul className="mb-5 space-y-2">
                      {copy.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto flex flex-wrap gap-1.5">
                      {brand.stack.map((s) => (
                        <span
                          key={s}
                          className="rounded-md border border-border px-2 py-1 font-mono text-xs text-muted-foreground"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <article className="sticky top-32 z-20 overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-2xl md:p-10 lg:min-h-[32rem]">
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              aria-hidden
              style={{
                background:
                  "radial-gradient(circle at 85% 0%, rgba(109,70,255,0.28), transparent 55%), radial-gradient(circle at 15% 100%, rgba(37,99,235,0.16), transparent 55%)",
              }}
            />

            <div className="relative">
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-gradient-to-br from-primary/20 to-accent/10">
                  <FeaturedIcon className="h-7 w-7 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-brand">
                    <Sparkles className="h-3 w-3" />
                    {t.products.flagship}
                  </div>
                  <h3 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                    {featuredBrand.name}
                  </h3>
                </div>
                <StatusBadge status={featuredBrand.status} />
              </div>

              <p className="mb-4 text-xl text-foreground">
                {t.products.featured.tagline}
              </p>
              <p className="mb-8 max-w-3xl text-muted-foreground">
                {t.products.featured.description}
              </p>

              <div className="mb-8 grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
                {t.products.featured.features.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-brand" />
                    <span className="text-sm text-foreground/90">{f}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {featuredBrand.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-border bg-secondary/40 px-2.5 py-1 font-mono text-xs text-muted-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
