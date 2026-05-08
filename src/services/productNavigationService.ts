import type { Product } from "@/domain/catalog/types";
import { analyticsService } from "@/services/analyticsService";

export interface ProductNavigationTarget {
  href: string;
  isDirectAffiliateOffer: boolean;
  offerId?: string;
  merchantId?: string;
}

function getInternalProductHref(product: Product): string {
  return `/producto/${product.slug}`;
}

/**
 * Builds the navigation target for a product card click. After the Next.js migration,
 * cards always link to the internal product page (`/producto/<slug>`), where the
 * comparator UI lives. The merchant redirect (`/api/redirect?offerId=…&track=1`) is
 * triggered from "Ir a la tienda" buttons on the product page itself.
 */
export function getProductNavigationTarget(product: Product): ProductNavigationTarget {
  return {
    href: getInternalProductHref(product),
    isDirectAffiliateOffer: false,
  };
}

export function trackDirectOfferNavigation(
  product: Product,
  target: ProductNavigationTarget,
): void {
  if (!target.isDirectAffiliateOffer || !target.offerId || !target.merchantId) {
    return;
  }

  analyticsService.track({
    name: "offer_click",
    timestamp: new Date().toISOString(),
    payload: {
      productId: product.id,
      offerId: target.offerId,
      merchantId: target.merchantId,
    },
  });
}
