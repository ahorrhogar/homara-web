export const OFFER_LIST_NAME = "product_offers";

export function offerListId(productId: string): string {
  return `offers_${productId}`;
}

export interface Ga4Item {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_list_name?: string;
  item_list_id?: string;
  index?: number;
  price?: number;
  currency: "EUR";
}

interface ProductLike {
  id: string;
  name: string;
  brand: string;
  minPrice?: number;
}

interface OfferLike {
  price: number;
  merchant: { name: string };
}

interface ListContext {
  listName?: string;
  listId?: string;
  index?: number;
  categoryName?: string;
}

export function buildProductItem(product: ProductLike, ctx: ListContext = {}): Ga4Item {
  return {
    item_id: product.id,
    item_name: product.name,
    item_brand: product.brand,
    item_category: ctx.categoryName,
    item_list_name: ctx.listName,
    item_list_id: ctx.listId,
    index: ctx.index,
    price: product.minPrice,
    currency: "EUR",
  };
}

export function buildOfferItem(
  product: ProductLike,
  offer: OfferLike,
  ctx: ListContext = {},
): Ga4Item {
  return {
    item_id: product.id,
    item_name: product.name,
    item_brand: product.brand,
    item_category: ctx.categoryName,
    item_list_name: ctx.listName,
    item_list_id: ctx.listId,
    index: ctx.index,
    price: offer.price,
    currency: "EUR",
  };
}
