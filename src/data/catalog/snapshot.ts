import "server-only";

import { unstable_cache } from "next/cache";
import type { Category, Merchant, Offer, PriceHistory, Product } from "@/domain/catalog/types";
import { supabaseCatalogSource } from "@/data/sources/supabaseCatalogSource";
import type { CatalogRankingSignals } from "@/data/sources/catalogSource.types";

export const CATALOG_CACHE_TAG = "catalog";
export const CATEGORIES_CACHE_TAG = "categories";
export const PRODUCTS_CACHE_TAG = "products";
export const OFFERS_CACHE_TAG = "offers";
export const ARTICLES_CACHE_TAG = "articles";
export const RANKING_SIGNALS_CACHE_TAG = "ranking-signals";

export interface CatalogSnapshot {
  products: Product[];
  categories: Category[];
  merchants: Merchant[];
  offersByProductId: Record<string, Offer[]>;
  priceHistoryByProductId: Record<string, PriceHistory[]>;
  rankingSignals: CatalogRankingSignals;
}

async function loadCatalogSnapshot(): Promise<CatalogSnapshot> {
  await supabaseCatalogSource.initialize();

  const products = supabaseCatalogSource.getProducts();
  const offersByProductId: Record<string, Offer[]> = {};
  const priceHistoryByProductId: Record<string, PriceHistory[]> = {};

  for (const product of products) {
    offersByProductId[product.id] = supabaseCatalogSource.getOffersForProduct(product.id);
    priceHistoryByProductId[product.id] = supabaseCatalogSource.getPriceHistory(product.id);
  }

  const rankingSignals = supabaseCatalogSource.getRankingSignals
    ? supabaseCatalogSource.getRankingSignals()
    : {
        clicksByProductId: {},
        outboundClicksByProductId: {},
        viewsByProductId: {},
        favoritesByProductId: {},
        hasViewSignals: false,
        hasFavoriteSignals: false,
        updatedAt: new Date(0).toISOString(),
      };

  return {
    products,
    categories: supabaseCatalogSource.getCategories(),
    merchants: supabaseCatalogSource.getMerchants(),
    offersByProductId,
    priceHistoryByProductId,
    rankingSignals,
  };
}

/**
 * Returns the entire catalog as a single tagged + cached payload. Bridge during the
 * data-layer migration: the underlying snapshot logic still lives in the legacy
 * supabaseCatalogSource module, but every call site goes through this server-only,
 * tagged cache so admin server actions can `revalidateTag(CATALOG_CACHE_TAG)` to
 * propagate writes immediately.
 */
export const getCatalogSnapshot = unstable_cache(
  loadCatalogSnapshot,
  ["catalog:snapshot:v2"],
  { tags: [CATALOG_CACHE_TAG], revalidate: 180 },
);
