import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import { useT } from "../i18n";

export function Footer() {
  const { t } = useT();
  const year = new Date().getFullYear();
  const rights = t.footer.rights.replace("{year}", String(year));

  return (
    <footer className="relative border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="font-mono font-semibold text-primary">P</span>
              </div>
              <span className="font-semibold tracking-tight">provision.mn</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              {t.footer.tagline}
            </p>
            <div className="flex items-center gap-3 text-muted-foreground">
              <a
                href="mailto:hello@provision.mn"
                className="hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              {t.footer.services}
            </h3>
            <ul className="space-y-3 text-sm">
              {t.footer.serviceLinks.map((s) => (
                <li key={s}>
                  <a
                    href="#services"
                    className="text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              {t.footer.company}
            </h3>
            <ul className="space-y-3 text-sm">
              {t.footer.companyLinks.map((c) => (
                <li key={c}>
                  <a
                    href="#"
                    className="text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {c}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs font-mono text-muted-foreground">{rights}</p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              {t.footer.terms}
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              {t.footer.privacy}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
