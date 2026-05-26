"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Truck, ShieldCheck, ExternalLink } from "lucide-react";
import type { Offer, Product } from "@/domain/catalog/types";
import { gaEvent } from "@/infrastructure/analytics/ga4";
import {
  buildOfferItem,
  OFFER_LIST_NAME,
  offerListId,
} from "@/infrastructure/analytics/items";
import { readOriginParams } from "@/infrastructure/analytics/last-interaction";
import { createRandomId } from "@/services/analyticsSession";

type OfferRowProduct = Pick<Product, "id" | "name" | "brand">;
type OfferRowOffer = Pick<
  Offer,
  "id" | "price" | "shippingCost" | "freeShipping"
> & {
  merchant: Pick<Offer["merchant"], "id" | "name" | "logo" | "trusted">;
};

interface Props {
  offer: OfferRowOffer;
  product: OfferRowProduct;
  index: number;
  isSafe: boolean;
}

export function OfferRow({ offer, product, index, isSafe }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);
  const eidRef = useRef<string | null>(null);
  const impressionFired = useRef(false);
  const [originParams, setOriginParams] = useState("");

  if (eidRef.current === null) eidRef.current = createRandomId();
  const eid = eidRef.current;
  const listId = offerListId(product.id);

  useEffect(() => {
    setOriginParams(readOriginParams());
  }, []);

  useEffect(() => {
    const el = rowRef.current;
    if (!el || impressionFired.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !impressionFired.current) {
            impressionFired.current = true;
            gaEvent("view_item", {
              currency: "EUR",
              value: offer.price,
              items: [
                buildOfferItem(product, offer, {
                  index,
                  listName: OFFER_LIST_NAME,
                  listId,
                }),
              ],
              merchant_id: offer.merchant.id,
              merchant_name: offer.merchant.name,
              offer_id: offer.id,
            });
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
    // Stable identity via IDs; offer/product field reads inside are read once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer.id, product.id, index, listId]);

  const handleClick = () => {
    gaEvent("select_item", {
      currency: "EUR",
      value: offer.price,
      transaction_id: eid,
      items: [
        buildOfferItem(product, offer, {
          index,
          listName: OFFER_LIST_NAME,
          listId,
        }),
      ],
      merchant_id: offer.merchant.id,
      merchant_name: offer.merchant.name,
      offer_id: offer.id,
    });
  };

  const total = offer.price + offer.shippingCost;

  return (
    <div
      ref={rowRef}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-secondary/80 border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
          {offer.merchant.logo ? (
            <Image
              src={offer.merchant.logo}
              alt={offer.merchant.name}
              width={28}
              height={28}
              sizes="28px"
              className="w-7 h-7 object-contain"
            />
          ) : (
            <span className="text-xs font-bold text-muted-foreground">
              {offer.merchant.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">{offer.merchant.name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <Truck className="w-3 h-3" />
              {offer.freeShipping
                ? "Envío gratis"
                : `+${offer.shippingCost.toFixed(2).replace(".", ",")} € envío`}
            </span>
            {offer.merchant.trusted ? (
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Tienda verificada
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:flex-shrink-0">
        <div className="text-right">
          <p className="font-bold text-foreground">
            {offer.price.toFixed(2).replace(".", ",")} €
          </p>
          <p className="text-xs text-muted-foreground">
            Total {total.toFixed(2).replace(".", ",")} €
          </p>
        </div>
        {isSafe ? (
          <Link
            href={`/api/redirect?offerId=${offer.id}&track=1&eid=${eid}${originParams}`}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleClick}
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
          >
            Ver oferta <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground italic">No disponible</span>
        )}
      </div>
    </div>
  );
}
