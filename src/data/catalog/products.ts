import "server-only";

import { getCatalogSnapshot } from "@/data/catalog/snapshot";
import { computeHomeCollections, type HomeCollections } from "@/domain/catalog/home-ranking";
import { filterProducts, sortProducts } from "@/domain/catalog/product-logic";
import type { Offer, Product, ProductFilters, ProductSortBy } from "@/domain/catalog/types";

export async function getProducts(): Promise<Product[]> {
  return (await getCatalogSnapshot()).products;
}

export async function getProductById(productId: string): Promise<Product | undefined> {
  if (!productId) return undefined;
  const { products } = await getCatalogSnapshot();
  return products.find((product) => product.id === productId);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (!slug) return undefined;
  const { products } = await getCatalogSnapshot();
  return products.find((product) => product.slug === slug);
}

export async function getProductsByCategoryId(categoryId: string): Promise<Product[]> {
  if (!categoryId) return [];
  const { products } = await getCatalogSnapshot();
  return products.filter(
    (product) => product.categoryId === categoryId || product.subcategoryId === categoryId,
  );
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { products } = await getCatalogSnapshot();
  return products.filter((product) => product.featured);
}

export async function getBestSellerProducts(): Promise<Product[]> {
  const { products } = await getCatalogSnapshot();
  return products.filter((product) => product.bestSeller);
}

export async function getNewProducts(): Promise<Product[]> {
  const { products } = await getCatalogSnapshot();
  return products.filter((product) => product.isNew);
}

export async function getRelatedProducts(
  product: Product,
  options: { limit?: number } = {},
): Promise<Product[]> {
  const { products } = await getCatalogSnapshot();
  const limit = options.limit || 4;

  return products
    .filter(
      (other) =>
        other.id !== product.id &&
        (other.subcategoryId === product.subcategoryId || other.categoryId === product.categoryId),
    )
    .slice(0, limit);
}

/**
 * Returns the ranked home collections used by `app/page.tsx`. Reuses the pure
 * `computeHomeCollections` domain helper, fed with the cached snapshot's products,
 * offers, and ranking signals.
 */
export async function getHomeCollections(limits?: {
  topProducts?: number;
  bestDeals?: number;
  topRatedProducts?: number;
  bestSellers?: number;
  favoriteProducts?: number;
  featuredProducts?: number;
}): Promise<HomeCollections> {
  const snapshot = await getCatalogSnapshot();

  const offersByProductId = new Map<string, Offer[]>();
  for (const [productId, offers] of Object.entries(snapshot.offersByProductId)) {
    offersByProductId.set(productId, offers);
  }

  return computeHomeCollections(
    {
      products: snapshot.products,
      offersByProductId,
      signals: snapshot.rankingSignals,
    },
    {
      topProducts: limits?.topProducts ?? 6,
      bestDeals: limits?.bestDeals ?? 4,
      topRatedProducts: limits?.topRatedProducts ?? 4,
      bestSellers: limits?.bestSellers ?? 4,
      favoriteProducts: limits?.favoriteProducts ?? 4,
      featuredProducts: limits?.featuredProducts ?? 4,
    },
  );
}

/**
 * Filtered + sorted product list for category and subcategory pages. Mirrors the
 * legacy productService.getFilteredProducts but reads from the tagged snapshot.
 */
export async function getFilteredProducts(
  filters: ProductFilters,
  sortBy: ProductSortBy = "popular",
): Promise<Product[]> {
  const { products } = await getCatalogSnapshot();
  return sortProducts(filterProducts(products, filters), sortBy);
}

/**
 * Server-side product search. Reuses the legacy `searchProducts` helper which
 * handles tokenization, brand/category cross-matching, and Supabase fallback for
 * brand-name matches when the snapshot doesn't have a result.
 */
export { searchProducts } from "@/data/sources/supabaseCatalogSource";
