"use client";

import { useEffect, useRef } from "react";
import { gaEvent } from "@/infrastructure/analytics/ga4";
import { setLastInteraction } from "@/infrastructure/analytics/last-interaction";
import { getAnalyticsSessionId } from "@/services/analyticsSession";
import { recordSearchTerm } from "@/app/buscar/_actions/track";

interface Props {
  query: string;
  normalizedTerm: string;
  resultCount: number;
  topProductId?: string | null;
}

export function SearchResultsBeacon({
  query,
  normalizedTerm,
  resultCount,
  topProductId,
}: Props) {
  const lastFiredRef = useRef<string | null>(null);

  useEffect(() => {
    if (!normalizedTerm) return;
    if (lastFiredRef.current === normalizedTerm) return;
    lastFiredRef.current = normalizedTerm;

    gaEvent("view_search_results", {
      search_term: query,
      normalized_term: normalizedTerm,
      result_count: resultCount,
      top_product_id: topProductId ?? null,
    });

    if (resultCount === 0) {
      gaEvent("search_zero_results", {
        search_term: query,
        normalized_term: normalizedTerm,
      });
    }

    setLastInteraction({ source: "search", term: normalizedTerm });

    recordSearchTerm({
      term: query,
      resultCount,
      topProductId: topProductId ?? undefined,
      sessionId: getAnalyticsSessionId(),
      path: "/buscar",
    }).catch(() => undefined);
  }, [query, normalizedTerm, resultCount, topProductId]);

  return null;
}
