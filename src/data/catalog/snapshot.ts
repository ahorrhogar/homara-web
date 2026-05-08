import "server-only";

import { unstable_cache } from "next/cache";
import { getAnonymousSupabaseClient } from "@/integrations/supabase/anonymous";
import type { Category, Merchant, Offer, PriceHistory, Product } from "@/domain/catalog/types";
import {
  buildCategories,
  buildMerchants,
  buildOffersByProductId,
  buildPriceHistoryMap,
  buildProducts,
  type BrandRow,
  type CategoryRow,
  type MerchantRow,
  type OfferRow,
  type PriceHistoryRow,
  type ProductImageRow,
  type ProductRow,
} from "@/data/catalog/_helpers";

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
}

async function queryTable<T>(table: string, columns: string): Promise<T[]> {
  const supabase = getAnonymousSupabaseClient();
  const { data, error } = await supabase.from(table).select(columns);
  if (error) throw error;
  return (data || []) as T[];
}

async function loadCatalogSnapshot(): Promise<CatalogSnapshot> {
  const [brandRows, categoryRows, productRows, imageRows, merchantRows, offerRows, priceHistoryRows] =
    await Promise.all([
      queryTable<BrandRow>("brands", "id,name"),
      queryTable<CategoryRow>("categories", "id,name,slug,icon,image_url,parent_id"),
      queryTable<ProductRow>(
        "products",
        "id,name,brand_id,category_id,description,specs,attributes,is_active,created_at",
      ),
      queryTable<ProductImageRow>("product_images", "id,product_id,url,is_primary,sort_order"),
      queryTable<MerchantRow>("merchants", "id,name,logo_url"),
      queryTable<OfferRow>("offers", "id,product_id,merchant_id,price,old_price,url,stock,is_active,updated_at"),
      queryTable<PriceHistoryRow>("price_history", "id,product_id,price,created_at"),
    ]);

  const products = buildProducts(productRows, brandRows, categoryRows, imageRows, offerRows);
  const merchants = buildMerchants(merchantRows, offerRows);
  const offersMap = buildOffersByProductId(offerRows, merchants);
  const priceHistoryMap = buildPriceHistoryMap(priceHistoryRows);
  const categories = buildCategories(categoryRows, products);

  const offersByProductId: Record<string, Offer[]> = {};
  offersMap.forEach((offers, productId) => {
    offersByProductId[productId] = offers;
  });

  const priceHistoryByProductId: Record<string, PriceHistory[]> = {};
  priceHistoryMap.forEach((history, productId) => {
    priceHistoryByProductId[productId] = history;
  });

  return {
    products,
    categories,
    merchants,
    offersByProductId,
    priceHistoryByProductId,
  };
}

/**
 * Server-only cached read of the entire catalog (products, categories, merchants,
 * offers, price history). Mutations on /admin/* call `revalidateTag(CATALOG_CACHE_TAG)`
 * to invalidate. Ranking signals are stored separately under
 * RANKING_SIGNALS_CACHE_TAG so click-tracking can refresh independently.
 */
export const getCatalogSnapshot = unstable_cache(loadCatalogSnapshot, ["catalog:snapshot:v3"], {
  tags: [CATALOG_CACHE_TAG],
  revalidate: 180,
});
