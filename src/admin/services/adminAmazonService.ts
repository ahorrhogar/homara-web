"use server";

import { Prisma } from "@prisma/client";
import { revalidateTag } from "next/cache";

import { slugify } from "@/data/catalog/_helpers";
import {
  CATALOG_CACHE_TAG,
  CATEGORIES_CACHE_TAG,
  RANKING_SIGNALS_CACHE_TAG,
} from "@/data/catalog/snapshot";
import {
  mapAmazonItem,
  type NormalizedAmazonProduct,
} from "@/domain/catalog/amazon-mapping";
import { AmazonApiError } from "@/infrastructure/amazon/client";
import { getItems, getVariations, searchItems } from "@/infrastructure/amazon/operations";
import type { SearchItemsParams } from "@/infrastructure/amazon/types";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { normalizeExternalImageUrl } from "@/lib/r2";

const AMAZON_SOURCE = "amazon-creatorsapi";
const AMAZON_MERCHANT_NAME = "Amazon";
const AMAZON_MERCHANT_DOMAIN = "amazon.es";
const MARKETPLACE = process.env.AMAZON_MARKETPLACE ?? "www.amazon.es";
/** Re-check Amazon prices a little under the 1h offer-cache TTL. */
const PRICE_RECHECK_MS = 50 * 60 * 1000;

// ─── Public record shapes ───────────────────────────────────────────────

export interface AmazonSearchResult extends NormalizedAmazonProduct {
  /** Already imported as a live Amazon offer. */
  inCatalog: boolean;
  /** Sitting in the approval queue (pending/approved). */
  queued: boolean;
}

