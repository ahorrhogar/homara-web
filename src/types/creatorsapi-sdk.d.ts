/**
 * Minimal ambient typings for the vendored, JS-only official SDK
 * `@amzn/creatorsapi-nodejs-sdk` (see vendor/creatorsapi-nodejs-sdk). Only the
 * surface Homara uses is declared; responses are treated as the structurally
 * compatible types in src/infrastructure/amazon/types.ts at the call site.
 */
declare module "@amzn/creatorsapi-nodejs-sdk" {
  export class ApiClient {
    constructor(basePath?: string);
    credentialId: string;
    credentialSecret: string;
    version: string;
    tokenManager: { clearToken(): void } | null;
  }

  export class GetItemsRequestContent {
    partnerTag?: string;
    itemIds?: string[];
    itemIdType?: string;
    condition?: string;
    resources?: string[];
    languagesOfPreference?: string[];
    currencyOfPreference?: string;
  }

  export class SearchItemsRequestContent {
    partnerTag?: string;
    keywords?: string;
    brand?: string;
    title?: string;
    searchIndex?: string;
    browseNodeId?: string;
    minPrice?: number;
    maxPrice?: number;
    minReviewsRating?: number;
    minSavingPercent?: number;
    condition?: string;
    availability?: string;
    deliveryFlags?: string[];
    sortBy?: string;
    itemCount?: number;
    itemPage?: number;
    resources?: string[];
    languagesOfPreference?: string[];
    currencyOfPreference?: string;
  }

  export class GetVariationsRequestContent {
    partnerTag?: string;
    asin?: string;
    resources?: string[];
    languagesOfPreference?: string[];
    currencyOfPreference?: string;
  }

  export class GetBrowseNodesRequestContent {
    partnerTag?: string;
    browseNodeIds?: string[];
    resources?: string[];
  }

  export class DefaultApi {
    constructor(apiClient?: ApiClient);
    getItems(xMarketplace: string, getItemsRequestContent: GetItemsRequestContent): Promise<unknown>;
    searchItems(
      xMarketplace: string,
      opts: { searchItemsRequestContent: SearchItemsRequestContent },
    ): Promise<unknown>;
    getVariations(
      xMarketplace: string,
      getVariationsRequestContent: GetVariationsRequestContent,
    ): Promise<unknown>;
    getBrowseNodes(
      xMarketplace: string,
      getBrowseNodesRequestContent: GetBrowseNodesRequestContent,
    ): Promise<unknown>;
  }
}
