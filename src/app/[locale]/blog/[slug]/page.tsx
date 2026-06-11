import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { getArticleBySlug } from "@/data/catalog/articles";
import { buildAlternates, toOpenGraphLocale } from "@/i18n/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(slug, locale).catch(() => undefined);
  if (!article) {
    return { title: "Artículo no encontrado", robots: { index: false } };
  }

  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.tags?.length ? article.tags : undefined,
    alternates: buildAlternates(article.path, locale),
    openGraph: {
      locale: toOpenGraphLocale(locale),
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      authors: ["Equipo editorial Homara"],
      section: article.categoryName,
      url: `${SITE_URL}${article.path}`,
      images: article.coverImage ? [{ url: article.coverImage, alt: article.coverImageAlt || article.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function EditorialArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(slug, locale).catch(() => undefined);

  if (!article) {
    notFound();
  }

  const articleBody = article.sections.map((s) => `${s.heading}. ${s.body}`).join(" ").slice(0, 5000);
  const wordCount = articleBody ? articleBody.split(/\s+/).filter(Boolean).length : undefined;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    articleBody,
    wordCount,
    inLanguage: locale,
    keywords: article.tags?.length ? article.tags.join(", ") : undefined,
    articleSection: article.categoryName,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      "@type": "Organization",
      name: "Equipo editorial Homara",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Homara",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/homara-logo.svg` },
    },
    mainEntityOfPage: `${SITE_URL}${article.path}`,
    image: article.coverImage
      ? [{ "@type": "ImageObject", url: article.coverImage, width: 1200, height: 630 }]
      : undefined,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: article.title, item: `${SITE_URL}${article.path}` },
    ],
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <main className="pb-14">
        <div className="container mx-auto px-4 py-2">
          <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: article.title }]} />
        </div>

        <article className="container mx-auto px-4">
          <header className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-secondary to-card p-6 md:p-10">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge>{article.categoryName}</Badge>
                <Badge variant="outline">{article.intent}</Badge>
              </div>

              <h1 className="font-display text-3xl font-bold leading-tight md:text-5xl">
                {article.title}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                {article.excerpt}
              </p>

              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  Por <strong className="font-semibold text-foreground">Equipo editorial Homara</strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  Publicado el {formatDate(article.publishedAt)}
                </span>
                {article.updatedAt && article.updatedAt !== article.publishedAt ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    Actualizado el {formatDate(article.updatedAt)}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4" />
                  {article.readMinutes} min de lectura
                </span>
              </div>
            </div>
          </header>

          <div className="mx-auto mt-8 grid max-w-5xl gap-6 lg:grid-cols-[1fr_300px]">
            <section className="space-y-4">
              {article.sections.map((section) => (
                <div key={section.heading} className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="font-display text-xl font-bold">{section.heading}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                    {section.body}
                  </p>
                </div>
              ))}
            </section>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-semibold">Relacionados</h3>
                <div className="mt-3 space-y-2">
                  {article.relatedCategorySlugs.slice(0, 3).map((categorySlug) => (
                    <Link
                      key={categorySlug}
                      href={`/categoria/${categorySlug}`}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary"
                    >
                      <span>Ver categoría {categorySlug}</span>
                      <ArrowRight className="h-4 w-4 text-accent" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-semibold">Siguiente paso</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Compara precios y ofertas activas para aplicar esta guía en una compra real.
                </p>
                <Button asChild className="mt-3 w-full">
                  <Link href="/buscar">Comparar productos</Link>
                </Button>
              </div>
            </aside>
          </div>
        </article>
      </main>
    </>
  );
}
