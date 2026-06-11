import "server-only";

import {
  GetItemsRequestContent,
  GetVariationsRequestContent,
  SearchItemsRequestContent,
} from "@amzn/creatorsapi-nodejs-sdk";

import { callSdk, MARKETPLACE, PARTNER_TAG } from "./client";
import { FULL_RESOURCES } from "./resources";
import type {
  AmazonApiError,
  AmazonItem,
  GetItemsResponse,
  GetVariationsResponse,
  SearchItemsParams,
  SearchItemsResponse,
} from "./types";

/**
 * Typed wrappers over the Creators API operations, delegating transport to the
 * official SDK via callSdk(). Each returns the normalized items array (and, for
 * search, the total count) so callers don't touch the SDK's response models.
 */

const MAX_ITEM_IDS = 10;

/** Look up up to 10 ASINs in one call. */
export async function getItems(
  asins: string[],
  resources: readonly string[] = FULL_RESOURCES,
): Promise<{ items: AmazonItem[]; errors: AmazonApiError[] }> {
  const itemIds = asins.filter(Boolean).slice(0, MAX_ITEM_IDS);
  if (itemIds.length === 0) return { items: [], errors: [] };

  const req = new GetItemsRequestContent();
  req.partnerTag = PARTNER_TAG;
  req.itemIds = itemIds;
  req.itemIdType = "ASIN";
  req.resources = [...resources];

  const res = await callSdk<GetItemsResponse>((api) => api.getItems(MARKETPLACE, req));
  return { items: res.itemsResult?.items ?? [], errors: res.errors ?? [] };
}

/** Search the catalog. Returns ≤10 items per page (itemPage 1–10). */
export async function searchItems(
  params: SearchItemsParams,
): Promise<{ items: AmazonItem[]; totalResultCount: number; searchURL: string | null }> {
  const { resources = FULL_RESOURCES, ...rest } = params;
  const req = new SearchItemsRequestContent();
  req.partnerTag = PARTNER_TAG;
  req.resources = [...resources];
  Object.assign(req, stripEmpty(rest));

  const res = await callSdk<SearchItemsResponse>((api) =>
    api.searchItems(MARKETPLACE, { searchItemsRequestContent: req }),
  );
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
  const req = new GetVariationsRequestContent();
  req.partnerTag = PARTNER_TAG;
  req.asin = asin;
  req.resources = [...resources];

  const res = await callSdk<GetVariationsResponse>((api) =>
    api.getVariations(MARKETPLACE, req),
  );
  return { items: res.variationsResult?.items ?? [] };
}

function stripEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== "") {
      out[key as keyof T] = value as T[keyof T];
    }
  }
  return out;
}
