import { Geologica, JetBrains_Mono, Manrope, Sora } from "next/font/google";

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
 * Display face: h1/h2 only, via the `font-display` utility. Manrope still
 * carries every paragraph, label and button.
 *
 * Geologica replaced Geist. It has more character, and its geometric round
 * shapes sit with the chevron mark. Checked the usual way before the switch
 * (Google's font file, U+04E8/04E9/04AE/04AF in its cmap): all four present,
 * 178 Cyrillic glyphs. Unlike Geist, Next's font metadata lists `cyrillic-ext`
 * for Geologica, so the subset can be named and Ө/Ү get a preload tag instead
 * of flashing in Manrope on a cold load.
 */
export const geologica = Geologica({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-geologica",
  display: "swap",
});

/*
 * Previous display face, kept as a note for whoever revisits this choice:
 *
 * Geist is the only family out of the four this redesign could pick from that
 * can set Mongolian at all. Checked the usual way — pull the woff2 Google
 * actually serves and read its cmap, never trust the advertised subset list:
 *
 *   Satoshi          472 glyphs, 0 in U+04xx   (Fontshare, not on Google)
 *   Cabinet Grotesk  442 glyphs, 0 in U+04xx   (Fontshare, not on Google)
 *   Outfit           latin + latin-ext only
 *   Geist            cyrillic 107 + cyrillic-ext 40, and the ext slice really
 *                    does contain Ө ө Ү ү
 *
 * The first two are not on Google Fonts at all, so `next/font/google` could
 * not fetch them even if they had the glyphs.
 *
 * `cyrillic-ext` is missing below on purpose, and it is NOT the bug it looks
 * like. Next's bundled font metadata lists Geist as latin/latin-ext/cyrillic,
 * so naming the ext subset fails typecheck and then the build. It does not
 * need naming: `getGoogleFontsUrl` never sends `&subset=`, so the CSS comes
 * back with every subset Google has, and `findFontFilesInCss` downloads and
 * emits all of them — `subsets` only decides which files get a preload tag.
 * The cyrillic-ext woff2 therefore ships and the browser selects it by
 * unicode-range; Ө and Ү just are not preloaded, so with `display: "swap"`
 * they can flash in Manrope on a cold load. That is the whole cost.
 *
 * Verify after any Next upgrade by rebuilding and re-reading the cmaps of
 * .next/static/media/*.woff2 — see the snippet in CLAUDE.md.
 */

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
