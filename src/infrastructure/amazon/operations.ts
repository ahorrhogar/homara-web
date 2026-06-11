import "server-only";

import { callCreatorsApi } from "./client";
import { FULL_RESOURCES } from "./resources";
import type {
  AmazonItem,
  GetItemsResponse,
  SearchItemsParams,
  SearchItemsResponse,
} from "./types";

/**
 * Typed wrappers over the four Creators API operations. Each returns the
 * normalized items array (and, for search, the total count) so callers don't
 * touch the envelope shape.
 */

const GET_ITEMS_PATH = "/catalog/v1/getItems";
const SEARCH_ITEMS_PATH = "/catalog/v1/searchItems";
const GET_VARIATIONS_PATH = "/catalog/v1/getVariations";

const MAX_ITEM_IDS = 10;

/** Look up up to 10 ASINs in one call. */
export async function getItems(
  asins: string[],
  resources: readonly string[] = FULL_RESOURCES,
): Promise<{ items: AmazonItem[]; errors: GetItemsResponse["errors"] }> {
  const itemIds = asins.filter(Boolean).slice(0, MAX_ITEM_IDS);
  if (itemIds.length === 0) return { items: [], errors: [] };

  const res = await callCreatorsApi<GetItemsResponse>(GET_ITEMS_PATH, {
    itemIds,
    itemIdType: "ASIN",
    resources,
  });
  return { items: res.itemsResult?.items ?? [], errors: res.errors ?? [] };
}

/** Search the catalog. Returns ≤10 items per page (itemPage 1–10). */
export async function searchItems(
  params: SearchItemsParams,
): Promise<{ items: AmazonItem[]; totalResultCount: number; searchURL: string | null }> {
  const { resources = FULL_RESOURCES, ...rest } = params;
  const body: Record<string, unknown> = { resources, ...stripUndefined(rest) };

  const res = await callCreatorsApi<SearchItemsResponse>(SEARCH_ITEMS_PATH, body);
  return {
    items: res.searchResult?.items ?? [],
    totalResultCount: res.searchResult?.totalResultCount ?? 0,
    searchURL: res.searchResult?.searchURL ?? null,
  };
}

/** Get the variations (e.g. colours/sizes) of a parent ASIN. */
export async function getVariations(
  asin: string,
  resources: readonly string[] = FULL_RESOURCES,
): Promise<{ items: AmazonItem[] }> {
  const res = await callCreatorsApi<GetItemsResponse>(GET_VARIATIONS_PATH, {
    asin,
    resources,
  });
  return { items: res.itemsResult?.items ?? [] };
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== "") {
      out[key as keyof T] = value as T[keyof T];
    }
  }
  return out;
}
