"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { Offer, Product } from "@/domain/catalog/types";
import { gaEvent } from "@/infrastructure/analytics/ga4";
import {
  buildOfferItem,
  OFFER_LIST_NAME,
  offerListId,
} from "@/infrastructure/analytics/items";

type ComparatorProduct = Pick<Product, "id" | "name" | "brand">;
type ComparatorOffer = Pick<Offer, "id" | "price" | "shippingCost"> & {
  merchant: Pick<Offer["merchant"], "name">;
};

interface Props {
  product: ComparatorProduct;
  offers: ComparatorOffer[];
  children: ReactNode;
}

export function OfferComparator({ product, offers, children }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || offers.length < 2) return;
    fired.current = true;

    const prices = offers.map((o) => o.price);
    const cheapest = Math.min(...prices);
    const dearest = Math.max(...prices);
    const listId = offerListId(product.id);

    gaEvent("view_item_list", {
      item_list_name: OFFER_LIST_NAME,
      item_list_id: listId,
      currency: "EUR",
      items: offers.map((o, i) =>
        buildOfferItem(product, o, { index: i, listName: OFFER_LIST_NAME, listId }),
      ),
      offer_count: offers.length,
      cheapest_price: cheapest,
      price_spread: Number((dearest - cheapest).toFixed(2)),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, offers.length]);

  return <>{children}</>;
}
