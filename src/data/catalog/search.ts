import "server-only";

import { buildSearchTokens, normalizeSearchValue } from "@/data/catalog/_helpers";
import { DEFAULT_LOCALE, getCatalogSnapshot, type CatalogSnapshot } from "@/data/catalog/snapshot";
import type { Product } from "@/domain/catalog/types";
import { logger } from "@/infrastructure/logging/logger";
import { db } from "@/lib/db";

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

async function findRemoteCandidateIds(tokens: string[], limit: number): Promise<string[]> {
  const orConditions = tokens.flatMap((token) => [
    { name: { contains: token, mode: "insensitive" as const } },
    { description: { contains: token, mode: "insensitive" as const } },
    { brand: { name: { contains: token, mode: "insensitive" as const } } },
    { category: { name: { contains: token, mode: "insensitive" as const } } },
    {
      offers: {
        some: { merchant: { name: { contains: token, mode: "insensitive" as const } } },
      },
    },
  ]);

  const rows = await db.product.findMany({
    where: { OR: orConditions, isActive: true },
    select: { id: true },
    take: limit,
  });

  return rows.map((row) => row.id);
}

export async function searchProducts(
  query: string,
  limit = 40,
  locale: string = DEFAULT_LOCALE,
): Promise<Product[]> {
  const cappedLimit = Math.max(1, Math.min(limit, 200));
  const tokens = buildSearchTokens(query);
  if (!tokens.length) return [];

  const snapshot = await getCatalogSnapshot(locale);
  const localMatches = searchProductsInSnapshot(snapshot, tokens, cappedLimit);

  try {
    const remoteIds = await findRemoteCandidateIds(tokens, Math.max(cappedLimit * 2, 24));
    if (!remoteIds.length) return localMatches;

    const productsById = new Map(snapshot.products.map((product) => [product.id, product]));
    const merged: Product[] = [];
    const seen = new Set<string>();

    for (const id of remoteIds) {
      const product = productsById.get(id);
      if (!product || seen.has(id)) continue;
      seen.add(id);
      merged.push(product);
    }

    for (const product of localMatches) {
      if (seen.has(product.id)) continue;
      seen.add(product.id);
      merged.push(product);
    }

    return merged.slice(0, cappedLimit);
  } catch (error) {
    logger.log({
      level: "warn",
      message: "Remote product search failed; falling back to local snapshot",
      timestamp: new Date().toISOString(),
      context: { query, error },
    });
    return localMatches;
  }
}
