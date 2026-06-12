import "server-only";

import {
  CATALOG_CACHE_TAG,
  CATEGORIES_CACHE_TAG,
  DEFAULT_LOCALE,
  getCatalogSnapshot,
} from "@/data/catalog/snapshot";
import { getTrendingCategories as buildTrendingCategories } from "@/domain/catalog/category-logic";
import type { Category, Subcategory, TrendingCategory } from "@/domain/catalog/types";

export { CATALOG_CACHE_TAG, CATEGORIES_CACHE_TAG };

export async function getCategories(locale: string = DEFAULT_LOCALE): Promise<Category[]> {
  return (await getCatalogSnapshot(locale)).categories;
}

export async function getCategoryBySlug(
  slug: string,
  locale: string = DEFAULT_LOCALE,
): Promise<Category | undefined> {
  if (!slug) return undefined;
  const categories = await getCategories(locale);
  return categories.find((category) => category.slug === slug);
}

export function findSubcategoryBySlug(category: Category, subSlug?: string): Subcategory | undefined {
  if (!subSlug) return undefined;
  return category.subcategories.find((subcategory) => subcategory.slug === subSlug);
}

export async function getTrendingCategories(
  locale: string = DEFAULT_LOCALE,
): Promise<TrendingCategory[]> {
  const snapshot = await getCatalogSnapshot(locale);
  return buildTrendingCategories(snapshot.categories, snapshot.products);
}
