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
      className="relative py-24 md:py-32 border-t border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">
            {t.portfolio.tag}
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
            {t.portfolio.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t.portfolio.sub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.portfolio.projects.map((p, i) => (
            <article
              key={p.title}
              className="group relative rounded-2xl border border-border bg-card/50 backdrop-blur overflow-hidden hover:border-primary/40 transition-colors"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <ImageWithFallback
                  src={projectImages[i]}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center rounded-md border border-border bg-background/70 backdrop-blur px-2 py-1 text-xs font-mono uppercase tracking-wider text-foreground">
                    {p.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {p.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {projectTech[i].map((tech) => (
                    <span
                      key={tech}
                      className="text-xs font-mono px-2 py-1 rounded-md border border-border text-muted-foreground"
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
