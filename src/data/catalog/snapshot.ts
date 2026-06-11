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
import { routing } from "@/i18n/routing";
import { db } from "@/lib/db";

export const DEFAULT_LOCALE = routing.defaultLocale;

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

interface ProductTranslationOverlay {
  name: string;
  description: string;
  longDescription: string | null;
}

interface TranslationMaps {
  productById: Map<string, ProductTranslationOverlay>;
  categoryById: Map<string, string>;
}

function emptyTranslationMaps(): TranslationMaps {
  return { productById: new Map(), categoryById: new Map() };
}

/**
 * Reads the sidecar translation rows for `locale`. Resilient by design: if the
 * tables don't exist yet (pre-migration) or the query fails, returns empty maps
 * so every product/category keeps its canonical base value. When `locale` is the
 * default and rows are backfilled to equal the base, the overlay is a no-op and
 * output stays byte-identical.
 */
async function loadTranslationMaps(locale: string): Promise<TranslationMaps> {
  try {
    const [productTranslations, categoryTranslations] = await Promise.all([
      db.productTranslation.findMany({
        where: { locale },
        select: { productId: true, name: true, description: true, longDescription: true },
      }),
      db.categoryTranslation.findMany({
        where: { locale },
        select: { categoryId: true, name: true },
      }),
    ]);

    return {
      productById: new Map(
        productTranslations.map((row) => [
          row.productId,
          { name: row.name, description: row.description, longDescription: row.longDescription },
        ]),
      ),
      categoryById: new Map(categoryTranslations.map((row) => [row.categoryId, row.name])),
    };
  } catch {
    return emptyTranslationMaps();
  }
}

/**
 * Overlays translated display fields onto already-built products. `slug` is never
 * touched — it is derived from the base name so URLs stay stable across locales.
 */
function applyProductTranslations(
  products: Product[],
  byId: Map<string, ProductTranslationOverlay>,
): Product[] {
  if (byId.size === 0) return products;
  return products.map((product) => {
    const tr = byId.get(product.id);
    if (!tr) return product;
    return {
      ...product,
      name: tr.name || product.name,
      description: tr.description || product.description,
      longDescription: tr.longDescription ?? product.longDescription,
    };
  });
}

/**
 * Overlays translated category + subcategory names. Category `description` stays
 * meta-derived (see `categoryMetaBySlug`) and `slug` stays base-derived, so only
 * the display name changes per locale.
 */
function applyCategoryTranslations(categories: Category[], byId: Map<string, string>): Category[] {
  if (byId.size === 0) return categories;
  return categories.map((category) => ({
    ...category,
    name: byId.get(category.id) || category.name,
    subcategories: category.subcategories.map((subcategory) => ({
      ...subcategory,
      name: byId.get(subcategory.id) || subcategory.name,
    })),
  }));
}

async function loadCatalogSnapshot(locale: string): Promise<CatalogSnapshot> {
  const translationsPromise = loadTranslationMaps(locale);
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

  const translations = await translationsPromise;
  const builtProducts = applyProductTranslations(
    buildProducts(productRows, brandRows, categoryRows, imageRows, offerRows),
    translations.productById,
  );
  const builtMerchants = buildMerchants(merchantRows, offerRows);
  const offersMap = buildOffersByProductId(offerRows, builtMerchants);
  const priceHistoryMap = buildPriceHistoryMap(priceHistoryRows);
  const builtCategories = applyCategoryTranslations(
    buildCategories(categoryRows, builtProducts),
    translations.categoryById,
  );

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

const cachedCatalogSnapshot = unstable_cache(loadCatalogSnapshot, ["catalog:snapshot:v5"], {
  tags: [CATALOG_CACHE_TAG],
  revalidate: 180,
});

/**
 * Server-only cached read of the entire catalog for a locale. The `locale`
 * argument is part of the cache key, so `es` and a future `en` never share a
 * payload. Defaults to the routing default locale so untouched call sites keep
 * serving Spanish. Mutations on /admin/* call `revalidateTag(CATALOG_CACHE_TAG)`,
 * which invalidates every locale at once.
 */
export function getCatalogSnapshot(locale: string = DEFAULT_LOCALE): Promise<CatalogSnapshot> {
  return cachedCatalogSnapshot(locale);
}
