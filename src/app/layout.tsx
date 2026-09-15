import type { Metadata, Viewport } from "next";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { SkipLink } from "./components/SkipLink";
import { LanguageProvider } from "./i18n";
import { QuoteProvider } from "./quote-context";
import { geologica, jetbrainsMono, manrope, sora } from "./fonts";
import "../styles/index.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://provisionmn.vercel.app"),
  title: {
    default: "Provision.mn — Инженерийн студи",
    template: "%s · Provision.mn",
  },
  description:
    "Fullstack, mobile, AI, DevOps, security, Odoo, UX/UI — нэг багаар technology stack-ийн бүх давхаргыг.",
  openGraph: {
    type: "website",
    locale: "mn_MN",
    siteName: "Provision.mn",
    title: "Provision.mn — Инженерийн студи",
    description:
      "Fullstack, mobile, AI, DevOps, security, Odoo, UX/UI — нэг багаар technology stack-ийн бүх давхаргыг.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0B0F1A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // `dark` is the default theme; Header mutates this class at runtime, hence
    // suppressHydrationWarning. `lang` is likewise rewritten by LanguageProvider.
    <html
      lang="mn"
      className={`dark ${manrope.variable} ${geologica.variable} ${jetbrainsMono.variable} ${sora.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen w-full max-w-full overflow-x-hidden">
        <LanguageProvider>
          <QuoteProvider>
            <SkipLink />
            <Header />
            {children}
            <Footer />
          </QuoteProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
