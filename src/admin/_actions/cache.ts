"use server";

import { revalidateTag } from "next/cache";
import {
  ARTICLES_CACHE_TAG,
  CATALOG_CACHE_TAG,
  RANKING_SIGNALS_CACHE_TAG,
} from "@/data/catalog/snapshot";

/**
 * Invalidates the catalog cache so the public site picks up admin mutations
 * immediately. Called from browser-side admin mutation handlers after a
 * successful insert/update/delete.
 */
export async function invalidateCatalogCacheAction(): Promise<void> {
  revalidateTag(CATALOG_CACHE_TAG, "default");
  revalidateTag(RANKING_SIGNALS_CACHE_TAG, "default");
}

export async function invalidateArticlesCacheAction(): Promise<void> {
  revalidateTag(ARTICLES_CACHE_TAG, "default");
}
