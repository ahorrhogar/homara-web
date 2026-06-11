import "server-only";

import { unstable_cache } from "next/cache";
import { editorialService } from "@/services/editorialService";
import type { ArticleSection, EditorialArticle } from "@/domain/editorial/types";
import { ARTICLES_CACHE_TAG, DEFAULT_LOCALE } from "@/data/catalog/snapshot";
import { db } from "@/lib/db";

/**
 * Overlays sidecar `editorial_article_translations` onto base articles for a
 * locale. Resilient: if the table is missing (pre-migration) or the query fails,
 * the base (Spanish) articles pass through unchanged. Slugs/paths/dates/related
 * slugs are never translated — only display text. When `locale` is the default
 * and rows are backfilled to equal the base, the overlay is a no-op.
 */
async function overlayArticleTranslations(
  articles: EditorialArticle[],
  locale: string,
): Promise<EditorialArticle[]> {
  if (articles.length === 0) return articles;

  let rows: Array<{
    articleId: string;
    title: string;
    excerpt: string;
    coverImageAlt: string | null;
    categoryName: string;
    sections: unknown;
    tags: string[];
  }>;
  try {
    rows = await db.editorialArticleTranslation.findMany({
      where: { locale },
      select: {
        articleId: true,
        title: true,
        excerpt: true,
        coverImageAlt: true,
        categoryName: true,
        sections: true,
        tags: true,
      },
    });
  } catch {
    return articles;
  }

  if (rows.length === 0) return articles;

  const byId = new Map(rows.map((row) => [row.articleId, row]));

  return articles.map((article) => {
    const tr = byId.get(article.id);
    if (!tr) return article;

    const sections = Array.isArray(tr.sections) ? (tr.sections as ArticleSection[]) : null;

    return {
      ...article,
      title: tr.title || article.title,
      excerpt: tr.excerpt || article.excerpt,
      coverImageAlt: tr.coverImageAlt ?? article.coverImageAlt,
      categoryName: tr.categoryName || article.categoryName,
      sections: sections && sections.length > 0 ? sections : article.sections,
      tags: Array.isArray(tr.tags) && tr.tags.length > 0 ? tr.tags : article.tags,
    };
  });
}

const cachedPublishedArticles = unstable_cache(
  async (locale: string): Promise<EditorialArticle[]> =>
    overlayArticleTranslations(await editorialService.getPublishedArticlesLive(), locale),
  ["catalog:articles:published:v2"],
  { tags: [ARTICLES_CACHE_TAG], revalidate: 600 },
);

const cachedFeaturedArticles = unstable_cache(
  async (locale: string, limit?: number): Promise<EditorialArticle[]> =>
    overlayArticleTranslations(await editorialService.getFeaturedArticlesLive(limit), locale),
  ["catalog:articles:featured:v2"],
  { tags: [ARTICLES_CACHE_TAG], revalidate: 600 },
);

const cachedLatestArticles = unstable_cache(
  async (locale: string, limit?: number): Promise<EditorialArticle[]> =>
    overlayArticleTranslations(await editorialService.getLatestArticlesLive(limit), locale),
  ["catalog:articles:latest:v2"],
  { tags: [ARTICLES_CACHE_TAG], revalidate: 600 },
);

const cachedMostReadArticles = unstable_cache(
  async (locale: string, limit?: number): Promise<EditorialArticle[]> =>
    overlayArticleTranslations(await editorialService.getMostReadArticlesLive(limit), locale),
  ["catalog:articles:most-read:v2"],
  { tags: [ARTICLES_CACHE_TAG], revalidate: 600 },
);

export function getPublishedArticles(locale: string = DEFAULT_LOCALE): Promise<EditorialArticle[]> {
  return cachedPublishedArticles(locale);
}

export function getFeaturedArticles(
  limit?: number,
  locale: string = DEFAULT_LOCALE,
): Promise<EditorialArticle[]> {
  return cachedFeaturedArticles(locale, limit);
}

export function getLatestArticles(
  limit?: number,
  locale: string = DEFAULT_LOCALE,
): Promise<EditorialArticle[]> {
  return cachedLatestArticles(locale, limit);
}

export function getMostReadArticles(
  limit?: number,
  locale: string = DEFAULT_LOCALE,
): Promise<EditorialArticle[]> {
  return cachedMostReadArticles(locale, limit);
}

export async function getArticleBySlug(
  slug: string,
  locale: string = DEFAULT_LOCALE,
): Promise<EditorialArticle | undefined> {
  if (!slug) return undefined;
  const article = await editorialService.getArticleBySlugLive(slug);
  if (!article) return undefined;
  const [overlaid] = await overlayArticleTranslations([article], locale);
  return overlaid;
}
