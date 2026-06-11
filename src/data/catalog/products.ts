import "server-only";

import { DEFAULT_LOCALE, getCatalogSnapshot } from "@/data/catalog/snapshot";
import { getRankingSignals } from "@/data/catalog/ranking-signals";
import { computeHomeCollections, type HomeCollections } from "@/domain/catalog/home-ranking";
import { filterProducts, sortProducts } from "@/domain/catalog/product-logic";
import type { Offer, Product, ProductFilters, ProductSortBy } from "@/domain/catalog/types";

export async function getProducts(locale: string = DEFAULT_LOCALE): Promise<Product[]> {
  return (await getCatalogSnapshot(locale)).products;
}

export async function getProductById(
  productId: string,
  locale: string = DEFAULT_LOCALE,
): Promise<Product | undefined> {
  if (!productId) return undefined;
  const { products } = await getCatalogSnapshot(locale);
  return products.find((product) => product.id === productId);
}

export async function getProductBySlug(
  slug: string,
  locale: string = DEFAULT_LOCALE,
): Promise<Product | undefined> {
  if (!slug) return undefined;
  const { products } = await getCatalogSnapshot(locale);
  return products.find((product) => product.slug === slug);
}

export async function getProductsByCategoryId(
  categoryId: string,
  locale: string = DEFAULT_LOCALE,
): Promise<Product[]> {
  if (!categoryId) return [];
  const { products } = await getCatalogSnapshot(locale);
  return products.filter(
    (product) => product.categoryId === categoryId || product.subcategoryId === categoryId,
  );
}

export async function getFeaturedProducts(locale: string = DEFAULT_LOCALE): Promise<Product[]> {
  const { products } = await getCatalogSnapshot(locale);
  return products.filter((product) => product.featured);
}

export async function getBestSellerProducts(locale: string = DEFAULT_LOCALE): Promise<Product[]> {
  const { products } = await getCatalogSnapshot(locale);
  return products.filter((product) => product.bestSeller);
}

export async function getNewProducts(locale: string = DEFAULT_LOCALE): Promise<Product[]> {
  const { products } = await getCatalogSnapshot(locale);
  return products.filter((product) => product.isNew);
}

export async function getRelatedProducts(
  product: Product,
  options: { limit?: number; locale?: string } = {},
): Promise<Product[]> {
  const { products } = await getCatalogSnapshot(options.locale ?? DEFAULT_LOCALE);
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
 * offers, and the separately-cached ranking signals.
 */
export async function getHomeCollections(
  limits?: {
    topProducts?: number;
    bestDeals?: number;
    topRatedProducts?: number;
    bestSellers?: number;
    favoriteProducts?: number;
    featuredProducts?: number;
  },
  locale: string = DEFAULT_LOCALE,
): Promise<HomeCollections> {
  const [snapshot, signals] = await Promise.all([getCatalogSnapshot(locale), getRankingSignals()]);

  const offersByProductId = new Map<string, Offer[]>();
  for (const [productId, offers] of Object.entries(snapshot.offersByProductId)) {
    offersByProductId.set(productId, offers);
  }

  return computeHomeCollections(
    {
      products: snapshot.products,
      offersByProductId,
      signals,
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

export async function getFilteredProducts(
  filters: ProductFilters,
  sortBy: ProductSortBy = "popular",
  locale: string = DEFAULT_LOCALE,
): Promise<Product[]> {
  const { products } = await getCatalogSnapshot(locale);
  return sortProducts(filterProducts(products, filters), sortBy);
}

export { searchProducts } from "@/data/catalog/search";
