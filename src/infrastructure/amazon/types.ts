/**
 * Type definitions for the Amazon Creators API (the REST successor to
 * PA-API 5.0). Transcribed from the official docs:
 * https://afiliados.amazon.es/creatorsapi/docs/en-us/introduction
 *
 * Only the fields Homara consumes are modelled. Everything is optional /
 * nullable because the API only returns the resources you request and may
 * omit any field for a given item.
 */

// ── Common ────────────────────────────────────────────────────────────

export interface AmazonMoney {
  amount?: number | null;
  currency?: string | null;
  displayAmount?: string | null;
}

/** A locale-tagged single value, e.g. title / brand / color. */
export interface AmazonDisplayValue<T = string> {
  displayValue?: T | null;
  label?: string | null;
  locale?: string | null;
}

/** A locale-tagged list of values, e.g. features / EANs. */
export interface AmazonDisplayValues<T = string> {
  displayValues?: T[] | null;
  label?: string | null;
  locale?: string | null;
}

// ── Images ────────────────────────────────────────────────────────────

export interface AmazonImage {
  url?: string | null;
  height?: number | null;
  width?: number | null;
}

export interface AmazonImageSet {
  small?: AmazonImage | null;
  medium?: AmazonImage | null;
  large?: AmazonImage | null;
  hiRes?: AmazonImage | null;
}

export interface AmazonImages {
  primary?: AmazonImageSet | null;
  variants?: AmazonImageSet[] | null;
}

// ── ItemInfo ──────────────────────────────────────────────────────────

export interface AmazonByLineInfo {
  brand?: AmazonDisplayValue | null;
  manufacturer?: AmazonDisplayValue | null;
}

export interface AmazonExternalIds {
  eans?: AmazonDisplayValues | null;
  isbns?: AmazonDisplayValues | null;
  upcs?: AmazonDisplayValues | null;
}

export interface AmazonDimension {
  displayValue?: number | null;
  label?: string | null;
  locale?: string | null;
  unit?: string | null;
}

export interface AmazonItemDimensions {
  height?: AmazonDimension | null;
  length?: AmazonDimension | null;
  weight?: AmazonDimension | null;
  width?: AmazonDimension | null;
}

export interface AmazonProductInfo {
  color?: AmazonDisplayValue | null;
  isAdultProduct?: AmazonDisplayValue<boolean> | null;
  itemDimensions?: AmazonItemDimensions | null;
  releaseDate?: AmazonDisplayValue | null;
  size?: AmazonDisplayValue | null;
  unitCount?: AmazonDisplayValue<number> | null;
}

export interface AmazonManufactureInfo {
  itemPartNumber?: AmazonDisplayValue | null;
  model?: AmazonDisplayValue | null;
  warranty?: AmazonDisplayValue | null;
}

export interface AmazonTechnicalInfo {
  energyEfficiencyClass?: AmazonDisplayValue | null;
  formats?: AmazonDisplayValues | null;
}

export interface AmazonClassifications {
  binding?: AmazonDisplayValue | null;
  productGroup?: AmazonDisplayValue | null;
}

export interface AmazonItemInfo {
  byLineInfo?: AmazonByLineInfo | null;
  classifications?: AmazonClassifications | null;
  externalIds?: AmazonExternalIds | null;
  features?: AmazonDisplayValues | null;
  manufactureInfo?: AmazonManufactureInfo | null;
  productInfo?: AmazonProductInfo | null;
  technicalInfo?: AmazonTechnicalInfo | null;
  title?: AmazonDisplayValue | null;
}

// ── OffersV2 ──────────────────────────────────────────────────────────

export type AmazonAvailabilityType =
  | "AVAILABLE_DATE"
  | "IN_STOCK"
  | "IN_STOCK_SCARCE"
  | "LEADTIME"
  | "OUT_OF_STOCK"
  | "PREORDER"
  | "UNAVAILABLE"
  | "UNKNOWN";

export interface AmazonOfferAvailability {
  maxOrderQuantity?: number | null;
  minOrderQuantity?: number | null;
  message?: string | null;
  type?: AmazonAvailabilityType | null;
}

export interface AmazonOfferCondition {
  conditionNote?: string | null;
  subCondition?: string | null;
  value?: string | null;
}

export interface AmazonDealDetails {
  accessType?: string | null;
  badge?: string | null;
  earlyAccessDurationInMilliseconds?: number | null;
  endTime?: string | null;
  percentClaimed?: number | string | null;
  startTime?: string | null;
}

export interface AmazonSavingBasis {
  money?: AmazonMoney | null;
  savingBasisType?: string | null;
  savingBasisTypeLabel?: string | null;
}

export interface AmazonSavings {
  money?: AmazonMoney | null;
  percentage?: number | null;
}

export interface AmazonOfferPrice {
  money?: AmazonMoney | null;
  pricePerUnit?: AmazonMoney | null;
  savingBasis?: AmazonSavingBasis | null;
  savings?: AmazonSavings | null;
}

export interface AmazonMerchantInfo {
  id?: string | null;
  name?: string | null;
}

export interface AmazonOfferListing {
  availability?: AmazonOfferAvailability | null;
  condition?: AmazonOfferCondition | null;
  dealDetails?: AmazonDealDetails | null;
  isBuyBoxWinner?: boolean | null;
  merchantInfo?: AmazonMerchantInfo | null;
  price?: AmazonOfferPrice | null;
  type?: string | null;
  violatesMAP?: boolean | null;
}

export interface AmazonOffersV2 {
  listings?: AmazonOfferListing[] | null;
}

// ── Item / responses ──────────────────────────────────────────────────

export interface AmazonItem {
  asin: string;
  detailPageURL?: string | null;
  images?: AmazonImages | null;
  itemInfo?: AmazonItemInfo | null;
  offersV2?: AmazonOffersV2 | null;
  parentASIN?: string | null;
  score?: number | null;
}

export interface AmazonApiError {
  code?: string | null;
  message?: string | null;
}

export interface GetItemsResponse {
  itemsResult?: { items?: AmazonItem[] | null } | null;
  errors?: AmazonApiError[] | null;
}

export interface GetVariationsResponse {
  variationsResult?: { items?: AmazonItem[] | null } | null;
  errors?: AmazonApiError[] | null;
}

export interface SearchItemsResponse {
  searchResult?: {
    items?: AmazonItem[] | null;
    totalResultCount?: number | null;
    searchURL?: string | null;
  } | null;
  errors?: AmazonApiError[] | null;
}

// ── Request params ────────────────────────────────────────────────────

export type AmazonSortBy =
  | "Relevance"
  | "Price:LowToHigh"
  | "Price:HighToLow"
  | "AvgCustomerReviews"
  | "Featured"
  | "NewestArrivals";

export interface SearchItemsParams {
  keywords?: string;
  brand?: string;
  title?: string;
  searchIndex?: string;
  browseNodeId?: string;
  /** In the lowest currency denomination (cents for EUR). */
  minPrice?: number;
  /** In the lowest currency denomination (cents for EUR). */
  maxPrice?: number;
  minReviewsRating?: number;
  minSavingPercent?: number;
  condition?: "Any" | "New";
  availability?: "Available" | "IncludeOutOfStock";
  deliveryFlags?: Array<"Prime" | "FreeShipping" | "FulfilledByAmazon" | "AmazonGlobal">;
  sortBy?: AmazonSortBy;
  /** 1–10 */
  itemCount?: number;
  /** 1–10 */
  itemPage?: number;
  resources?: string[];
}
