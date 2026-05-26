import "server-only";

import { unstable_cache } from "next/cache";

import { RANKING_SIGNALS_CACHE_TAG } from "@/data/catalog/snapshot";
import { logger } from "@/infrastructure/logging/logger";
import { db } from "@/lib/db";

export interface CatalogRankingSignals {
  clicksByProductId: Record<string, number>;
  outboundClicksByProductId: Record<string, number>;
  viewsByProductId: Record<string, number>;
  favoritesByProductId: Record<string, number>;
  hasViewSignals: boolean;
  hasFavoriteSignals: boolean;
  updatedAt: string;
}

const EMPTY_SIGNALS: CatalogRankingSignals = {
  clicksByProductId: {},
  outboundClicksByProductId: {},
  viewsByProductId: {},
  favoritesByProductId: {},
  hasViewSignals: false,
  hasFavoriteSignals: false,
  updatedAt: new Date(0).toISOString(),
};

const SIGNAL_WINDOW_DAYS = 120;

async function loadRankingSignals(): Promise<CatalogRankingSignals> {
  const since = new Date(Date.now() - SIGNAL_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const rows = await db.click.groupBy({
    by: ["productId"],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
  });

  const clicksByProductId: Record<string, number> = {};
  for (const row of rows) {
    if (row._count._all > 0) {
      clicksByProductId[row.productId] = row._count._all;
    }
  }

  return {
    clicksByProductId,
    outboundClicksByProductId: { ...clicksByProductId },
    viewsByProductId: {},
    favoritesByProductId: {},
    hasViewSignals: false,
    hasFavoriteSignals: false,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Tagged + cached read of ranking signals (clicks per product, last 120 days).
 * `trackClick` calls `revalidateTag(RANKING_SIGNALS_CACHE_TAG)` after each accepted
 * click. Returns empty signals on failure so home ranking still renders.
 */
export const getRankingSignals = unstable_cache(
  async (): Promise<CatalogRankingSignals> => {
    try {
      return await loadRankingSignals();
    } catch (error) {
      logger.log({
        level: "warn",
        message: "Ranking signals fetch failed; returning empty signals",
        timestamp: new Date().toISOString(),
        context: { error },
      });
      return EMPTY_SIGNALS;
    }
  },
  ["catalog:ranking-signals:v2"],
  { tags: [RANKING_SIGNALS_CACHE_TAG], revalidate: 120 },
);
