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

const serviceSpans: string[] = [
  "lg:col-span-2",
  "lg:col-span-1",
  "lg:col-span-1",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-1",
  "lg:col-span-3",
];

interface ServicesProps {
  onShowDetail?: () => void;
}

export function Services({ onShowDetail }: ServicesProps) {
  const { t } = useT();

  return (
    <section
      id="services"
      className="relative py-24 md:py-32 border-t border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">
            {t.services.tag}
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
            {t.services.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t.services.sub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.services.items.map((s, i) => {
            const Icon = serviceIcons[i];
            const span = serviceSpans[i];
            return (
              <div
                key={s.title}
                className={`${span} group relative rounded-2xl border border-border bg-card/50 backdrop-blur p-6 md:p-8 hover:border-primary/40 transition-colors overflow-hidden`}
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_50%_0%,rgba(124,110,255,0.12),transparent_60%)]" />

                <div className="relative flex items-start justify-between mb-6">
                  <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10 border border-primary/20">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </div>

                <div className="relative font-mono text-xs uppercase tracking-[0.15em] text-accent mb-2">
                  {s.short}
                </div>
                <h3 className="relative text-xl font-semibold mb-2">
                  {s.title}
                </h3>
                <p className="relative text-muted-foreground mb-5">
                  {s.description}
                </p>

                <ul className="relative flex flex-wrap gap-2">
                  {s.features.map((f) => (
                    <li
                      key={f}
                      className="text-xs font-mono px-2 py-1 rounded-md border border-border bg-secondary/40 text-muted-foreground"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {onShowDetail && (
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" onClick={onShowDetail}>
              {t.services.detailBtn}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
