import "server-only";

import { unstable_cache } from "next/cache";
import { editorialService } from "@/services/editorialService";
import type { EditorialArticle } from "@/domain/editorial/types";
import { ARTICLES_CACHE_TAG } from "@/data/catalog/snapshot";

export const getPublishedArticles = unstable_cache(
  async (): Promise<EditorialArticle[]> => editorialService.getPublishedArticlesLive(),
  ["catalog:articles:published:v1"],
  { tags: [ARTICLES_CACHE_TAG], revalidate: 600 },
);

export const getFeaturedArticles = unstable_cache(
  async (limit?: number): Promise<EditorialArticle[]> => editorialService.getFeaturedArticlesLive(limit),
  ["catalog:articles:featured:v1"],
  { tags: [ARTICLES_CACHE_TAG], revalidate: 600 },
);

export const getLatestArticles = unstable_cache(
  async (limit?: number): Promise<EditorialArticle[]> => editorialService.getLatestArticlesLive(limit),
  ["catalog:articles:latest:v1"],
  { tags: [ARTICLES_CACHE_TAG], revalidate: 600 },
);

export const getMostReadArticles = unstable_cache(
  async (limit?: number): Promise<EditorialArticle[]> => editorialService.getMostReadArticlesLive(limit),
  ["catalog:articles:most-read:v1"],
  { tags: [ARTICLES_CACHE_TAG], revalidate: 600 },
);

export async function getArticleBySlug(slug: string): Promise<EditorialArticle | undefined> {
  if (!slug) return undefined;
  return editorialService.getArticleBySlugLive(slug);
}
