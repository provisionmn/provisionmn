import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useT } from "../i18n";

export function Header() {
  const { t, lang, toggleLang } = useT();

  const navLinks = [
    { href: "#services", label: t.nav.services },
    { href: "#products", label: t.nav.products },
    { href: "#portfolio", label: t.nav.portfolio },
    { href: "#about", label: t.nav.about },
    { href: "#contact", label: t.nav.contact },
  ];

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  const toggleTheme = () => setIsDark((v) => !v);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.getElementById(href.replace("#", ""));
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const langLabel = lang === "mn" ? "EN" : "MN";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#home" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="font-mono font-semibold text-primary">P</span>
            </div>
            <span className="font-semibold tracking-tight">provision.mn</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="h-9 px-2.5 font-mono text-xs"
              aria-label="Toggle language"
            >
              {langLabel}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-9 w-9 p-0"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button size="sm" onClick={() => scrollTo("#contact")} className="h-9">
              {t.nav.cta}
            </Button>
          </div>

          <div className="md:hidden flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="h-9 px-2.5 font-mono text-xs"
              aria-label="Toggle language"
            >
              {langLabel}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-9 w-9 p-0"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileOpen((v) => !v)}
              className="h-9 w-9 p-0"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="block w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                {link.label}
              </button>
            ))}
            <Button
              size="sm"
              onClick={() => scrollTo("#contact")}
              className="w-full"
            >
              {t.nav.cta}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
