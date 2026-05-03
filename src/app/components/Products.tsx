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
          ? "border-[#27C93F]/30 bg-[#27C93F]/10 text-[#27C93F]"
          : "border-accent/30 bg-accent/10 text-accent"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isLive ? "bg-[#27C93F]" : "bg-accent"
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
      className="relative py-24 md:py-32 border-t border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">
            {t.products.tag}
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
            {t.products.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t.products.sub}</p>
        </div>

        <article className="relative rounded-2xl border border-border bg-card/50 backdrop-blur p-8 md:p-10 overflow-hidden group hover:border-primary/40 transition-colors">
          <div
            className="absolute inset-0 pointer-events-none opacity-70"
            aria-hidden
            style={{
              background:
                "radial-gradient(circle at 85% 0%, rgba(124,110,255,0.18), transparent 55%), radial-gradient(circle at 15% 100%, rgba(34,211,238,0.1), transparent 55%)",
            }}
          />

          <div className="relative">
            <div className="flex flex-wrap items-start gap-4 mb-6">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30">
                <FeaturedIcon className="h-7 w-7 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent inline-flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    {t.products.flagship}
                  </div>
                </div>
                <h3 className="text-3xl md:text-4xl font-semibold tracking-tight">
                  {featuredBrand.name}
                </h3>
              </div>
              <StatusBadge status={featuredBrand.status} />
            </div>

            <p className="text-xl text-foreground mb-4">
              {t.products.featured.tagline}
            </p>
            <p className="text-muted-foreground max-w-3xl mb-8">
              {t.products.featured.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-8">
              {t.products.featured.features.map((f) => (
                <div key={f} className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 text-accent mt-1 shrink-0" />
                  <span className="text-sm text-foreground/90">{f}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {featuredBrand.stack.map((s) => (
                <span
                  key={s}
                  className="text-xs font-mono px-2.5 py-1 rounded-md border border-border bg-secondary/40 text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </article>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {productBrands.map((brand, i) => {
            const Icon = brand.icon;
            const copy = t.products.items[i];
            return (
              <article
                key={brand.name}
                className="group relative rounded-2xl border border-border bg-card/50 backdrop-blur p-6 md:p-8 overflow-hidden hover:border-primary/40 transition-colors"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_50%_0%,rgba(124,110,255,0.1),transparent_60%)]" />

                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10 border border-primary/20">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={brand.status} />
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold tracking-tight mb-2">
                    {brand.name}
                  </h3>
                  <p className="text-base text-foreground mb-2">{copy.tagline}</p>
                  <p className="text-sm text-muted-foreground mb-5">
                    {copy.description}
                  </p>

                  <ul className="space-y-2 mb-5">
                    {copy.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <ArrowRight className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-1.5">
                    {brand.stack.map((s) => (
                      <span
                        key={s}
                        className="text-xs font-mono px-2 py-1 rounded-md border border-border text-muted-foreground"
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
      </div>
    </section>
  );
}
