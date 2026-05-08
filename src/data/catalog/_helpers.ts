import "server-only";

import { computeDiscountPercent } from "@/domain/catalog/product-logic";
import type {
  Category,
  Merchant,
  Offer,
  PriceHistory,
  Product,
  ProductSpec,
  Subcategory,
} from "@/domain/catalog/types";
import { PRODUCT_IMAGE_FALLBACK } from "@/lib/productImage";

export interface BrandRow {
  id: string;
  name: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug?: string | null;
  icon?: string | null;
  image_url?: string | null;
  parent_id: string | null;
}

export interface ProductRow {
  id: string;
  name: string;
  brand_id: string;
  category_id: string;
  description: string;
  specs: unknown;
  attributes?: unknown;
  is_active?: boolean | null;
  created_at: string;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  url: string;
  is_primary: boolean;
  sort_order?: number | null;
}

export interface MerchantRow {
  id: string;
  name: string;
  logo_url: string | null;
}

export interface OfferRow {
  id: string;
  product_id: string;
  merchant_id: string;
  price: number | string;
  old_price: number | string | null;
  url: string;
  stock: boolean;
  is_active?: boolean | null;
  updated_at: string;
}

export interface PriceHistoryRow {
  id: string;
  product_id: string;
  price: number | string;
  created_at: string;
}

export interface OfferRedirectRow {
  id: string;
  product_id: string;
  merchant_id: string;
  url: string;
  merchant_domain?: string | null;
}

export const SPEC_META_KEYS = new Set([
  "slug",
  "longdescription",
  "rating",
  "reviewcount",
  "tags",
  "material",
  "color",
  "style",
  "dimensions",
  "weight",
  "featured",
  "teamrecommended",
  "editorialpriority",
  "bestseller",
  "isnew",
  "sku",
  "ean",
  "isactive",
  "attributes",
]);

export const categoryMetaBySlug: Record<string, { icon: string; description: string; image?: string }> = {
  muebles: {
    icon: "Sofa",
    description: "Sofas, mesas, estanterias y mas para tu hogar",
  },
  cocina: {
    icon: "ChefHat",
    description: "Todo para tu cocina: sartenes, ollas y pequenos electrodomesticos",
  },
  electrodomesticos: {
    icon: "Zap",
    description: "Lavadoras, aspiradoras y soluciones para el hogar",
  },
};

interface MerchantDefaults {
  url: string;
  rating: number;
  reviewCount: number;
  shippingInfo: string;
  returnPolicy: string;
  paymentMethods: string[];
  trusted: boolean;
}

export const merchantDefaultsByName: Record<string, MerchantDefaults> = {
  amazon: {
    url: "https://amazon.es",
    rating: 4.5,
    reviewCount: 125000,
    shippingInfo: "Envio gratis desde 29 EUR",
    returnPolicy: "30 dias de devolucion",
    paymentMethods: ["Tarjeta", "Bizum", "Transferencia"],
    trusted: true,
  },
  ikea: {
    url: "https://ikea.com/es",
    rating: 4.3,
    reviewCount: 89000,
    shippingInfo: "Desde 4,99 EUR",
    returnPolicy: "365 dias",
    paymentMethods: ["Tarjeta", "PayPal"],
    trusted: true,
  },
  "leroy-merlin": {
    url: "https://leroymerlin.es",
    rating: 4.2,
    reviewCount: 67000,
    shippingInfo: "Gratis en tienda",
    returnPolicy: "14 dias",
    paymentMethods: ["Tarjeta", "PayPal", "Bizum"],
    trusted: true,
  },
  mediamarkt: {
    url: "https://mediamarkt.es",
    rating: 4.2,
    reviewCount: 72000,
    shippingInfo: "Gratis desde 49 EUR",
    returnPolicy: "30 dias",
    paymentMethods: ["Tarjeta", "PayPal", "Bizum"],
    trusted: true,
  },
  carrefour: {
    url: "https://carrefour.es",
    rating: 4.0,
    reviewCount: 55000,
    shippingInfo: "Desde 3,99 EUR",
    returnPolicy: "14 dias",
    paymentMethods: ["Tarjeta", "PayPal"],
    trusted: true,
  },
};

