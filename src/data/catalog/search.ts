import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getAnonymousSupabaseClient } from "@/integrations/supabase/anonymous";
import { logger } from "@/infrastructure/logging/logger";
import type { Product } from "@/domain/catalog/types";
import { buildSearchTokens, normalizeSearchValue } from "@/data/catalog/_helpers";
import { getCatalogSnapshot, type CatalogSnapshot } from "@/data/catalog/snapshot";

interface SnapshotCategoryLookup {
  categoryNameById: Map<string, string>;
  categorySlugById: Map<string, string>;
  subcategoryNameById: Map<string, string>;
  subcategorySlugById: Map<string, string>;
  merchantNamesByProductId: Map<string, string>;
}

function buildSnapshotCategoryLookup(snapshot: CatalogSnapshot): SnapshotCategoryLookup {
  const categoryNameById = new Map<string, string>();
  const categorySlugById = new Map<string, string>();
  const subcategoryNameById = new Map<string, string>();
  const subcategorySlugById = new Map<string, string>();
  const merchantNamesByProductId = new Map<string, string>();

  snapshot.categories.forEach((category) => {
    categoryNameById.set(category.id, category.name);
    categorySlugById.set(category.id, category.slug);

    category.subcategories.forEach((subcategory) => {
      subcategoryNameById.set(subcategory.id, subcategory.name);
      subcategorySlugById.set(subcategory.id, subcategory.slug);

      // Fallback when product.categoryId points to subcategory rows.
      if (!categoryNameById.has(subcategory.id)) {
        categoryNameById.set(subcategory.id, category.name);
      }
      if (!categorySlugById.has(subcategory.id)) {
        categorySlugById.set(subcategory.id, category.slug);
      }
    });
  });

  snapshot.products.forEach((product) => {
    const merchantNames = [
      ...new Set(
        (snapshot.offersByProductId[product.id] || [])
          .map((offer) => offer.merchant.name)
          .filter(Boolean),
      ),
    ];
    merchantNamesByProductId.set(product.id, merchantNames.join(" "));
  });

  return {
    categoryNameById,
    categorySlugById,
    subcategoryNameById,
    subcategorySlugById,
    merchantNamesByProductId,
  };
}

function scoreSearchMatch(product: Product, tokens: string[], lookup: SnapshotCategoryLookup): number {
  const normalizedName = normalizeSearchValue(product.name);
  const normalizedBrand = normalizeSearchValue(product.brand);
  const normalizedDescription = normalizeSearchValue(product.description);
  const normalizedTags = product.tags.map((tag) => normalizeSearchValue(tag)).join(" ");
  const normalizedMerchant = normalizeSearchValue(lookup.merchantNamesByProductId.get(product.id) || "");
  const normalizedCategory = normalizeSearchValue(
    [
      lookup.categoryNameById.get(product.categoryId) || "",
      lookup.categorySlugById.get(product.categoryId) || "",
      lookup.subcategoryNameById.get(product.subcategoryId) || "",
      lookup.subcategorySlugById.get(product.subcategoryId) || "",
    ].join(" "),
  );

  let score = 0;
  for (const token of tokens) {
    if (normalizedName === token) score += 250;
    else if (normalizedName.startsWith(token)) score += 120;
    else if (normalizedName.includes(token)) score += 80;

    if (normalizedBrand === token) score += 90;
    else if (normalizedBrand.includes(token)) score += 45;

    if (normalizedMerchant === token) score += 120;
    else if (normalizedMerchant.startsWith(token)) score += 70;
    else if (normalizedMerchant.includes(token)) score += 55;

    if (normalizedCategory === token) score += 110;
    else if (normalizedCategory.startsWith(token)) score += 55;
    else if (normalizedCategory.includes(token)) score += 35;

    if (normalizedTags.includes(token)) score += 30;
    if (normalizedDescription.includes(token)) score += 15;
  }

  return score;
}

function searchProductsInSnapshot(snapshot: CatalogSnapshot, tokens: string[], limit: number): Product[] {
  if (!tokens.length) return [];

  const lookup = buildSnapshotCategoryLookup(snapshot);

  return snapshot.products
    .map((product) => ({ product, score: scoreSearchMatch(product, tokens, lookup) }))
    .filter((entry) => entry.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score || right.product.reviewCount - left.product.reviewCount,
    )
    .slice(0, limit)
    .map((entry) => entry.product);
}

function buildSearchOrFilter(tokens: string[]): string {
  const expressions = tokens.flatMap((token) => [
    `name.ilike.%${token}%`,
    `description.ilike.%${token}%`,
    `slug.ilike.%${token}%`,
  ]);
  return [...new Set(expressions)].join(",");
}

function buildNameSearchFilter(tokens: string[]): string {
  const expressions = tokens.map((token) => `name.ilike.%${token}%`);
  return [...new Set(expressions)].join(",");
}

