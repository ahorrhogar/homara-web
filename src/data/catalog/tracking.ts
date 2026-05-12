import "server-only";

import { createHash } from "node:crypto";
import { revalidateTag } from "next/cache";

import { RANKING_SIGNALS_CACHE_TAG } from "@/data/catalog/snapshot";
import type { OfferRedirectRow } from "@/data/catalog/_helpers";
import { normalizeSearchTerm } from "@/domain/catalog/search-normalize";
import { logger } from "@/infrastructure/logging/logger";
import { db } from "@/lib/db";
import { RATE_LIMITS } from "@/lib/redis";

export interface TrackClickOptions {
  offerId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface TrackSearchTermOptions {
  sessionId?: string;
  resultCount?: number;
  topProductId?: string;
  path?: string;
  ipAddress?: string;
  userAgent?: string;
}

const IP_HASH_SECRET = process.env.IP_HASH_SECRET || process.env.BETTER_AUTH_SECRET || "homara-ip";

function hashIp(ip?: string | null): string | null {
  if (!ip) return null;
  return createHash("sha256").update(`${IP_HASH_SECRET}:${ip}`).digest("hex").slice(0, 32);
}

function rateLimitKey(scope: string, ip?: string | null, fallback?: string): string {
  return `${scope}:${ip || fallback || "anon"}`;
}

export async function trackClick(
  productId: string,
  merchantId: string,
  options: TrackClickOptions = {},
): Promise<boolean> {
  if (!productId || !merchantId) return false;

  const ipHash = hashIp(options.ipAddress);
  const limit = await RATE_LIMITS.click(rateLimitKey("click", options.ipAddress, productId));
  if (!limit.success) {
    logger.log({
      level: "info",
      message: "Click tracking rate-limited",
      timestamp: new Date().toISOString(),
      context: { productId, merchantId, offerId: options.offerId ?? null },
    });
    return false;
  }

  try {
    await db.click.create({
      data: {
        productId,
        merchantId,
        offerId: options.offerId ?? null,
        ipHash,
        userAgent: options.userAgent ?? null,
      },
    });
  } catch (error) {
    logger.log({
      level: "warn",
      message: "Click write failed",
      timestamp: new Date().toISOString(),
      context: { productId, merchantId, offerId: options.offerId ?? null, error },
    });
    return false;
  }

  revalidateTag(RANKING_SIGNALS_CACHE_TAG, "default");
  return true;
}

export async function trackSearchTerm(
  term: string,
  options: TrackSearchTermOptions = {},
): Promise<void> {
  const cleanTerm = String(term || "").trim();
  if (cleanTerm.length < 2) return;

  const normalizedTerm = normalizeSearchTerm(cleanTerm);
  if (!normalizedTerm) return;

  const limit = await RATE_LIMITS.searchTerm(
    rateLimitKey("search", options.ipAddress, options.sessionId ?? "anon"),
  );
  if (!limit.success) return;

  try {
    await db.searchEvent.create({
      data: {
        sessionId: options.sessionId ?? "anon",
        term: cleanTerm,
        normalizedTerm,
        resultCount: Math.max(0, Math.floor(options.resultCount ?? 0)),
        topProductId: options.topProductId ?? null,
        path: options.path ?? null,
        ipHash: hashIp(options.ipAddress),
        userAgent: options.userAgent ?? null,
      },
    });
  } catch (error) {
    logger.log({
      level: "warn",
      message: "Search term write failed",
      timestamp: new Date().toISOString(),
      context: { term: normalizedTerm, error },
    });
    return;
  }

  if (options.topProductId) revalidateTag(RANKING_SIGNALS_CACHE_TAG, "default");
}

export async function getOfferRedirectPayload(
  offerId: string,
): Promise<OfferRedirectRow | null> {
  if (!offerId) return null;

  try {
    const offer = await db.offer.findUnique({
      where: { id: offerId },
      select: {
        id: true,
        productId: true,
        merchantId: true,
        url: true,
        merchant: { select: { name: true } },
      },
    });
    if (!offer) return null;

    const domain = (() => {
      try {
        return new URL(offer.url).hostname;
      } catch {
        return null;
      }
    })();

    return {
      id: offer.id,
      product_id: offer.productId,
      merchant_id: offer.merchantId,
      url: offer.url,
      merchant_domain: domain,
    };
  } catch (error) {
    logger.log({
      level: "warn",
      message: "Offer redirect lookup failed",
      timestamp: new Date().toISOString(),
      context: { offerId, error },
    });
    return null;
  }
}
