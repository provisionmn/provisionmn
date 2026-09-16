"use client";

import Link from "next/link";
import { Github, Linkedin, Mail, Twitter, type LucideIcon } from "lucide-react";
import { Logo } from "./Logo";
import { useT } from "../i18n";

/**
 * Destinations live here rather than in the dictionary because they are the
 * same in every language. `href: null` means "no destination published yet" —
 * those entries render as plain text instead of a link, so the footer never
 * ships an `href="#"` that silently does nothing.
 */
const socials: { icon: LucideIcon; label: string; href: string | null }[] = [
  { icon: Mail, label: "Email", href: "mailto:hello@provision.mn" },
  { icon: Github, label: "GitHub", href: null },
  { icon: Linkedin, label: "LinkedIn", href: null },
  { icon: Twitter, label: "Twitter", href: null },
];

// Indexed against `t.footer.companyLinks` / `t.footer.serviceLinks`.
const companyHrefs: (string | null)[] = ["/#about", "/#portfolio", null, null];
const serviceHref = "/#services";

export function Footer() {
  const { t } = useT();
  const year = new Date().getFullYear();
  const rights = t.footer.rights.replace("{year}", String(year));

  return (
    <footer className="relative border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Logo className="mb-4" />
            <p className="text-sm text-muted-foreground max-w-md mb-6 text-pretty">
              {t.footer.tagline}
            </p>
            <div className="flex items-center gap-3 text-muted-foreground">
              {socials
                .filter((s) => s.href)
                .map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href as string}
                    className="rounded-md hover:text-foreground transition-colors"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              {t.footer.services}
            </h3>
            <ul className="space-y-3 text-sm">
              {t.footer.serviceLinks.map((s) => (
                <li key={s}>
                  <Link
                    href={serviceHref}
                    className="text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              {t.footer.company}
            </h3>
            <ul className="space-y-3 text-sm">
              {t.footer.companyLinks.map((c, i) => (
                <li key={c}>
                  {companyHrefs[i] ? (
                    <Link
                      href={companyHrefs[i] as string}
                      className="text-foreground/80 hover:text-foreground transition-colors"
                    >
                      {c}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground/60">{c}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs font-mono text-muted-foreground">{rights}</p>
          {/* Terms and privacy have no pages yet; shown as plain text until
              real copy exists rather than as links that go nowhere. */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground/60">
            <span>{t.footer.terms}</span>
            <span>{t.footer.privacy}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
