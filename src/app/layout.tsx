import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/app/providers";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/layout/CookieBanner";
import { getCategories } from "@/data/catalog/categories";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a3d8f",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Homara — Comparador de hogar y jardín en España",
    template: "%s | Homara",
  },
  description:
    "Compara productos para tu hogar y jardín: precios, características y opiniones reales. Encuentra la mejor oferta en electrodomésticos, terraza, decoración y más.",
  applicationName: "Homara",
  authors: [{ name: "Homara" }],
  generator: "Next.js",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: SITE_URL,
    siteName: "Homara",
    title: "Homara — Comparador de hogar y jardín en España",
    description:
      "Compara productos para tu hogar y jardín: precios, características y opiniones reales.",
    images: [{ url: "/homara-mascot.webp", width: 512, height: 512, alt: "Homara" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@homara_es",
    creator: "@homara_es",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetched once per request via tagged unstable_cache. Header + Footer share the same data.
  const categories = await safeGetCategories();

  return (
    <html lang="es" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Suspense fallback={<HeaderFallback />}>
              <Header categories={categories} />
            </Suspense>
            <div className="flex-1">{children}</div>
            <Footer categories={categories} />
          </div>
          <CookieBanner />
          <AnalyticsScripts />
        </Providers>
      </body>
    </html>
  );
}

async function safeGetCategories() {
  try {
    return await getCategories();
  } catch {
    // If Supabase env is missing locally we still want the layout to render.
    return [];
  }
}

function HeaderFallback() {
  return <div className="sticky top-0 z-50 h-[120px] bg-card border-b border-border" aria-hidden />;
}
