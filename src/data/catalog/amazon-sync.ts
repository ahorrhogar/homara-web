import "server-only";

import { Prisma } from "@prisma/client";
import { revalidateTag } from "next/cache";

import { CATALOG_CACHE_TAG } from "@/data/catalog/snapshot";
import { detectPriceSwing, mapAmazonItem } from "@/domain/catalog/amazon-mapping";
import { getItems } from "@/infrastructure/amazon/operations";
import { FULL_RESOURCES, PRICE_RESOURCES } from "@/infrastructure/amazon/resources";
import { db } from "@/lib/db";

/**
 * Background refresh of Amazon offers. Keeps volatile values (price, list
 * price, availability/stock, deal info) fresh within Amazon's 1-hour offer
 * cache TTL. New products are never created here — only already-imported
 * Amazon offers are updated; large price swings are flagged (still applied).
 */

const AMAZON_SOURCE = "amazon-creatorsapi";
const SYNC_STATUS_SOURCE = AMAZON_SOURCE;
const GET_ITEMS_BATCH = 10;
/** Re-check a little under the 1h offer-cache TTL. */
const PRICE_RECHECK_MS = 50 * 60 * 1000;
/** Back off a missing/errored ASIN before retrying. */
const ERROR_RECHECK_MS = 6 * 60 * 60 * 1000;

export interface AmazonSyncResult {
  processed: number;
  updated: number;
  flagged: number;
  missing: number;
  errors: number;
}

