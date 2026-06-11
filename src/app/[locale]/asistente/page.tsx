import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { AssistantForm } from "@/components/assistant/AssistantForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategories } from "@/data/catalog/categories";
import { getProducts } from "@/data/catalog/products";
import { buildAlternates, toOpenGraphLocale } from "@/i18n/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Asistente de compras: recomendaciones para tu hogar",
    description:
      "Cuéntanos qué necesitas y el asistente de Homara te recomienda productos para tu hogar y jardín según presupuesto, estilo y prioridades. Gratis y sin registro.",
    alternates: buildAlternates("/asistente", locale),
    openGraph: {
      type: "website",
      locale: toOpenGraphLocale(locale),
      title: "Asistente de compras Homara",
      description:
        "Recomendaciones editoriales según tu presupuesto, estilo y prioridades. Gratis y sin registro.",
      url: `${SITE_URL}/asistente`,
    },
    twitter: {
      card: "summary_large_image",
      title: "Asistente de compras Homara",
      description: "Recomendaciones editoriales para hogar y jardín.",
    },
  };
}

export const revalidate = 600;

export default async function AssistantPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("asistente");

  const ASSISTANT_APP_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Asistente de compras Homara",
    applicationCategory: "ShoppingApplication",
    operatingSystem: "Any",
    url: `${SITE_URL}/asistente`,
    offers: { "@type": "Offer", price: 0, priceCurrency: "EUR" },
    inLanguage: locale,
    publisher: { "@type": "Organization", name: "Homara", url: SITE_URL },
  };

  const faqRaw = t.raw("faq") as Array<{ question: string; answer: string }>;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqRaw.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const [categories, products] = await Promise.all([
    getCategories(locale).catch(() => []),
    getProducts(locale).catch(() => []),
  ]);

  const styles = Array.from(
    new Set(products.map((p) => p.style).filter((value): value is string => Boolean(value))),
  ).sort((a, b) => a.localeCompare(b));

  return (
    <>
      <JsonLd data={ASSISTANT_APP_SCHEMA} />
      <JsonLd data={faqSchema} />

      <main className="container mx-auto px-4">
        <Breadcrumb items={[{ label: t("breadcrumb") }]} />
        <AssistantForm categories={categories} styles={styles} products={products} />

        <section className="max-w-3xl mx-auto mt-12 mb-8">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4">
            {t("faqTitle")}
          </h2>
          <dl className="divide-y divide-border rounded-2xl border border-border bg-card">
            {faqRaw.map((item) => (
              <div key={item.question} className="p-4">
                <dt className="font-semibold text-foreground text-sm mb-1">{item.question}</dt>
                <dd className="text-sm text-muted-foreground leading-relaxed">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </>
  );
}
