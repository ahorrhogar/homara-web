import "server-only";

import { unstable_cache } from "next/cache";

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
import type { Category, Merchant, Offer, PriceHistory, Product } from "@/domain/catalog/types";
import { db } from "@/lib/db";

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

async function loadCatalogSnapshot(): Promise<CatalogSnapshot> {
  const [brands, categories, products, images, merchants, offers, prices] = await Promise.all([
    db.brand.findMany({ select: { id: true, name: true } }),
    db.category.findMany({
      select: { id: true, name: true, slug: true, icon: true, imageUrl: true, parentId: true },
    }),
    db.product.findMany({
      select: {
        id: true,
        name: true,
        brandId: true,
        categoryId: true,
        description: true,
        specs: true,
        attributes: true,
        isActive: true,
        createdAt: true,
      },
    }),
    db.productImage.findMany({
      select: { id: true, productId: true, url: true, isPrimary: true, sortOrder: true },
    }),
    db.merchant.findMany({ select: { id: true, name: true, logoUrl: true } }),
    db.offer.findMany({
      select: {
        id: true,
        productId: true,
        merchantId: true,
        price: true,
        oldPrice: true,
        url: true,
        stock: true,
        isActive: true,
        updatedAt: true,
      },
    }),
    db.priceHistory.findMany({
      select: { id: true, productId: true, price: true, createdAt: true },
    }),
  ]);

  // _helpers.ts expects snake_case row types. Map Prisma's camelCase here so the
  // domain helpers (and their tests) stay untouched.
  const brandRows: BrandRow[] = brands.map((b) => ({ id: b.id, name: b.name }));

  const categoryRows: CategoryRow[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug ?? null,
    icon: c.icon ?? null,
    image_url: c.imageUrl ?? null,
    parent_id: c.parentId,
  }));

  const productRows: ProductRow[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    brand_id: p.brandId,
    category_id: p.categoryId,
    description: p.description,
    specs: p.specs,
    attributes: p.attributes,
    is_active: p.isActive,
    created_at: p.createdAt.toISOString(),
  }));

  const imageRows: ProductImageRow[] = images.map((i) => ({
    id: i.id,
    product_id: i.productId,
    url: i.url,
    is_primary: i.isPrimary,
    sort_order: i.sortOrder,
  }));

  const merchantRows: MerchantRow[] = merchants.map((m) => ({
    id: m.id,
    name: m.name,
    logo_url: m.logoUrl,
  }));

  const offerRows: OfferRow[] = offers.map((o) => ({
    id: o.id,
    product_id: o.productId,
    merchant_id: o.merchantId,
    price: o.price.toString(),
    old_price: o.oldPrice ? o.oldPrice.toString() : null,
    url: o.url,
    stock: o.stock,
    is_active: o.isActive,
    updated_at: o.updatedAt.toISOString(),
  }));

  const priceHistoryRows: PriceHistoryRow[] = prices.map((p) => ({
    id: p.id,
    product_id: p.productId,
    price: p.price.toString(),
    created_at: p.createdAt.toISOString(),
  }));

  const builtProducts = buildProducts(productRows, brandRows, categoryRows, imageRows, offerRows);
  const builtMerchants = buildMerchants(merchantRows, offerRows);
  const offersMap = buildOffersByProductId(offerRows, builtMerchants);
  const priceHistoryMap = buildPriceHistoryMap(priceHistoryRows);
  const builtCategories = buildCategories(categoryRows, builtProducts);

  const offersByProductId: Record<string, Offer[]> = {};
  offersMap.forEach((value, key) => {
    offersByProductId[key] = value;
  });

  const priceHistoryByProductId: Record<string, PriceHistory[]> = {};
  priceHistoryMap.forEach((value, key) => {
    priceHistoryByProductId[key] = value;
  });

  return {
    products: builtProducts,
    categories: builtCategories,
    merchants: builtMerchants,
    offersByProductId,
    priceHistoryByProductId,
  };
}

/**
 * Server-only cached read of the entire catalog. Mutations on /admin/* call
 * `revalidateTag(CATALOG_CACHE_TAG)` to invalidate. Ranking signals are stored
 * separately under RANKING_SIGNALS_CACHE_TAG so click-tracking can refresh
 * independently.
 */
export const getCatalogSnapshot = unstable_cache(loadCatalogSnapshot, ["catalog:snapshot:v4"], {
  tags: [CATALOG_CACHE_TAG],
  revalidate: 180,
});
