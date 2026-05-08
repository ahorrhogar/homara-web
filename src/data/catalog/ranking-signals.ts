import "server-only";

import { unstable_cache } from "next/cache";
import { getAnonymousSupabaseClient } from "@/integrations/supabase/anonymous";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/infrastructure/logging/logger";
import { toNumber } from "@/data/catalog/_helpers";
import { RANKING_SIGNALS_CACHE_TAG } from "@/data/catalog/snapshot";

export interface CatalogRankingSignals {
  clicksByProductId: Record<string, number>;
  outboundClicksByProductId: Record<string, number>;
  viewsByProductId: Record<string, number>;
  favoritesByProductId: Record<string, number>;
  hasViewSignals: boolean;
  hasFavoriteSignals: boolean;
  updatedAt: string;
}

interface ProductSignalRow {
  product_id: string;
}

interface AggregateClickRow {
  product_id: string;
  clicks: number | string;
}

interface AggregateFavoriteRow {
  product_id: string;
  favorites: number | string;
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

function isMissingRelationError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  const code = String(error.code || "").toUpperCase();
  if (code === "42P01" || code === "PGRST202" || code === "PGRST204" || code === "PGRST205") return true;
  const message = String(error.message || "").toLowerCase();
  return message.includes("does not exist") || message.includes("could not find") || message.includes("relation");
}

function countByProductId(rows: ProductSignalRow[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const productId = String(row.product_id || "");
    if (!productId) continue;
    counts[productId] = (counts[productId] || 0) + 1;
  }
  return counts;
}

function countFromAggregateRows(rows: Array<AggregateClickRow | AggregateFavoriteRow>): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const productId = String(row.product_id || "");
    if (!productId) continue;
    const value =
      "clicks" in row ? toNumber(row.clicks, 0) : "favorites" in row ? toNumber(row.favorites, 0) : 0;
    if (value <= 0) continue;
    counts[productId] = value;
  }
  return counts;
}

async function queryOptionalSignalRows(
  tables: string[],
  client: SupabaseClient,
): Promise<{ counts: Record<string, number>; found: boolean }> {
  for (const table of tables) {
    const result = await client.from(table).select("product_id").limit(10000);
    if (!result.error) {
      return { counts: countByProductId((result.data || []) as ProductSignalRow[]), found: true };
    }
    if (isMissingRelationError(result.error)) continue;

    logger.log({
      level: "warn",
      message: "Optional signal source query failed",
      timestamp: new Date().toISOString(),
      context: { table, error: result.error },
    });
  }

  return { counts: {}, found: false };
}

async function loadRankingSignals(): Promise<CatalogRankingSignals> {
  const client = getAnonymousSupabaseClient();

  const [productViewsResult, favoriteResult, explicitViewsResult] = await Promise.all([
    client.from("products").select("id,search_count"),
    queryOptionalSignalRows(["product_favorites", "favorites", "user_favorites", "wishlists"], client),
    queryOptionalSignalRows(["product_views", "views", "product_impressions"], client),
  ]);

  let clicksByProductId: Record<string, number> = {};
  const clickSignalResult = await client.rpc("get_home_click_signals", { p_days: 120, p_limit: 10000 });

  if (!clickSignalResult.error) {
    clicksByProductId = countFromAggregateRows((clickSignalResult.data || []) as AggregateClickRow[]);
  } else {
    const fallbackClicksResult = await client
      .from("clicks")
      .select("product_id")
      .order("created_at", { ascending: false })
      .limit(10000);

    if (!fallbackClicksResult.error) {
      clicksByProductId = countByProductId((fallbackClicksResult.data || []) as ProductSignalRow[]);
    } else {
      logger.log({
        level: "warn",
        message: "Clicks signals unavailable for home ranking",
        timestamp: new Date().toISOString(),
        context: { rpcError: clickSignalResult.error, fallbackError: fallbackClicksResult.error },
      });
    }
  }

  const outboundClicksByProductId = { ...clicksByProductId };

  let viewsByProductId: Record<string, number> = {};
  let hasViewSignals = explicitViewsResult.found;

  if (explicitViewsResult.found) {
    viewsByProductId = explicitViewsResult.counts;
  } else {
    if (productViewsResult.error && !isMissingRelationError(productViewsResult.error)) {
      logger.log({
        level: "warn",
        message: "Products search_count query for view signals failed",
        timestamp: new Date().toISOString(),
        context: { error: productViewsResult.error },
      });
    }

    const fallbackViews: Record<string, number> = {};
    for (const row of productViewsResult.data || []) {
      const productId = String(row.id || "");
      const count = toNumber((row as { search_count?: number | string | null }).search_count, 0);
      if (!productId || count <= 0) continue;
      fallbackViews[productId] = count;
    }

    viewsByProductId = fallbackViews;
    hasViewSignals = Object.keys(fallbackViews).length > 0;
  }

  let favoritesByProductId = favoriteResult.counts;
  let hasFavoriteSignals = favoriteResult.found;

  const favoriteSignalResult = await client.rpc("get_home_favorite_signals", { p_days: 365, p_limit: 10000 });

  if (!favoriteSignalResult.error) {
    favoritesByProductId = countFromAggregateRows((favoriteSignalResult.data || []) as AggregateFavoriteRow[]);
    hasFavoriteSignals = true;
  } else if (!isMissingRelationError(favoriteSignalResult.error)) {
    logger.log({
      level: "warn",
      message: "Favorite signal RPC query failed",
      timestamp: new Date().toISOString(),
      context: { error: favoriteSignalResult.error },
    });
  }

  return {
    clicksByProductId,
    outboundClicksByProductId,
    viewsByProductId,
    favoritesByProductId,
    hasViewSignals,
    hasFavoriteSignals,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Tagged + cached read of catalog ranking signals (clicks, views, favorites). Refreshes
 * every 120s; click-tracking RPCs invalidate via `revalidateTag(RANKING_SIGNALS_CACHE_TAG)`.
 * If Supabase reads fail entirely, returns an empty signals payload so home ranking still
 * renders.
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
  ["catalog:ranking-signals:v1"],
  { tags: [RANKING_SIGNALS_CACHE_TAG], revalidate: 120 },
);
