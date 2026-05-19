import { after } from "next/server";
import { getOfferRedirectPayload, trackClick } from "@/data/catalog/tracking";
import { isAffiliateUrlAllowed } from "@/infrastructure/security/affiliateUrl";
import { mpEvent } from "@/infrastructure/analytics/measurement-protocol";
import { isOriginSource } from "@/infrastructure/analytics/last-interaction";
import { logger } from "@/infrastructure/logging/logger";
import { getClientIp } from "@/lib/getClientIp";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseGaClientId(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/_ga=GA\d+\.\d+\.([0-9.]+)/);
  return match?.[1] ?? null;
}

export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const offerId = requestUrl.searchParams.get("offerId") || "";
  const shouldTrack = requestUrl.searchParams.get("track") === "1";

  if (!uuidPattern.test(offerId)) {
    return Response.json({ error: "Invalid offerId" }, { status: 400 });
  }

  try {
    const offer = await getOfferRedirectPayload(offerId);

    if (!offer) {
      return Response.json({ error: "Offer not found" }, { status: 404 });
    }

    if (!isAffiliateUrlAllowed(offer.url, offer.merchant_domain || undefined)) {
      logger.log({
        level: "warn",
        message: "Redirect blocked due to unsafe affiliate URL",
        timestamp: new Date().toISOString(),
        context: {
          offerId,
          merchantId: offer.merchant_id,
          merchantDomain: offer.merchant_domain || null,
        },
      });
      return Response.json({ error: "Unsafe redirect URL" }, { status: 400 });
    }

    if (shouldTrack) {
      await trackClick(offer.product_id, offer.merchant_id, {
        offerId: offer.id,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
      });

      const eid = requestUrl.searchParams.get("eid");
      const gaClientId = parseGaClientId(request.headers.get("cookie"));
      if (eid && uuidPattern.test(eid) && gaClientId) {
        const rawOrigin = requestUrl.searchParams.get("origin");
        const origin = isOriginSource(rawOrigin) ? rawOrigin : undefined;
        const originAgeRaw = requestUrl.searchParams.get("origin_age");
        const originAgeSeconds = originAgeRaw ? Number(originAgeRaw) : NaN;
        after(() =>
          mpEvent({
            clientId: gaClientId,
            eventName: "affiliate_redirect",
            params: {
              transaction_id: eid,
              offer_id: offer.id,
              merchant_id: offer.merchant_id,
              product_id: offer.product_id,
              currency: "EUR",
              origin,
              origin_age_seconds:
                origin && Number.isFinite(originAgeSeconds) ? originAgeSeconds : undefined,
            },
          }),
        );
      }
    }

    return Response.redirect(offer.url, 302);
  } catch (error) {
    logger.log({
      level: "error",
      message: "Redirect endpoint failed",
      timestamp: new Date().toISOString(),
      context: { offerId, error },
    });

    return Response.json({ error: "Internal redirect error" }, { status: 500 });
  }
}
