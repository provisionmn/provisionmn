"use client";

import Link from "next/link";
import { Github, Mail, type LucideIcon } from "lucide-react";
import { Logo } from "./Logo";
import { useT } from "../i18n";

// Only publish destinations confirmed by the owner (PRO-98).
const socials: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: Mail, label: "Email", href: "mailto:ceo@provision.mn" },
  { icon: Github, label: "GitHub", href: "https://github.com/provisionmn" },
];

const companyLinks = [
  { key: "about", href: "/#about" },
  { key: "portfolio", href: "/#portfolio" },
] as const;
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
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
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
              {companyLinks.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {t.footer.companyLinks[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Policy links can be added once the owner supplies approved copy. */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-xs font-mono text-muted-foreground">{rights}</p>
        </div>
      </div>
    </footer>
  );
}
