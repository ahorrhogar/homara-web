import "server-only";

import { getCatalogSnapshot } from "@/data/catalog/snapshot";
import type { Merchant, Offer, PriceAnalysis, PriceHistory } from "@/domain/catalog/types";
import { buildPriceAnalysis } from "@/domain/catalog/product-logic";

export async function getOffersForProduct(productId: string): Promise<Offer[]> {
  if (!productId) return [];
  const { offersByProductId } = await getCatalogSnapshot();
  return offersByProductId[productId] || [];
}

export async function getMerchants(): Promise<Merchant[]> {
  return (await getCatalogSnapshot()).merchants;
}

export async function getPriceHistory(productId: string): Promise<PriceHistory[]> {
  if (!productId) return [];
  const { priceHistoryByProductId } = await getCatalogSnapshot();
  return priceHistoryByProductId[productId] || [];
}

export async function getPriceAnalysis(productId: string): Promise<PriceAnalysis> {
  const history = await getPriceHistory(productId);
  return buildPriceAnalysis(history);
}

// Re-exports — these are the affiliate redirect + click tracking primitives that
// app/api/redirect/route.ts uses. Server actions invalidate via revalidateTag('offers').
export { getOfferRedirectPayload, trackClick, trackSearchTerm } from "@/data/sources/supabaseCatalogSource";
