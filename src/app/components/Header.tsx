"use client";

import { useEffect, useRef, useState } from "react";
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
  const menuId = "site-menu";
  const pillRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // A menu that only closes via its own button is a trap on a phone: the
  // first instinct is to tap the page, and the second is Escape.
  useEffect(() => {
    if (!mobileOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (pillRef.current?.contains(target)) return;
      setMobileOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [mobileOpen]);

  // Navigating away leaves the panel open over the new page otherwise.
  // Route changes close the existing mobile panel after navigation.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  // Scrollspy for the one-page nav. The margins collapse the viewport to a
  // band just under the sticky header, so normally one section qualifies;
  // when two do, the earlier one in `ids` wins, which is document order.
  useEffect(() => {
    if (!onHome) {
      // Clear the landing-page observer state on other routes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    // Floating glass pill. The header itself stays transparent and only pads;
    // the pill is the child, so page content slides underneath the gap rather
    // than butting against a full-bleed bar.
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      {/* Scroll edge, not a divider: the pill floats clear of the top, so
          without this, page content is visible sliding through the gap above
          it. A short fade to the page colour reads as the content passing
          under the chrome. Sits behind the pill inside the header's own
          stacking context. */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-background via-background/80 to-transparent"
        aria-hidden
      />
      <div
        ref={pillRef}
        className="mx-auto max-w-6xl rounded-full border border-border bg-background/60 elev-2 backdrop-blur-xl"
      >
        <div className="flex h-14 items-center justify-between pl-5 pr-2.5">
          <Link href="/" aria-label="Provision Solutions — нүүр хуудас">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const active = activeId === link.href.slice(1);
              return (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  aria-current={active ? "location" : undefined}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          <div className="hidden items-center gap-1 md:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="h-9 rounded-full px-2.5 font-mono text-xs"
              aria-label="Хэл солих"
            >
              {langLabel}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-full p-0"
              aria-label="Гэрэл/бараан горим солих"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => scrollTo("#contact")}
              className="h-9 rounded-full px-4"
            >
              {t.nav.cta}
            </Button>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="h-9 rounded-full px-2.5 font-mono text-xs"
              aria-label="Хэл солих"
            >
              {langLabel}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-full p-0"
              aria-label="Гэрэл/бараан горим солих"
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
              className="h-9 w-9 rounded-full p-0"
              aria-label={mobileOpen ? "Цэс хаах" : "Цэс нээх"}
              aria-expanded={mobileOpen}
              aria-controls={menuId}
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
        <div
          id={menuId}
          ref={menuRef}
          className="mx-auto mt-2 max-w-6xl rounded-3xl border border-border bg-background/90 p-3 elev-3 backdrop-blur-xl md:hidden"
        >
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = activeId === link.href.slice(1);
              return (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  aria-current={active ? "location" : undefined}
                  className={`block w-full rounded-2xl px-4 py-3 text-left text-sm transition-colors ${
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>
          <Button
            size="sm"
            onClick={() => scrollTo("#contact")}
            className="mt-2 h-10 w-full rounded-2xl"
          >
            {t.nav.cta}
          </Button>
        </div>
      )}
    </header>
  );
}