export interface AmazonCandidateRecord {
  id: string;
  asin: string;
  status: string;
  name: string;
  brandName: string | null;
  price: number | null;
  currency: string;
  primaryImageUrl: string | null;
  detailPageURL: string | null;
  sourceQuery: string | null;
  productId: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ApproveCandidateInput {
  id: string;
  /** Required: Homara category the product belongs to (Amazon nodes ≠ our tree). */
  categoryId: string;
  /** Optional overrides; default to the scraped values. */
  brandId?: string;
  brandName?: string;
  name?: string;
  description?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────

function invalidateCatalog() {
  revalidateTag(CATALOG_CACHE_TAG, "default");
  revalidateTag(CATEGORIES_CACHE_TAG, "default");
  revalidateTag(RANKING_SIGNALS_CACHE_TAG, "default");
}

async function logAudit(
  userId: string,
  action: string,
  entityId: string | null,
  payload: Record<string, unknown> = {},
): Promise<void> {
  try {
    await db.adminAction.create({
      data: {
        userId,
        action,
        entityType: "amazon",
        entityId,
        payload: { source: "adminAmazonService", ...payload } as Prisma.InputJsonValue,
      },
    });
  } catch {
    // never block on audit failures
  }
}

/**
 * Wraps a Creators API call so account-eligibility / throttle errors surface as
 * a readable Spanish message instead of an opaque stack. The account needs ≥10
 * qualifying sales in the last 30 days before Amazon returns data.
 */
function friendlyApiError(error: unknown): Error {
  if (error instanceof AmazonApiError) {
    const body = error.body as { reason?: string; message?: string } | string | undefined;
    const reason = typeof body === "object" ? body?.reason : undefined;
    if (error.status === 403 || reason === "AssociateNotEligible") {
      return new Error(
        "La cuenta de Amazon Afiliados aún no es elegible para la API (requiere 10 ventas en los últimos 30 días).",
      );
    }
    if (error.status === 429) {
      return new Error("Amazon ha limitado las peticiones (TPS). Inténtalo de nuevo en unos segundos.");
    }
    return new Error(`Error de la API de Amazon (HTTP ${error.status}).`);
  }
  return error instanceof Error ? error : new Error("Error desconocido al llamar a la API de Amazon.");
}

async function annotate(results: NormalizedAmazonProduct[]): Promise<AmazonSearchResult[]> {
  const asins = results.map((r) => r.asin);
  if (asins.length === 0) return [];
  const [offers, candidates] = await Promise.all([
    db.offer.findMany({
      where: { externalSource: "amazon", externalId: { in: asins } },
      select: { externalId: true },
    }),
    db.amazonScrapeCandidate.findMany({
      where: { asin: { in: asins }, status: { in: ["pending", "approved", "imported"] } },
      select: { asin: true },
    }),
  ]);
  const inCatalog = new Set(offers.map((o) => o.externalId));
  const queued = new Set(candidates.map((c) => c.asin));
  return results.map((r) => ({
    ...r,
    inCatalog: inCatalog.has(r.asin),
    queued: queued.has(r.asin),
  }));
}

async function ensureAmazonMerchant(): Promise<string> {
  const existing = await db.merchant.findFirst({
    where: {
      OR: [
        { domain: AMAZON_MERCHANT_DOMAIN },
        { name: { equals: AMAZON_MERCHANT_NAME, mode: "insensitive" } },
      ],
    },
    select: { id: true, domain: true },
  });
  if (existing) {
    // Backfill the domain so the redirect allow-list passes.
    if (existing.domain !== AMAZON_MERCHANT_DOMAIN) {
      await db.merchant.update({
        where: { id: existing.id },
        data: { domain: AMAZON_MERCHANT_DOMAIN },
      });
    }
    return existing.id;
  }
  const created = await db.merchant.create({
    data: {
      name: AMAZON_MERCHANT_NAME,
      domain: AMAZON_MERCHANT_DOMAIN,
      country: "ES",
      brandColor: "#FF9900",
    },
    select: { id: true },
  });
  return created.id;
}

async function ensureBrand(name: string): Promise<string> {
  const trimmed = name.trim() || "Genérico";
  const existing = await db.brand.findUnique({ where: { name: trimmed }, select: { id: true } });
  if (existing) return existing.id;
  const created = await db.brand.create({ data: { name: trimmed }, select: { id: true } });
  return created.id;
}

// ─── Read operations (search / preview / similar) ────────────────────────

export async function searchAmazon(params: SearchItemsParams): Promise<{
  results: AmazonSearchResult[];
  totalResultCount: number;
}> {
  await requireAdmin();
  try {
    const { items, totalResultCount } = await searchItems(params);
    const results = await annotate(items.map(mapAmazonItem));
    return { results, totalResultCount };
  } catch (error) {
    throw friendlyApiError(error);
  }
}

export async function getAmazonByAsin(asins: string[]): Promise<AmazonSearchResult[]> {
  await requireAdmin();
  const cleaned = asins.map((a) => a.trim().toUpperCase()).filter(Boolean);
  if (cleaned.length === 0) return [];
  try {
    const { items } = await getItems(cleaned);
    return annotate(items.map(mapAmazonItem));
  } catch (error) {
    throw friendlyApiError(error);
  }
}

/**
 * Finds products similar to a seed ASIN. There is no native "similar"
 * operation, so we combine GetVariations (same parent) with a SearchItems on
 * the seed's brand + leading title words.
 */
export async function findSimilarAmazon(asin: string): Promise<AmazonSearchResult[]> {
  await requireAdmin();
  const clean = asin.trim().toUpperCase();
  try {
    const seed = (await getItems([clean])).items[0];
    if (!seed) return [];
    const mappedSeed = mapAmazonItem(seed);

    const [variations, search] = await Promise.all([
      seed.parentASIN ? getVariations(clean).catch(() => ({ items: [] })) : Promise.resolve({ items: [] }),
      searchItems({
        keywords: mappedSeed.name.split(/\s+/).slice(0, 4).join(" "),
        brand: mappedSeed.brandName ?? undefined,
        itemCount: 10,
      }).catch(() => ({ items: [], totalResultCount: 0, searchURL: null })),
    ]);

    const byAsin = new Map<string, NormalizedAmazonProduct>();
    for (const item of [...variations.items, ...search.items]) {
      const m = mapAmazonItem(item);
      if (m.asin !== clean) byAsin.set(m.asin, m);
    }
    return annotate([...byAsin.values()]);
  } catch (error) {
    throw friendlyApiError(error);
  }
}

// ─── Queue operations ────────────────────────────────────────────────────

function toCandidateRecord(row: {
  id: string;
  asin: string;
  status: string;
  normalized: unknown;
  sourceQuery: string | null;
  productId: string | null;
  notes: string | null;
  createdAt: Date;
}): AmazonCandidateRecord {
  const n = (row.normalized ?? {}) as Partial<NormalizedAmazonProduct>;
  return {
    id: row.id,
    asin: row.asin,
    status: row.status,
    name: n.name ?? row.asin,
    brandName: n.brandName ?? null,
    price: n.offer?.price ?? null,
    currency: n.offer?.currency ?? "EUR",
    primaryImageUrl: n.primaryImageUrl ?? null,
    detailPageURL: n.detailPageURL ?? null,
    sourceQuery: row.sourceQuery,
    productId: row.productId,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Adds (or refreshes) a candidate in the approval queue, keyed by ASIN. */
export async function queueCandidate(
  normalized: NormalizedAmazonProduct,
  sourceQuery?: string,
): Promise<AmazonCandidateRecord> {
  const session = await requireAdmin();
  const existing = await db.amazonScrapeCandidate.findUnique({
    where: { asin: normalized.asin },
    select: { id: true, status: true },
  });

  const data = {
    marketplace: MARKETPLACE,
    normalized: normalized as unknown as Prisma.InputJsonValue,
    sourceQuery: sourceQuery ?? null,
    suggestedBrand: normalized.brandName ?? null,
    discoveredBy: session.user.id,
  };

  const row =
    existing && existing.status !== "imported"
      ? await db.amazonScrapeCandidate.update({
          where: { id: existing.id },
          data: { ...data, status: "pending" },
        })
      : await db.amazonScrapeCandidate.upsert({
          where: { asin: normalized.asin },
          create: { asin: normalized.asin, status: "pending", ...data },
          update: data,
        });

  await logAudit(session.user.id, "amazon.queue", row.id, { asin: normalized.asin });
  return toCandidateRecord(row);
}

export async function listCandidates(status = "pending"): Promise<AmazonCandidateRecord[]> {
  await requireAdmin();
  const rows = await db.amazonScrapeCandidate.findMany({
    where: status === "all" ? {} : { status },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return rows.map(toCandidateRecord);
}

export async function rejectCandidate(id: string): Promise<void> {
  const session = await requireAdmin();
  await db.amazonScrapeCandidate.update({
    where: { id },
    data: { status: "rejected", reviewedBy: session.user.id, reviewedAt: new Date() },
  });
  await logAudit(session.user.id, "amazon.reject", id, {});
}

// ─── Approve & publish ───────────────────────────────────────────────────

/**
 * Publishes a queued candidate into the live catalog: re-fetches the latest
 * data (falling back to the stored snapshot if the API is unavailable),
 * upserts Brand → Product → primary image → Amazon Offer → PriceHistory, and
 * marks the candidate imported.
 */
export async function approveCandidate(input: ApproveCandidateInput): Promise<{ productId: string }> {
  const session = await requireAdmin();

  const candidate = await db.amazonScrapeCandidate.findUnique({ where: { id: input.id } });
  if (!candidate) throw new Error("Candidato no encontrado.");
  if (!input.categoryId) throw new Error("Selecciona una categoría antes de aprobar.");

  // Prefer fresh data; fall back to the stored snapshot if the API is gated.
  let normalized = candidate.normalized as unknown as NormalizedAmazonProduct;
  try {
    const fresh = (await getItems([candidate.asin])).items[0];
    if (fresh) normalized = mapAmazonItem(fresh);
  } catch {
    // keep the stored snapshot; the cron will refresh the price after import
  }

  const brandId = input.brandId ?? (await ensureBrand(input.brandName ?? normalized.brandName ?? "Genérico"));
  const merchantId = await ensureAmazonMerchant();
  const name = (input.name ?? normalized.name).trim();
  const slug = (normalized.specs.slug as string) || slugify(name);

  const productId = await db.$transaction(async (tx) => {
    // Find existing product by stable slug (HARD RULE #2), else create.
    const existing = await tx.product.findFirst({
      where: { specs: { path: ["slug"], equals: slug } },
      select: { id: true, specs: true },
    });

    const mergedSpecs = {
      ...(typeof existing?.specs === "object" && existing?.specs ? (existing.specs as object) : {}),
      ...normalized.specs,
      slug,
    };

    const productData = {
      name,
      brandId,
      categoryId: input.categoryId,
      description: (input.description ?? normalized.description) || name,
      specs: mergedSpecs as Prisma.InputJsonValue,
      attributes: normalized.attributes as Prisma.InputJsonValue,
      isActive: true,
    };

    const product = existing
      ? await tx.product.update({ where: { id: existing.id }, data: productData, select: { id: true } })
      : await tx.product.create({ data: productData, select: { id: true } });

    // Primary image (store URL as-is; rehosting is best-effort elsewhere).
    if (normalized.primaryImageUrl) {
      const { url, warning } = normalizeExternalImageUrl(normalized.primaryImageUrl);
      if (!warning) {
        const exists = await tx.productImage.findFirst({
          where: { productId: product.id, url },
          select: { id: true },
        });
        if (!exists) {
          const hasPrimary = await tx.productImage.count({
            where: { productId: product.id, isPrimary: true },
          });
          await tx.productImage.create({
            data: { productId: product.id, url, isPrimary: hasPrimary === 0, sortOrder: 0 },
          });
        }
      }
    }

    // Amazon offer (idempotent on merchant+asin). url is the vended link — unaltered.
    const offer = normalized.offer;
    const now = new Date();
    const offerData = {
      productId: product.id,
      merchantId,
      price: new Prisma.Decimal(offer.price ?? 0),
      oldPrice: offer.oldPrice != null ? new Prisma.Decimal(offer.oldPrice) : null,
      currentPrice: offer.price != null ? new Prisma.Decimal(offer.price) : null,
      currency: offer.currency,
      url: normalized.detailPageURL ?? "",
      stock: offer.inStock,
      isActive: true,
      sourceType: AMAZON_SOURCE,
      updateMode: "auto",
      externalId: candidate.asin,
      externalSource: "amazon",
      availabilityType: offer.availabilityType,
      isBuyBoxWinner: offer.isBuyBoxWinner,
      metadata: {
        dealBadge: offer.dealBadge,
        savingsPercent: offer.savingsPercent,
        offerType: offer.offerType,
        violatesMAP: offer.violatesMAP,
      } as Prisma.InputJsonValue,
      syncStatus: "ok",
      lastCheckedAt: now,
      lastUpdatedBy: session.user.id,
      nextCheckAt: new Date(now.getTime() + PRICE_RECHECK_MS),
    };

    const existingOffer = await tx.offer.findFirst({
      where: { merchantId, externalId: candidate.asin },
      select: { id: true },
    });
    const offerId = existingOffer
      ? (await tx.offer.update({ where: { id: existingOffer.id }, data: offerData, select: { id: true } })).id
      : (await tx.offer.create({ data: offerData, select: { id: true } })).id;

    if (offer.price != null) {
      await tx.priceHistory.create({
        data: {
          productId: product.id,
          offerId,
          merchantId,
          price: new Prisma.Decimal(offer.price),
          oldPrice: offer.oldPrice != null ? new Prisma.Decimal(offer.oldPrice) : null,
          sourceType: AMAZON_SOURCE,
          updateMode: "auto",
          changedBy: session.user.id,
          changeReason: "approval-import",
        },
      });
    }

    return product.id;
  });

  await db.amazonScrapeCandidate.update({
    where: { id: input.id },
    data: { status: "imported", productId, reviewedBy: session.user.id, reviewedAt: new Date() },
  });

  await logAudit(session.user.id, "amazon.approve", input.id, { asin: candidate.asin, productId });
  invalidateCatalog();
  return { productId };
}
