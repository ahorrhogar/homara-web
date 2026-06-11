import { Suspense } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { GoogleAnalyticsMount } from "@/components/analytics/GoogleAnalyticsMount";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/layout/CookieBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategories } from "@/data/catalog/categories";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Enables static rendering for this segment under next-intl.
  setRequestLocale(locale);

  // Fetched once per request via tagged unstable_cache. Header + Footer share it.
  const categories = await safeGetCategories();

  return (
    <NextIntlClientProvider>
      <JsonLd data={ORGANIZATION_SCHEMA} />
      <JsonLd data={WEBSITE_SCHEMA} />
      <div className="min-h-screen flex flex-col">
        <Suspense fallback={<HeaderFallback />}>
          <Header categories={categories} />
        </Suspense>
        <div className="flex-1">{children}</div>
        <Footer categories={categories} />
      </div>
      <CookieBanner />
      <GoogleAnalyticsMount gaId={process.env.GA_ID} />
      <AnalyticsScripts />
    </NextIntlClientProvider>
  );
}

async function safeGetCategories() {
  try {
    return await getCategories();
  } catch {
    // If the DB env is missing locally we still want the layout to render.
    return [];
  }
}

function HeaderFallback() {
  return <div className="sticky top-0 z-50 h-[120px] bg-card border-b border-border" aria-hidden />;
}
