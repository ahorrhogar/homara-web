/**
 * Resource sets requested from the Creators API.
 *
 * The API only returns the resources you ask for, so we keep two lists:
 * - FULL_RESOURCES — everything Homara maps; used for search, preview,
 *   approval imports and the daily full refresh (1-day cache TTL fields).
 * - PRICE_RESOURCES — offers only; used by the hourly price cron to keep
 *   payloads small and stay within the 1-hour offer cache TTL.
 */

export const FULL_RESOURCES = [
  "images.primary.large",
  "images.primary.medium",
  "images.variants.large",
  "itemInfo.title",
  "itemInfo.byLineInfo",
  "itemInfo.features",
  "itemInfo.externalIds",
  "itemInfo.productInfo",
  "itemInfo.manufactureInfo",
  "itemInfo.technicalInfo",
  "itemInfo.classifications",
  "offersV2.listings.price",
  "offersV2.listings.availability",
  "offersV2.listings.condition",
  "offersV2.listings.dealDetails",
  "offersV2.listings.isBuyBoxWinner",
  "offersV2.listings.merchantInfo",
  "offersV2.listings.type",
  "parentASIN",
] as const;

export const PRICE_RESOURCES = [
  "offersV2.listings.price",
  "offersV2.listings.availability",
  "offersV2.listings.condition",
  "offersV2.listings.dealDetails",
  "offersV2.listings.isBuyBoxWinner",
  "offersV2.listings.type",
] as const;
