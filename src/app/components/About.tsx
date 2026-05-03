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

export function About() {
  const { t } = useT();

  return (
    <section
      id="about"
      className="relative py-24 md:py-32 border-t border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">
              {t.about.tag}
            </div>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-6">
              {t.about.title1}
              <br />
              {t.about.title2}
            </h2>
            <p className="text-lg text-muted-foreground mb-4">{t.about.p1}</p>
            <p className="text-lg text-muted-foreground mb-8">{t.about.p2}</p>
            <ul className="space-y-3 font-mono text-sm">
              {t.about.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {t.about.stats.map((stat, i) => {
              const Icon = statIcons[i];
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border bg-card/50 backdrop-blur p-6"
                >
                  <Icon className="h-5 w-5 text-accent mb-6" />
                  <div className="text-4xl md:text-5xl font-semibold tracking-tight mb-1">
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
