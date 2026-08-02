import type { Metadata, Viewport } from "next";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { LanguageProvider } from "./i18n";
import { QuoteProvider } from "./quote-context";
import { inter, poppins } from "./fonts";
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
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0A0A1F", // Deep Navy
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
      className={`dark ${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen">
        <LanguageProvider>
          <QuoteProvider>
            <Header />
            {children}
            <Footer />
          </QuoteProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
