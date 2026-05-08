import type { Metadata } from "next";
import Breadcrumb from "@/components/layout/Breadcrumb";
import EditorialArticleCard from "@/components/editorial/EditorialArticleCard";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getFeaturedArticles,
  getLatestArticles,
  getMostReadArticles,
  getPublishedArticles,
} from "@/data/catalog/articles";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";

export const metadata: Metadata = {
  title: "Guías de compra para hogar",
  description:
    "Comparativas, guías de compra y selecciones editoriales para tu hogar. Encuentra el producto adecuado al mejor precio.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Guías de compra para hogar | Homara",
    description: "Comparativas, guías de compra y selecciones editoriales para tu hogar.",
    url: `${SITE_URL}/blog`,
  },
};

export default async function BlogHubPage() {
  const [allPublished, featured, mostRead, latest] = await Promise.all([
    getPublishedArticles().catch(() => []),
    getFeaturedArticles(6).catch(() => []),
    getMostReadArticles(6).catch(() => []),
    getLatestArticles(6).catch(() => []),
  ]);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Guías de compra para hogar",
    description:
      "Comparativas, guías de compra y selecciones editoriales para tu hogar.",
    url: `${SITE_URL}/blog`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: allPublished.slice(0, 20).map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}${article.path}`,
        name: article.title,
      })),
    },
  };

  return (
    <>
      <JsonLd data={collectionSchema} />

      <main className="container mx-auto px-4">
        <Breadcrumb items={[{ label: "Guías de compra" }]} />

        <header className="max-w-3xl mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Editorial</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
            Guías de compra para tu hogar
          </h1>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Análisis editoriales, comparativas y selecciones de productos. Te ayudamos a encontrar lo
            que necesitas con datos concretos —medidas, materiales, consumo, garantía— y sin
            superlativos vacíos.
          </p>
        </header>

        {featured.length > 0 ? (
          <Section title="Recomendado por el equipo" articles={featured} />
        ) : null}
        {mostRead.length > 0 ? <Section title="Más leídos" articles={mostRead} /> : null}
        {latest.length > 0 ? <Section title="Últimas guías" articles={latest} /> : null}

        {allPublished.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            Aún no hay guías publicadas. Vuelve pronto.
          </div>
        ) : null}
      </main>
    </>
  );
}

function Section({
  title,
  articles,
}: {
  title: string;
  articles: Awaited<ReturnType<typeof getPublishedArticles>>;
}) {
  return (
    <section className="mb-14">
      <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-5">{title}</h2>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <EditorialArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