async function searchProductIdsByBrandAndCategory(
  tokens: string[],
  supabase: SupabaseClient,
  limit: number,
): Promise<string[]> {
  const nameSearchFilter = buildNameSearchFilter(tokens);
  if (!nameSearchFilter) return [];

  const [brandResult, categoryResult, merchantResult] = await Promise.all([
    supabase.from("brands").select("id").or(nameSearchFilter).limit(25),
    supabase.from("categories").select("id").or(nameSearchFilter).limit(50),
    supabase.from("merchants").select("id").or(nameSearchFilter).limit(25),
  ]);

  if (brandResult.error) throw brandResult.error;
  if (categoryResult.error) throw categoryResult.error;
  if (merchantResult.error) throw merchantResult.error;

  const brandIds = (brandResult.data || [])
    .map((row) => String((row as { id?: string }).id || ""))
    .filter(Boolean);
  const merchantIds = (merchantResult.data || [])
    .map((row) => String((row as { id?: string }).id || ""))
    .filter(Boolean);

  const categoryIds = new Set(
    (categoryResult.data || []).map((row) => String((row as { id?: string }).id || "")).filter(Boolean),
  );

  if (categoryIds.size > 0) {
    const { data: childCategories, error: childCategoriesError } = await supabase
      .from("categories")
      .select("id")
      .in("parent_id", Array.from(categoryIds));

    if (childCategoriesError) throw childCategoriesError;

    (childCategories || []).forEach((row) => {
      const categoryId = String((row as { id?: string }).id || "");
      if (categoryId) categoryIds.add(categoryId);
    });
  }

  const matchedProductIds = new Set<string>();

  if (brandIds.length > 0) {
    const { data: productsByBrand, error: productsByBrandError } = await supabase
      .from("products")
      .select("id")
      .in("brand_id", brandIds)
      .limit(limit);

    if (productsByBrandError) throw productsByBrandError;

    (productsByBrand || []).forEach((row) => {
      const productId = String((row as { id?: string }).id || "");
      if (productId) matchedProductIds.add(productId);
    });
  }

  if (categoryIds.size > 0) {
    const { data: productsByCategory, error: productsByCategoryError } = await supabase
      .from("products")
      .select("id")
      .in("category_id", Array.from(categoryIds))
      .limit(limit);

    if (productsByCategoryError) throw productsByCategoryError;

    (productsByCategory || []).forEach((row) => {
      const productId = String((row as { id?: string }).id || "");
      if (productId) matchedProductIds.add(productId);
    });
  }

  if (merchantIds.length > 0) {
    const { data: offersByMerchant, error: offersByMerchantError } = await supabase
      .from("offers")
      .select("product_id")
      .in("merchant_id", merchantIds)
      .limit(limit * 3);

    if (offersByMerchantError) throw offersByMerchantError;

    (offersByMerchant || []).forEach((row) => {
      const productId = String((row as { product_id?: string }).product_id || "");
      if (productId) matchedProductIds.add(productId);
    });
  }

  return Array.from(matchedProductIds);
}

export async function searchProducts(
  query: string,
  limit = 40,
  client?: SupabaseClient,
): Promise<Product[]> {
  const cappedLimit = Math.max(1, Math.min(limit, 200));
  const tokens = buildSearchTokens(query);
  if (!tokens.length) return [];

  const snapshot = await getCatalogSnapshot();
  const localMatches = searchProductsInSnapshot(snapshot, tokens, cappedLimit);

  const searchFilter = buildSearchOrFilter(tokens);
  if (!searchFilter) return localMatches;

  try {
    const supabase = client || getAnonymousSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .or(searchFilter)
      .limit(Math.max(cappedLimit * 2, 24));

    if (error) throw error;

    const remoteIds = (data || [])
      .map((row) => String((row as { id?: string }).id || ""))
      .filter(Boolean);

    const relationMatchIds = await searchProductIdsByBrandAndCategory(
      tokens,
      supabase,
      Math.max(cappedLimit * 2, 24),
    );

    const candidateIds = [...remoteIds, ...relationMatchIds];
    if (!candidateIds.length) return localMatches;

    const productsById = new Map(snapshot.products.map((product) => [product.id, product]));
    const merged: Product[] = [];
    const seen = new Set<string>();

    candidateIds.forEach((productId) => {
      const product = productsById.get(productId);
      if (!product || seen.has(productId)) return;
      seen.add(productId);
      merged.push(product);
    });

    localMatches.forEach((product) => {
      if (seen.has(product.id)) return;
      seen.add(product.id);
      merged.push(product);
    });

    return merged.slice(0, cappedLimit);
  } catch (error) {
    logger.log({
      level: "warn",
      message: "Remote product search failed. Falling back to local snapshot search",
      timestamp: new Date().toISOString(),
      context: { query, error },
    });
    return localMatches;
  }
}
