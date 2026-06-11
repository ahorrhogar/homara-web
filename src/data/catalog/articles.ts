import "server-only";

import { unstable_cache } from "next/cache";
import { editorialService } from "@/services/editorialService";
import type { ArticleSection, EditorialArticle } from "@/domain/editorial/types";
import { ARTICLES_CACHE_TAG, DEFAULT_LOCALE } from "@/data/catalog/snapshot";
import { db } from "@/lib/db";

interface ArticleTranslationRow {
  articleId: string;
  title: string;
  excerpt: string;
  coverImageAlt: string | null;
  categoryName: string;
  sections: unknown;
  tags: string[];
}

const ARTICLE_TRANSLATION_SELECT = {
  articleId: true,
  title: true,
  excerpt: true,
  coverImageAlt: true,
  categoryName: true,
  sections: true,
  tags: true,
} as const;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Merges one translation row onto a base article. Only display text changes. */
function mergeArticleTranslation(
  article: EditorialArticle,
  tr: ArticleTranslationRow,
): EditorialArticle {
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
}

/**
 * Overlays sidecar `editorial_article_translations` onto a LIST of base articles
 * for a locale (one bulk read). Resilient: if the table is missing (pre-migration)
 * or the query fails, the base (Spanish) articles pass through unchanged.
 * Slugs/paths/dates/related slugs are never translated — only display text. When
 * `locale` is the default and rows are backfilled to equal the base, this is a
 * no-op. Used only inside the cached list facades.
 */
async function overlayArticleTranslations(
  articles: EditorialArticle[],
  locale: string,
): Promise<EditorialArticle[]> {
  if (articles.length === 0) return articles;

  let rows: ArticleTranslationRow[];
  try {
    rows = await db.editorialArticleTranslation.findMany({
      where: { locale },
      select: ARTICLE_TRANSLATION_SELECT,
    });
  } catch {
    return articles;
  }

  if (rows.length === 0) return articles;

  const byId = new Map(rows.map((row) => [row.articleId, row]));

  return articles.map((article) => {
    const tr = byId.get(article.id);
    return tr ? mergeArticleTranslation(article, tr) : article;
  });
}

/**
 * Overlays the translation for a SINGLE article via a targeted `findUnique` on
 * `(articleId, locale)` — O(1), not a full per-locale table scan. Static-source
 * articles carry non-UUID ids and have no DB translation row, so they short-circuit
 * to the base value.
 */
async function overlayOneArticle(
  article: EditorialArticle,
  locale: string,
): Promise<EditorialArticle> {
  if (!UUID_RE.test(article.id)) return article;

  try {
    const row = await db.editorialArticleTranslation.findUnique({
      where: { articleId_locale: { articleId: article.id, locale } },
      select: ARTICLE_TRANSLATION_SELECT,
    });
    return row ? mergeArticleTranslation(article, row) : article;
  } catch {
    return article;
  }
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
  return overlayOneArticle(article, locale);
}
