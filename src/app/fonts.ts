import { Inter, Sora } from "next/font/google";

/**
 * UI + body type. Everything the user reads is Mongolian Cyrillic, so the
 * body family is chosen for its cyrillic coverage first: the cyrillic subsets
 * are what render Ө and Ү — do not drop them, and do not swap in a family
 * without that coverage.
 */
export const inter = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Wordmark only. Sora is the family named in the brand book's typography
 * panel, and the "Provision" logotype is set in it.
 *
 * Sora ships `latin` + `latin-ext` and NO cyrillic subset, so it can never
 * carry Mongolian copy — a Cyrillic string set in Sora silently falls back to
 * Inter glyph-by-glyph, which looks like a rendering bug rather than a font
 * choice. Keep it scoped to the Latin wordmark in Logo.tsx; Inter stays the
 * family for every heading and paragraph on the site.
 */
export const sora = Sora({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-sora",
  display: "swap",
});
