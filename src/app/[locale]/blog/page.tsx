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
import { getTranslations, setRequestLocale } from "next-intl/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";

export const metadata: Metadata = {
  title: "Blog: guías de compra y comparativas",
  description:
    "Comparativas, rankings y guías de compra editoriales para hogar y jardín. Datos concretos, pros y contras y precios reales.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: "Blog Homara — Guías y comparativas",
    description: "Comparativas y guías de compra editoriales para hogar y jardín.",
    url: `${SITE_URL}/blog`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog Homara — Guías y comparativas",
    description: "Comparativas y guías de compra editoriales.",
  },
};

export default async function BlogHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const [allPublished, featured, mostRead, latest] = await Promise.all([
    getPublishedArticles(locale).catch(() => []),
    getFeaturedArticles(6, locale).catch(() => []),
    getMostReadArticles(6, locale).catch(() => []),
    getLatestArticles(6, locale).catch(() => []),
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
        <Breadcrumb items={[{ label: t("breadcrumb") }]} />

        <header className="max-w-3xl mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">{t("eyebrow")}</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
            {t("heading")}
          </h1>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            {t("intro")}
          </p>
        </header>

        {featured.length > 0 ? (
          <Section title={t("sectionRecommended")} articles={featured} listName="recomendado" />
        ) : null}
        {mostRead.length > 0 ? (
          <Section title={t("sectionMostRead")} articles={mostRead} listName="mas_leidos" />
        ) : null}
        {latest.length > 0 ? (
          <Section title={t("sectionLatest")} articles={latest} listName="ultimas_guias" />
        ) : null}

        {allPublished.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            {t("empty")}
          </div>
        ) : null}
      </main>
    </>
  );
}

function Section({
  title,
  articles,
  listName,
}: {
  title: string;
  articles: Awaited<ReturnType<typeof getPublishedArticles>>;
  listName: string;
}) {
  return (
    <section className="mb-14">
      <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-5">{title}</h2>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, index) => (
          <EditorialArticleCard
            key={article.id}
            article={article}
            listName={listName}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
