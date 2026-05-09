import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/app/providers";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/layout/CookieBanner";
import { JsonLd } from "@/components/seo/JsonLd";
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
    default: "Homara — Comparador de hogar y jardín",
    template: "%s | Homara",
  },
  description:
    "Comparador editorial de productos para hogar y jardín. Reseñas, rankings y precios reales en electrodomésticos, terraza, decoración y muebles.",
  applicationName: "Homara",
  authors: [{ name: "Equipo editorial Homara" }],
  publisher: "Homara",
  generator: "Next.js",
  category: "Hogar y jardín",
  keywords: [
    "comparador hogar",
    "comparador jardín",
    "ofertas hogar",
    "guías de compra",
    "electrodomésticos",
    "terraza",
    "muebles",
    "decoración",
  ],
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
    title: "Homara — Comparador de hogar y jardín",
    description:
      "Reseñas y comparativas editoriales de productos para hogar y jardín, con datos concretos y precios actualizados.",
    images: [
      { url: "/homara-mascot.webp", width: 512, height: 512, alt: "Mascota de Homara" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@homara_es",
    creator: "@homara_es",
    title: "Homara — Comparador de hogar y jardín",
    description: "Reseñas y comparativas editoriales con datos concretos.",
    images: ["/homara-mascot.webp"],
  },
  alternates: {
    canonical: "/",
    languages: {
      es: "/",
      "x-default": "/",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
};

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Homara",
  alternateName: "Homara — Comparador de hogar y jardín",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/homara-logo.svg`,
    width: 512,
    height: 512,
  },
  image: `${SITE_URL}/homara-mascot.webp`,
  description:
    "Comparador editorial independiente de productos para hogar y jardín. Reseñas con datos concretos, comparativas y rankings.",
  foundingDate: "2025",
  areaServed: { "@type": "Place", name: "Hispanohablantes" },
  knowsLanguage: ["es"],
  sameAs: ["https://twitter.com/homara_es"],
};

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Homara",
  inLanguage: "es",
  publisher: { "@id": `${SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/buscar?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetched once per request via tagged unstable_cache. Header + Footer share the same data.
  const categories = await safeGetCategories();

  return (
    <html lang="es" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <JsonLd data={ORGANIZATION_SCHEMA} />
        <JsonLd data={WEBSITE_SCHEMA} />
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
