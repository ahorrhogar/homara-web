import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidateTag } from "next/cache";
import { getAnonymousSupabaseClient } from "@/integrations/supabase/anonymous";
import { logger } from "@/infrastructure/logging/logger";
import { RANKING_SIGNALS_CACHE_TAG } from "@/data/catalog/snapshot";
import type { OfferRedirectRow } from "@/data/catalog/_helpers";

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

interface TrackClickRpcResponse {
  accepted?: boolean;
  reason?: string;
}

interface TrackSearchRpcResponse {
  accepted?: boolean;
  reason?: string;
}

export async function trackClick(
  productId: string,
  merchantId: string,
  client?: SupabaseClient,
  options?: TrackClickOptions,
): Promise<void> {
  const supabase = client || getAnonymousSupabaseClient();
  const { data, error } = await supabase.rpc("track_click_secure", {
    p_product_id: productId,
    p_merchant_id: merchantId,
    p_offer_id: options?.offerId || null,
    p_ip_override: options?.ipAddress || null,
    p_user_agent_override: options?.userAgent || null,
  });

  if (error) {
    logger.log({
      level: "warn",
      message: "Click tracking RPC failed",
      timestamp: new Date().toISOString(),
      context: { productId, merchantId, offerId: options?.offerId || null, error },
    });
    return;
  }

  const payload = data && typeof data === "object" ? (data as TrackClickRpcResponse) : null;
  if (!payload?.accepted) {
    logger.log({
      level: "info",
      message: "Click tracking blocked by anti-abuse controls",
      timestamp: new Date().toISOString(),
      context: {
        productId,
        merchantId,
        offerId: options?.offerId || null,
        reason: payload?.reason || "unknown",
      },
    });
    return;
  }

  // Click landed; ranking signals will be re-fetched on next read.
  revalidateTag(RANKING_SIGNALS_CACHE_TAG);
}

export async function trackSearchTerm(
  term: string,
  options?: TrackSearchTermOptions,
  client?: SupabaseClient,
): Promise<void> {
  const normalizedTerm = String(term || "").trim();
  if (normalizedTerm.length < 2) return;

  const supabase = client || getAnonymousSupabaseClient();
  const { data, error } = await supabase.rpc("track_search_term_secure", {
    p_term: normalizedTerm,
    p_session_id: options?.sessionId || null,
    p_result_count: Math.max(0, Math.floor(options?.resultCount || 0)),
    p_top_product_id: options?.topProductId || null,
    p_path: options?.path || null,
    p_ip_override: options?.ipAddress || null,
    p_user_agent_override: options?.userAgent || null,
  });

  if (error) {
    logger.log({
      level: "warn",
      message: "Search tracking RPC failed",
      timestamp: new Date().toISOString(),
      context: { term: normalizedTerm, error },
    });
    return;
  }

  const payload = data && typeof data === "object" ? (data as TrackSearchRpcResponse) : null;
  if (!payload?.accepted) return;

  if (options?.topProductId) {
    revalidateTag(RANKING_SIGNALS_CACHE_TAG);
  }
}

export async function getOfferRedirectPayload(
  offerId: string,
  client?: SupabaseClient,
): Promise<OfferRedirectRow | null> {
  const supabase = client || getAnonymousSupabaseClient();
  const { data, error } = await supabase
    .from("offers")
    .select("id,product_id,merchant_id,url,merchants(domain)")
    .eq("id", offerId)
    .maybeSingle();

  if (error) {
    logger.log({
      level: "warn",
      message: "Offer redirect lookup failed",
      timestamp: new Date().toISOString(),
      context: { offerId, error },
    });
    return null;
  }

  if (!data) return null;

  const merchantData =
    data.merchants && typeof data.merchants === "object" && !Array.isArray(data.merchants)
      ? (data.merchants as { domain?: unknown })
      : null;

  return {
    id: String(data.id),
    product_id: String(data.product_id),
    merchant_id: String(data.merchant_id),
    url: String(data.url || ""),
    merchant_domain: merchantData?.domain ? String(merchantData.domain) : null,
  };
}
