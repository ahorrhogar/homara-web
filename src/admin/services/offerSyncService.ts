"use server";

import { revalidateTag } from "next/cache";

import { CATALOG_CACHE_TAG } from "@/data/catalog/snapshot";
import type { OfferSyncBatchResult, OfferSyncResult } from "@/domain/catalog/offer-sync";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";

function safeReason(value: string | undefined, fallback: string): string {
  const text = String(value || "").trim();
  return text ? text.slice(0, 240) : fallback;
}

async function safeAdminAudit(
  action: string,
  entityId: string,
  payload: Record<string, unknown>,
  userId?: string,
): Promise<void> {
  try {
    await db.adminAction.create({
      data: {
        action,
        entityType: "offer",
        entityId,
        userId: userId ?? null,
        payload: { ...payload, source: "offerSyncService" },
      },
    });
  } catch {
    // Audit failures must never block operational flows.
  }
}

export async function mark_offer_stale(offerId: string, reason?: string): Promise<boolean> {
  const session = await requireAdmin();
  const cleanReason = safeReason(reason, "manual_mark_stale");

  const result = await db.offer.updateMany({
    where: { id: offerId },
    data: {
      syncStatus: "stale",
      freshnessScore: 0,
      lastSyncError: cleanReason,
      lastCheckedAt: new Date(),
    },
  });

  await safeAdminAudit("offer.sync.mark_stale", offerId, { reason: cleanReason }, session.user.id);
  if (result.count > 0) revalidateTag(CATALOG_CACHE_TAG, "default");
  return result.count > 0;
}

export async function mark_offer_fresh(offerId: string): Promise<boolean> {
  const session = await requireAdmin();

  const result = await db.offer.updateMany({
    where: { id: offerId },
    data: {
      syncStatus: "ok",
      freshnessScore: 100,
      lastSyncError: null,
      lastCheckedAt: new Date(),
    },
  });

  await safeAdminAudit("offer.sync.mark_fresh", offerId, {}, session.user.id);
  if (result.count > 0) revalidateTag(CATALOG_CACHE_TAG, "default");
  return result.count > 0;
}

export async function update_price_history_on_change(
  offerId: string,
  reason?: string,
  metadata?: Record<string, unknown>,
): Promise<boolean> {
  const session = await requireAdmin();
  const cleanReason = safeReason(reason, "manual_review");

  const offer = await db.offer.findUnique({
    where: { id: offerId },
    select: { id: true, productId: true, price: true },
  });
  if (!offer) return false;

  await db.priceHistory.create({
    data: {
      productId: offer.productId,
      price: offer.price,
    },
  });

  await db.offer.update({
    where: { id: offerId },
    data: { lastCheckedAt: new Date() },
  });

  await safeAdminAudit(
    "offer.sync.history_on_change",
    offerId,
    { reason: cleanReason, metadata: metadata ?? {} },
    session.user.id,
  );

  revalidateTag(CATALOG_CACHE_TAG, "default");
  return true;
}

export async function sync_price_for_offer(offerId: string): Promise<OfferSyncResult> {
  const session = await requireAdmin();

  const offer = await db.offer.findUnique({ where: { id: offerId }, select: { id: true } });
  const enqueued = Boolean(offer);

  if (enqueued) {
    await db.offer.update({
      where: { id: offerId },
      data: { nextCheckAt: new Date() },
    });
  }

  const result: OfferSyncResult = {
    offerId,
    checkedAt: new Date().toISOString(),
    status: enqueued ? "pending" : "error",
    changed: enqueued,
    reason: enqueued ? "sync_enqueued" : "offer_not_found",
  };

  await safeAdminAudit(
    "offer.sync.requested",
    offerId,
    { enqueueResult: result.changed },
    session.user.id,
  );

  return result;
}

export async function sync_offers_batch(limit = 50): Promise<OfferSyncBatchResult> {
  const session = await requireAdmin();
  const safeLimit = Math.max(1, Math.min(200, Math.floor(limit || 50)));

  const due = await db.offer.findMany({
    where: {
      isActive: true,
      OR: [{ nextCheckAt: null }, { nextCheckAt: { lte: new Date() } }],
    },
    orderBy: [{ priorityScore: "desc" }, { nextCheckAt: "asc" }],
    take: safeLimit,
    select: { id: true },
  });

  const syncedOfferIds = due.map((row) => row.id);

  const result: OfferSyncBatchResult = {
    syncedOfferIds,
    pendingOfferIds: syncedOfferIds,
    failedOfferIds: [],
  };

  await safeAdminAudit(
    "offer.sync.batch_requested",
    "batch",
    { requestedLimit: safeLimit, enqueued: syncedOfferIds.length },
    session.user.id,
  );

  return result;
}
