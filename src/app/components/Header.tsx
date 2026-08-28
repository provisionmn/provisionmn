"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Logo } from "./Logo";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useT } from "../i18n";

export function Header() {
  const { t, lang, toggleLang } = useT();
  const pathname = usePathname();
  const router = useRouter();
  const onHome = pathname === "/";

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
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  // Scrollspy for the one-page nav. The margins collapse the viewport to a
  // band just under the sticky header, so normally one section qualifies;
  // when two do, the earlier one in `ids` wins, which is document order.
  useEffect(() => {
    if (!onHome) {
      setActiveId("");
      return;
    }
    const ids = ["services", "products", "portfolio", "about", "contact"];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        setActiveId(ids.find((id) => visible.has(id)) ?? "");
      },
      { rootMargin: "-72px 0px -70% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [onHome]);

  const toggleTheme = () => setIsDark((v) => !v);

  // On the landing page the section is already mounted, so scroll to it
  // directly. Anywhere else, route home with the hash and let the browser
  // handle the jump once the section renders.
  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (!onHome) {
      router.push(`/${href}`);
      return;
    }
    const el = document.getElementById(href.replace("#", ""));
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const langLabel = lang === "mn" ? "EN" : "MN";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" aria-label="Provision Solutions — нүүр хуудас">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = activeId === link.href.slice(1);
              return (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  aria-current={active ? "true" : undefined}
                  className={`relative py-1 text-sm transition-colors ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-brand transition-transform duration-200 ${
                      active ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </button>
              );
            })}
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
            {navLinks.map((link) => {
              const active = activeId === link.href.slice(1);
              return (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  aria-current={active ? "true" : undefined}
                  className={`block w-full text-left text-sm transition-colors py-2 ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
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
