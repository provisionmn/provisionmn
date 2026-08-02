import { Inter, Poppins } from "next/font/google";

/**
 * UI + body type. The brand book's typography panel (section 06) specifies a
 * neutral grotesque and a Bold / SemiBold / Medium / Regular weight ladder
 * without naming a family; Inter matches the specimen and maps 1:1 onto that
 * ladder at 700/600/500/400.
 *
 * The cyrillic subsets are what render Ө and Ү — do not drop them.
 */
export const inter = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Wordmark only. The "Provision" logotype is set in a geometric sans with
 * circular bowls; Poppins is the closest widely-available match. Poppins has
 * NO cyrillic subset, so it must never be applied to Mongolian copy — keep it
 * scoped to the Latin wordmark in Logo.tsx.
 */
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-poppins",
  display: "swap",
});
