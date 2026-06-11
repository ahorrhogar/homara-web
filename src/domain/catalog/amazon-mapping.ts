/**
 * Pure mapping from an Amazon Creators API item to Homara's catalog shape.
 *
 * No I/O, no React, no server-only imports — this is domain logic and is unit
 * tested against captured API fixtures. The data layer / admin services call
 * this, then persist the result via Prisma.
 *
 * Key conventions (see SPEC_META_KEYS in src/data/catalog/_helpers.ts):
 *  - Editorial/meta fields live in Product.specs JSON: slug, ean, material,
 *    color, style, dimensions, weight, plus a new `energyclass`.
 *  - Product.attributes holds non-display metadata (asin, raw features, source).
 *  - Amazon never returns ratings/review counts, so `rating` is NOT set here.
 */

import type {
  AmazonItem,
  AmazonItemDimensions,
  AmazonOfferListing,
} from "@/infrastructure/amazon/types";

const DIACRITICS_REGEX = /[̀-ͯ]/g;

/** Same algorithm as data/catalog/_helpers.ts slugify (kept pure here). */
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

export interface NormalizedAmazonOffer {
  /** Buying price in major currency units (e.g. euros). */
  price: number | null;
  /** List/was price, when discounted. */
  oldPrice: number | null;
  currency: string;
  availabilityType: string | null;
  inStock: boolean;
  isBuyBoxWinner: boolean;
  savingsPercent: number | null;
  dealBadge: string | null;
  /** SUBSCRIBE_AND_SAVE / LIGHTNING_DEAL / null. */
  offerType: string | null;
  violatesMAP: boolean;
}

export interface NormalizedAmazonProduct {
  asin: string;
  name: string;
  brandName: string | null;
  /** The vended affiliate link — stored and used UNALTERED. */
  detailPageURL: string | null;
  primaryImageUrl: string | null;
  imageUrls: string[];
  ean: string | null;
  features: string[];
  /** Short description derived from the top features (admin-editable later). */
  description: string;
  longDescription: string;
  /** Ready-to-merge into Product.specs (lowercased meta keys). */
  specs: Record<string, unknown>;
  /** Ready-to-merge into Product.attributes. */
  attributes: Record<string, unknown>;
  offer: NormalizedAmazonOffer;
}

const IN_STOCK_TYPES = new Set(["IN_STOCK", "IN_STOCK_SCARCE"]);

function firstDisplayValue(values?: { displayValues?: string[] | null } | null): string | null {
  const list = values?.displayValues;
  return list && list.length > 0 ? list[0] : null;
}

/** Pick the buy-box listing, falling back to the first listing. */
export function pickListing(item: AmazonItem): AmazonOfferListing | null {
  const listings = item.offersV2?.listings ?? [];
  if (listings.length === 0) return null;
  return listings.find((l) => l.isBuyBoxWinner) ?? listings[0];
}

function formatDimensions(dims?: AmazonItemDimensions | null): string | null {
  if (!dims) return null;
  const parts: string[] = [];
  const fmt = (d?: { displayValue?: number | null; unit?: string | null } | null) =>
    d?.displayValue != null ? `${d.displayValue}${d.unit ? ` ${d.unit}` : ""}` : null;
  const l = fmt(dims.length);
  const w = fmt(dims.width);
  const h = fmt(dims.height);
  const lwh = [l, w, h].filter(Boolean);
  if (lwh.length > 0) parts.push(lwh.join(" × "));
  return parts.length > 0 ? parts.join("; ") : null;
}