export interface AmazonSyncOptions {
  /** Max offers to process this invocation (bounds runtime per cron tick). */
  limit?: number;
  /** Pull full resources (images/specs) too, for the daily refresh. */
  full?: boolean;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function runAmazonSync(options: AmazonSyncOptions = {}): Promise<AmazonSyncResult> {
  const limit = options.limit ?? 100;
  const now = new Date();

  const dueOffers = await db.offer.findMany({
    where: {
      externalSource: "amazon",
      isActive: true,
      updateMode: "auto",
      externalId: { not: null },
      OR: [{ nextCheckAt: null }, { nextCheckAt: { lte: now } }],
    },
    orderBy: [{ nextCheckAt: { sort: "asc", nulls: "first" } }],
    take: limit,
    select: { id: true, externalId: true, productId: true, merchantId: true, price: true },
  });

  const result: AmazonSyncResult = { processed: 0, updated: 0, flagged: 0, missing: 0, errors: 0 };
  if (dueOffers.length === 0) {
    await writeSyncStatus("healthy", result, "Sin ofertas pendientes");
    return result;
  }

  const byAsin = new Map(dueOffers.map((o) => [o.externalId as string, o]));
  const resources = options.full ? FULL_RESOURCES : PRICE_RESOURCES;

  for (const batch of chunk([...byAsin.keys()], GET_ITEMS_BATCH)) {
    let items;
    try {
      ({ items } = await getItems(batch, resources));
    } catch (error) {
      // Whole batch failed (throttle/eligibility/network) — back off, keep going.
      result.errors += batch.length;
      await markErrors(batch, byAsin, errorMessage(error));
      continue;
    }

    const returned = new Set<string>();
    for (const item of items) {
      const offer = byAsin.get(item.asin);
      if (!offer) continue;
      returned.add(item.asin);
      result.processed += 1;
      try {
        const flagged = await applyOfferUpdate(offer, item);
        result.updated += 1;
        if (flagged) result.flagged += 1;
      } catch (error) {
        result.errors += 1;
        await markErrors([item.asin], byAsin, errorMessage(error));
      }
    }

    // ASINs requested but absent from the response → unavailable.
    const missing = batch.filter((asin) => !returned.has(asin));
    if (missing.length > 0) {
      result.missing += missing.length;
      await markMissing(missing, byAsin);
    }
  }

  revalidateTag(CATALOG_CACHE_TAG, "default");
  await writeSyncStatus(
    result.errors > 0 ? "degraded" : "healthy",
    result,
    `Actualizadas ${result.updated}, sin stock ${result.missing}, errores ${result.errors}`,
  );
  return result;
}

type DueOffer = {
  id: string;
  externalId: string | null;
  productId: string;
  merchantId: string;
  price: Prisma.Decimal;
};

async function applyOfferUpdate(
  offer: DueOffer,
  item: Parameters<typeof mapAmazonItem>[0],
): Promise<boolean> {
  const mapped = mapAmazonItem(item);
  const o = mapped.offer;
  const now = new Date();
  const oldPrice = Number(offer.price);
  const swing = detectPriceSwing(oldPrice, o.price);

  await db.$transaction(async (tx) => {
    await tx.offer.update({
      where: { id: offer.id },
      data: {
        price: o.price != null ? new Prisma.Decimal(o.price) : offer.price,
        oldPrice: o.oldPrice != null ? new Prisma.Decimal(o.oldPrice) : null,
        currentPrice: o.price != null ? new Prisma.Decimal(o.price) : null,
        currency: o.currency,
        stock: o.inStock,
        availabilityType: o.availabilityType,
        isBuyBoxWinner: o.isBuyBoxWinner,
        metadata: {
          dealBadge: o.dealBadge,
          savingsPercent: o.savingsPercent,
          offerType: o.offerType,
          violatesMAP: o.violatesMAP,
        } as Prisma.InputJsonValue,
        syncStatus: "ok",
        lastSyncError: null,
        lastCheckedAt: now,
        lastUpdatedBy: "cron:amazon-sync",
        nextCheckAt: new Date(now.getTime() + PRICE_RECHECK_MS),
        freshnessScore: new Prisma.Decimal(100),
      },
    });

    if (o.price != null && swing.changed) {
      await tx.priceHistory.create({
        data: {
          productId: offer.productId,
          offerId: offer.id,
          merchantId: offer.merchantId,
          price: new Prisma.Decimal(o.price),
          oldPrice: o.oldPrice != null ? new Prisma.Decimal(o.oldPrice) : null,
          sourceType: AMAZON_SOURCE,
          updateMode: "auto",
          changedBy: "cron:amazon-sync",
          changeReason: swing.flagged ? "cron-sync-large-swing" : "cron-sync",
        },
      });
    }
  });

  if (swing.flagged) {
    await flagSwing(offer, oldPrice, o.price, swing.fraction);
  }
  return swing.flagged;
}

async function flagSwing(
  offer: DueOffer,
  oldPrice: number,
  newPrice: number | null,
  fraction: number,
): Promise<void> {
  try {
    await db.adminAction.create({
      data: {
        userId: null,
        action: "amazon.price-swing",
        entityType: "offer",
        entityId: offer.id,
        payload: {
          asin: offer.externalId,
          oldPrice,
          newPrice,
          changePercent: Math.round(fraction * 100),
        } as Prisma.InputJsonValue,
      },
    });
  } catch {
    // never block sync on audit failures
  }
}

async function markMissing(asins: string[], byAsin: Map<string, DueOffer>): Promise<void> {
  const ids = asins.map((a) => byAsin.get(a)?.id).filter((id): id is string => Boolean(id));
  if (ids.length === 0) return;
  const next = new Date(Date.now() + PRICE_RECHECK_MS);
  await db.offer.updateMany({
    where: { id: { in: ids } },
    data: {
      stock: false,
      availabilityType: "OUT_OF_STOCK",
      syncStatus: "stale",
      lastSyncError: "No featured offer returned by Amazon",
      lastCheckedAt: new Date(),
      nextCheckAt: next,
    },
  });
}

async function markErrors(
  asins: string[],
  byAsin: Map<string, DueOffer>,
  message: string,
): Promise<void> {
  const ids = asins.map((a) => byAsin.get(a)?.id).filter((id): id is string => Boolean(id));
  if (ids.length === 0) return;
  await db.offer.updateMany({
    where: { id: { in: ids } },
    data: {
      syncStatus: "error",
      lastSyncError: message.slice(0, 500),
      nextCheckAt: new Date(Date.now() + ERROR_RECHECK_MS),
    },
  });
}

async function writeSyncStatus(
  status: string,
  result: AmazonSyncResult,
  message: string,
): Promise<void> {
  const now = new Date();
  const data = {
    status,
    message,
    metadata: result as unknown as Prisma.InputJsonValue,
    ...(status === "healthy" ? { lastSuccessAt: now } : { lastErrorAt: now }),
  };
  await db.syncStatus.upsert({
    where: { source: SYNC_STATUS_SOURCE },
    create: { source: SYNC_STATUS_SOURCE, ...data },
    update: data,
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
