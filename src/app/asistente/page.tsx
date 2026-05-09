import type { Metadata } from "next";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { AssistantForm } from "@/components/assistant/AssistantForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategories } from "@/data/catalog/categories";
import { getProducts } from "@/data/catalog/products";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";

export const metadata: Metadata = {
  title: "Asistente de compras: recomendaciones para tu hogar",
  description:
    "Cuéntanos qué necesitas y el asistente de Homara te recomienda productos para tu hogar y jardín según presupuesto, estilo y prioridades. Gratis y sin registro.",
  alternates: { canonical: "/asistente" },
  openGraph: {
    type: "website",
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

export const revalidate = 600;

const ASSISTANT_FAQ = [
  {
    question: "¿Cómo funciona el asistente de compras?",
    answer:
      "Selecciona la categoría, indica tu presupuesto y tus prioridades (estilo, espacio, uso). Cruzamos esos datos con el catálogo y te devolvemos una lista corta de productos con explicación de por qué encajan.",
  },
  {
    question: "¿Tengo que registrarme para usar el asistente?",
    answer: "No. Es gratuito y no requiere registro ni email. Las respuestas se generan al instante.",
  },
  {
    question: "¿Cómo elegís los productos recomendados?",
    answer:
      "Filtramos el catálogo por categoría, presupuesto y estilo y aplicamos puntuaciones editoriales según rating, número de opiniones y datos del fabricante. La recomendación final se ordena por encaje editorial, no por afiliación.",
  },
  {
    question: "¿Guardáis los datos que introduzco?",
    answer:
      "No guardamos los datos del formulario. La recomendación se calcula en el momento y desaparece al cerrar la página.",
  },
];

const ASSISTANT_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ASSISTANT_FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

const ASSISTANT_APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Asistente de compras Homara",
  applicationCategory: "ShoppingApplication",
  operatingSystem: "Any",
  url: `${SITE_URL}/asistente`,
  offers: { "@type": "Offer", price: 0, priceCurrency: "EUR" },
  inLanguage: "es",
  publisher: { "@type": "Organization", name: "Homara", url: SITE_URL },
};

export default async function AssistantPage() {
  const [categories, products] = await Promise.all([
    getCategories().catch(() => []),
    getProducts().catch(() => []),
  ]);

  const styles = Array.from(
    new Set(products.map((p) => p.style).filter((value): value is string => Boolean(value))),
  ).sort((a, b) => a.localeCompare(b));

  return (
    <>
      <JsonLd data={ASSISTANT_APP_SCHEMA} />
      <JsonLd data={ASSISTANT_FAQ_SCHEMA} />

      <main className="container mx-auto px-4">
        <Breadcrumb items={[{ label: "Asistente de compras" }]} />
        <AssistantForm categories={categories} styles={styles} products={products} />

        <section className="max-w-3xl mx-auto mt-12 mb-8">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4">
            Preguntas frecuentes
          </h2>
          <dl className="divide-y divide-border rounded-2xl border border-border bg-card">
            {ASSISTANT_FAQ.map((item) => (
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
