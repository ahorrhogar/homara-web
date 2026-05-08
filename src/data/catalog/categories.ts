import "server-only";

import { unstable_cache } from "next/cache";
import { createAnonymousServerSupabaseClient } from "@/integrations/supabase/server";
import type { Category, Subcategory } from "@/domain/catalog/types";

export const CATALOG_CACHE_TAG = "catalog";
export const CATEGORIES_CACHE_TAG = "categories";

interface CategoryRow {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  hero_image_url: string | null;
  icon: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

async function fetchCategoryRows(): Promise<CategoryRow[]> {
  const supabase = await createAnonymousServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,parent_id,name,slug,description,hero_image_url,icon,display_order,is_active")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return (data || []) as CategoryRow[];
}

function buildCategories(rows: CategoryRow[]): Category[] {
  const subcategoriesByParent = new Map<string, Subcategory[]>();

  for (const row of rows) {
    if (!row.parent_id) continue;
    const list = subcategoriesByParent.get(row.parent_id) || [];
    list.push({
      id: row.id,
      categoryId: row.parent_id,
      name: row.name,
      slug: row.slug,
      image: row.hero_image_url || undefined,
      productCount: 0,
    });
    subcategoriesByParent.set(row.parent_id, list);
  }

  return rows
    .filter((row) => !row.parent_id)
    .map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      icon: row.icon || "",
      description: row.description || "",
      image: row.hero_image_url || undefined,
      productCount: 0,
      subcategories: subcategoriesByParent.get(row.id) || [],
    }));
}

export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const rows = await fetchCategoryRows();
    return buildCategories(rows);
  },
  ["catalog:categories:v1"],
  { tags: [CATALOG_CACHE_TAG, CATEGORIES_CACHE_TAG], revalidate: 600 },
);

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  if (!slug) return undefined;
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug);
}

export function findSubcategoryBySlug(category: Category, subSlug?: string): Subcategory | undefined {
  if (!subSlug) return undefined;
  return category.subcategories.find((subcategory) => subcategory.slug === subSlug);
}