function mapOffer(item: AmazonItem): NormalizedAmazonOffer {
  const listing = pickListing(item);
  if (!listing) {
    // No featured offer → Amazon treats the item as out of stock.
    return {
      price: null,
      oldPrice: null,
      currency: "EUR",
      availabilityType: "OUT_OF_STOCK",
      inStock: false,
      isBuyBoxWinner: false,
      savingsPercent: null,
      dealBadge: null,
      offerType: null,
      violatesMAP: false,
    };
  }

  const money = listing.price?.money;
  const savingBasis = listing.price?.savingBasis?.money;
  const availabilityType = listing.availability?.type ?? null;

  return {
    price: money?.amount ?? null,
    oldPrice: savingBasis?.amount ?? null,
    currency: money?.currency ?? "EUR",
    availabilityType,
    inStock: availabilityType ? IN_STOCK_TYPES.has(availabilityType) : money?.amount != null,
    isBuyBoxWinner: Boolean(listing.isBuyBoxWinner),
    savingsPercent: listing.price?.savings?.percentage ?? null,
    dealBadge: listing.dealDetails?.badge ?? null,
    offerType: listing.type ?? null,
    violatesMAP: Boolean(listing.violatesMAP),
  };
}

export function mapAmazonItem(item: AmazonItem): NormalizedAmazonProduct {
  const info = item.itemInfo;
  const name = info?.title?.displayValue?.trim() || item.asin;
  const brandName =
    info?.byLineInfo?.brand?.displayValue?.trim() ||
    info?.byLineInfo?.manufacturer?.displayValue?.trim() ||
    null;

  const primaryImageUrl =
    item.images?.primary?.large?.url || item.images?.primary?.medium?.url || null;
  const imageUrls = (item.images?.variants ?? [])
    .map((v) => v.large?.url || v.medium?.url)
    .filter((u): u is string => Boolean(u));

  const features = (info?.features?.displayValues ?? []).filter(Boolean);
  const ean = firstDisplayValue(info?.externalIds?.eans);
  const color = info?.productInfo?.color?.displayValue ?? null;
  const size = info?.productInfo?.size?.displayValue ?? null;
  const dimensions = formatDimensions(info?.productInfo?.itemDimensions);
  const weightDim = info?.productInfo?.itemDimensions?.weight;
  const weight =
    weightDim?.displayValue != null
      ? `${weightDim.displayValue}${weightDim.unit ? ` ${weightDim.unit}` : ""}`
      : null;
  const energyClass = info?.technicalInfo?.energyEfficiencyClass?.displayValue ?? null;
  const model = info?.manufactureInfo?.model?.displayValue ?? null;

  const description = features.slice(0, 2).join(" ").slice(0, 480) || name;
  const longDescription = features.join("\n");

  const specs: Record<string, unknown> = { slug: slugify(name) };
  if (ean) specs.ean = ean;
  if (color) specs.color = color;
  if (size) specs.style = size;
  if (dimensions) specs.dimensions = dimensions;
  if (weight) specs.weight = weight;
  if (energyClass) specs.energyclass = energyClass;
  if (model) specs.sku = model;
  if (longDescription) specs.longdescription = longDescription;

  const attributes: Record<string, unknown> = {
    source: "amazon-creatorsapi",
    asin: item.asin,
    parentAsin: item.parentASIN ?? null,
    amazonFeatures: features,
  };

  return {
    asin: item.asin,
    name,
    brandName,
    detailPageURL: item.detailPageURL ?? null,
    primaryImageUrl,
    imageUrls,
    ean,
    features,
    description,
    longDescription,
    specs,
    attributes,
    offer: mapOffer(item),
  };
}

/**
 * Detects whether a price change is large enough to flag for human review.
 * Returns the absolute fractional change, and whether it exceeds `threshold`
 * (default ±25%). Used by the cron to flag big swings (still auto-applied).
 */
export function detectPriceSwing(
  oldPrice: number | null | undefined,
  newPrice: number | null | undefined,
  threshold = 0.25,
): { changed: boolean; fraction: number; flagged: boolean } {
  if (oldPrice == null || newPrice == null || oldPrice <= 0) {
    return { changed: oldPrice !== newPrice, fraction: 0, flagged: false };
  }
  const fraction = Math.abs(newPrice - oldPrice) / oldPrice;
  return { changed: newPrice !== oldPrice, fraction, flagged: fraction >= threshold };
}
