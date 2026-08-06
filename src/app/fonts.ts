import { JetBrains_Mono, Manrope, Sora } from "next/font/google";

/**
 * Every font here is picked cyrillic-first, because everything the user reads
 * is Mongolian. Two gotchas, both of which have already bitten this repo:
 *
 *  1. Ө (U+04E8) and Ү (U+04AE) live in `cyrillic-ext`, NOT in `cyrillic`.
 *     Requesting only the `cyrillic` subset drops them.
 *  2. Declaring `cyrillic-ext` does not prove a family actually draws them —
 *     Onest and Wix Madefor Text both advertise the subset and ship neither
 *     letter. Manrope, Sora and JetBrains Mono were each checked by pulling
 *     the woff2 and reading its cmap; only Sora came back without them.
 *
 * So: never swap a family in here on the strength of its subset list alone.
 */

/**
 * UI + body copy. Semi-geometric grotesque chosen to sit with the Sora
 * wordmark; its Cyrillic is drawn as part of the family rather than bolted on.
 */
export const manrope = Manrope({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

/**
 * Monospace: the terminal mock in Hero, eyebrow labels, code. This is not
 * decorative — the terminal block sets Mongolian copy ("14 өдөрт"), and the
 * default system mono stack (Consolas, Liberation Mono, …) has no ө, so that
 * one letter used to fall out to a different family mid-line.
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

/**
 * Wordmark only. Sora is the family the brand book names, and the "Provision"
 * logotype is set in it.
 *
 * Sora ships `latin` + `latin-ext` and NO cyrillic, so it can never carry
 * Mongolian copy — a Cyrillic string set in Sora falls back to Manrope
 * glyph-by-glyph, which looks like a rendering bug rather than a font choice.
 * Keep it scoped to the Latin wordmark in Logo.tsx.
 */
export const sora = Sora({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-sora",
  display: "swap",
});