// Combining diacritical marks block (U+0300–U+036F).
const DIACRITICS_REGEX = /[̀-ͯ]/g;

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .toLowerCase()
    .trim();
}

export function buildSearchTokens(value: string): string[] {
  return normalizeSearchValue(value)
    .split(/[\s-]+/)
    .map((token) => token.replace(/[^a-z0-9]/g, ""))
    .filter((token) => token.length >= 2)
    .slice(0, 8);
}

export function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

export function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

export function parseSpecs(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export function toSpecArray(value: unknown, filterMetaKeys = false): ProductSpec[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const record = entry as Record<string, unknown>;
        const label = typeof record.label === "string" ? record.label : "";
        const specValue = typeof record.value === "string" ? record.value : "";
        if (!label || !specValue) return null;
        return { label, value: specValue };
      })
      .filter((entry): entry is ProductSpec => Boolean(entry));
  }

  if (!value || typeof value !== "object") return [];

  return Object.entries(value as Record<string, unknown>)
    .map(([label, specValue]) => {
      const normalizedLabel = label.trim();
      const normalizedLabelKey = normalizedLabel.toLowerCase().replace(/[^a-z0-9]/g, "");

      if (!normalizedLabel || (filterMetaKeys && SPEC_META_KEYS.has(normalizedLabelKey))) return null;
      if (specValue === null || specValue === undefined) return null;
      if (!["string", "number", "boolean"].includes(typeof specValue)) return null;

      const normalizedValue = String(specValue).trim();
      if (!normalizedLabel || !normalizedValue) return null;

      return { label: normalizedLabel, value: normalizedValue };
    })
    .filter((entry): entry is ProductSpec => Boolean(entry));
}

export function extractDomainUrl(urlValue: string | null | undefined, fallback: string): string {
  if (!urlValue) return fallback;
  try {
    const parsed = new URL(urlValue);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return fallback;
  }
}

export function groupByKey<T>(rows: T[], keySelector: (row: T) => string): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const key = keySelector(row);
    const current = grouped.get(key) || [];
    current.push(row);
    grouped.set(key, current);
  }
  return grouped;
}

function toIsoDate(dateValue: string): string {
  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime())
    ? new Date().toISOString().split("T")[0]
    : parsed.toISOString().split("T")[0];
}

export function buildCategories(categoryRows: CategoryRow[], products: Product[]): Category[] {
  const categoriesById = new Map(categoryRows.map((row) => [row.id, row]));
  const topCategoryRows = categoryRows.filter((row) => !row.parent_id);
  const subcategoryRowsByParentId = groupByKey(
    categoryRows.filter((row) => Boolean(row.parent_id)),
    (row) => row.parent_id as string,
  );

  const productCountByCategoryId = new Map<string, number>();
  const productCountBySubcategoryId = new Map<string, number>();

  for (const product of products) {
    productCountByCategoryId.set(product.categoryId, (productCountByCategoryId.get(product.categoryId) || 0) + 1);
    productCountBySubcategoryId.set(
      product.subcategoryId,
      (productCountBySubcategoryId.get(product.subcategoryId) || 0) + 1,
    );
  }

  return topCategoryRows
    .map((row) => {
      const slug = row.slug ? slugify(row.slug) : slugify(row.name);
      const meta = categoryMetaBySlug[slug] || {
        icon: "Archive",
        description: `Compara precios de ${row.name.toLowerCase()} en tiempo real`,
      };

      const subcategories = (subcategoryRowsByParentId.get(row.id) || []).map((subRow): Subcategory => ({
        id: subRow.id,
        categoryId: row.id,
        name: subRow.name,
        slug: subRow.slug ? slugify(subRow.slug) : slugify(subRow.name),
        image: subRow.image_url || PRODUCT_IMAGE_FALLBACK,
        productCount: productCountBySubcategoryId.get(subRow.id) || 0,
      }));

      const directCount = productCountByCategoryId.get(row.id) || 0;
      const nestedCount = subcategories.reduce((sum, subcategory) => sum + subcategory.productCount, 0);

      return {
        id: row.id,
        name: row.name,
        slug,
        icon: row.icon || meta.icon,
        description: meta.description,
        image: row.image_url || meta.image || PRODUCT_IMAGE_FALLBACK,
        productCount: directCount + nestedCount,
        subcategories,
      };
    })
    .filter((category) => categoriesById.has(category.id));
}

