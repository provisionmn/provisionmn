"use client";

import { useT } from "../i18n";

/**
 * Hidden until focused, then pinned over the sticky header. Keyboard users
 * would otherwise tab the whole nav on every route before reaching content.
 */
export function SkipLink() {
  const { t } = useT();

  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:border focus:border-border focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:text-foreground focus:outline-none focus:ring-[3px] focus:ring-ring/50"
    >
      {t.a11y.skip}
    </a>
  );
}