export function buildProducts(
  productRows: ProductRow[],
  brandRows: BrandRow[],
  categoryRows: CategoryRow[],
  imageRows: ProductImageRow[],
  offerRows: OfferRow[],
): Product[] {
  const brandsById = new Map(brandRows.map((row) => [row.id, row.name]));
  const categoriesById = new Map(categoryRows.map((row) => [row.id, row]));
  const imagesByProductId = groupByKey(imageRows, (row) => row.product_id);
  const offersByProductId = groupByKey(offerRows, (row) => row.product_id);

  return productRows
    .map((row): Product | null => {
      if (row.is_active === false) return null;

      const categoryRow = categoriesById.get(row.category_id);
      if (!categoryRow) return null;

      const parentCategory = categoryRow.parent_id ? categoriesById.get(categoryRow.parent_id) : categoryRow;
      const categoryId = parentCategory?.id || categoryRow.id;
      const subcategoryId = categoryRow.id;

      const offers = (offersByProductId.get(row.id) || []).filter((offer) => offer.is_active !== false);
      const minPrice = offers.length > 0 ? Math.min(...offers.map((offer) => toNumber(offer.price))) : 0;
      const maxPrice = offers.length > 0 ? Math.max(...offers.map((offer) => toNumber(offer.price))) : minPrice;
      const originalPriceCandidate =
        offers.length > 0 ? Math.max(...offers.map((offer) => toNumber(offer.old_price, 0))) : 0;
      const originalPrice = originalPriceCandidate > minPrice ? originalPriceCandidate : undefined;

      const specsRecord = parseSpecs(row.specs);
      const rowAttributes = parseSpecs(row.attributes);
      const specsFromAttributes = toSpecArray(specsRecord.attributes);
      const specsFromRecord = toSpecArray(specsRecord, true);
      const specsFromColumnAttributes = toSpecArray(rowAttributes, true);
      const productSpecs = specsFromAttributes.length
        ? specsFromAttributes
        : specsFromRecord.length
          ? specsFromRecord
          : specsFromColumnAttributes;
      const rawAttributes = parseSpecs(specsRecord.attributes);
      const effectiveAttributes = Object.keys(rawAttributes).length > 0 ? rawAttributes : rowAttributes;
      const editorialPriorityValue = toNumber(
        (specsRecord.editorialPriority as number | string | null | undefined) ??
          (effectiveAttributes.editorialPriority as number | string | null | undefined),
        0,
      );
      const editorialPriority = Math.max(0, Math.min(100, Math.round(editorialPriorityValue)));

      const images = (imagesByProductId.get(row.id) || [])
        .sort((left, right) => {
          const leftSortOrder = Number(left.sort_order ?? 0);
          const rightSortOrder = Number(right.sort_order ?? 0);
          if (leftSortOrder !== rightSortOrder) return leftSortOrder - rightSortOrder;

          const primaryDiff = Number(right.is_primary) - Number(left.is_primary);
          if (primaryDiff !== 0) return primaryDiff;

          return String(left.id).localeCompare(String(right.id));
        })
        .map((image) => image.url);

      const discountPercent = computeDiscountPercent({ minPrice, originalPrice }) || undefined;

      return {
        id: row.id,
        name: row.name,
        slug: typeof specsRecord.slug === "string" ? specsRecord.slug : slugify(row.name),
        categoryId,
        subcategoryId,
        brand: brandsById.get(row.brand_id) || "Marca desconocida",
        description: row.description,
        longDescription:
          typeof specsRecord.longDescription === "string" ? specsRecord.longDescription : row.description,
        images,
        minPrice,
        maxPrice,
        originalPrice,
        discountPercent,
        rating: toNumber(specsRecord.rating, 0),
        reviewCount: Math.max(0, Math.floor(toNumber(specsRecord.reviewCount, 0))),
        offerCount: offers.length,
        specs: productSpecs,
        tags: toStringArray(specsRecord.tags),
        material: typeof specsRecord.material === "string" ? specsRecord.material : undefined,
        color: typeof specsRecord.color === "string" ? specsRecord.color : undefined,
        style: typeof specsRecord.style === "string" ? specsRecord.style : undefined,
        dimensions: typeof specsRecord.dimensions === "string" ? specsRecord.dimensions : undefined,
        weight: typeof specsRecord.weight === "string" ? specsRecord.weight : undefined,
        featured: toBoolean(specsRecord.featured ?? effectiveAttributes.featured),
        teamRecommended: toBoolean(specsRecord.teamRecommended ?? effectiveAttributes.teamRecommended),
        editorialPriority,
        bestSeller: toBoolean(specsRecord.bestSeller),
        isNew: toBoolean(specsRecord.isNew),
      } satisfies Product;
    })
    .filter((product): product is Product => Boolean(product));
}

export function buildMerchants(merchantRows: MerchantRow[], offerRows: OfferRow[]): Merchant[] {
  const offersByMerchantId = groupByKey(offerRows, (row) => row.merchant_id);

  return merchantRows.map((row): Merchant => {
    const key = slugify(row.name);
    const defaults = merchantDefaultsByName[key] || {
      url: `https://${slugify(row.name)}.com`,
      rating: 4.0,
      reviewCount: 10000,
      shippingInfo: "Envio segun condiciones de tienda",
      returnPolicy: "Devolucion segun tienda",
      paymentMethods: ["Tarjeta"],
      trusted: true,
    };

    const firstOffer = (offersByMerchantId.get(row.id) || [])[0];

    return {
      id: row.id,
      name: row.name,
      logo: row.logo_url || undefined,
      rating: defaults.rating,
      reviewCount: defaults.reviewCount,
      url: extractDomainUrl(firstOffer?.url, defaults.url),
      shippingInfo: defaults.shippingInfo,
      returnPolicy: defaults.returnPolicy,
      paymentMethods: defaults.paymentMethods,
      trusted: defaults.trusted,
    };
  });
}

export function buildOffersByProductId(offerRows: OfferRow[], merchants: Merchant[]): Map<string, Offer[]> {
  const merchantsById = new Map(merchants.map((merchant) => [merchant.id, merchant]));

  const mappedOffers = offerRows
    .map((row): Offer | null => {
      if (row.is_active === false) return null;

      const merchant = merchantsById.get(row.merchant_id);
      if (!merchant) return null;

      const price = toNumber(row.price, 0);
      const shippingCost = price >= 80 ? 0 : 4.99;

      return {
        id: row.id,
        productId: row.product_id,
        merchantId: row.merchant_id,
        merchant,
        price,
        originalPrice: toNumber(row.old_price, 0) > price ? toNumber(row.old_price, 0) : undefined,
        shippingCost,
        freeShipping: shippingCost === 0,
        fastShipping: true,
        inStock: row.stock,
        url: row.url,
        lastUpdated: new Date(row.updated_at).toISOString(),
      };
    })
    .filter((offer): offer is Offer => Boolean(offer));

  const offersByProductId = groupByKey(mappedOffers, (offer) => offer.productId);

  offersByProductId.forEach((offers, productId) => {
    offersByProductId.set(
      productId,
      [...offers].sort((left, right) => left.price + left.shippingCost - (right.price + right.shippingCost)),
    );
  });

  return offersByProductId;
}

export function buildPriceHistoryMap(rows: PriceHistoryRow[]): Map<string, PriceHistory[]> {
  const grouped = groupByKey(rows, (row) => row.product_id);
  const historyByProductId = new Map<string, PriceHistory[]>();

  grouped.forEach((historyRows, productId) => {
    const mapped = historyRows
      .map((row) => ({
        date: toIsoDate(row.created_at),
        price: toNumber(row.price, 0),
      }))
      .sort((left, right) => left.date.localeCompare(right.date));

    historyByProductId.set(productId, mapped);
  });

  return historyByProductId;
}
