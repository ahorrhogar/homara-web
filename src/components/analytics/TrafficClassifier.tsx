"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gaEvent, gaSetUserProperties } from "@/infrastructure/analytics/ga4";
import {
  classifyReferrer,
  type Classification,
} from "@/infrastructure/analytics/referrer-classifier";
import { getPageType } from "@/infrastructure/analytics/page-type";

const SESSION_KEY = "homara_traffic_class";
const LAST_AI_KEY = "homara_last_ai_referrer";

interface StoredClassification {
  classification: Classification;
  landingPath: string;
  landingPageType: string;
  ts: number;
}

export function TrafficClassifier() {
  const pathname = usePathname();
  // Capture the landing pathname on first render. SPA navigation changes pathname
  // but doesn't re-mount the layout, so we'd lose the true entry point otherwise.
  const landingPathRef = useRef(pathname ?? "/");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const landingPath = landingPathRef.current;
    const landingPageType = getPageType(landingPath);

    // Brief delay lets @next/third-parties' afterInteractive scripts define window.gtag.
    const timer = setTimeout(() => {
      let stored: StoredClassification | null = null;
      try {
        const raw = window.sessionStorage.getItem(SESSION_KEY);
        if (raw) stored = JSON.parse(raw) as StoredClassification;
      } catch {
        stored = null;
      }

      const isFresh = !stored;
      if (!stored) {
        stored = {
          classification: classifyReferrer({
            referrer: document.referrer || null,
            currentUrl: window.location.href,
          }),
          landingPath,
          landingPageType,
          ts: Date.now(),
        };
      }

      const { classification } = stored;

      gaSetUserProperties({
        referrer_category: classification.category,
        referrer_subcategory: classification.subcategory,
        is_ai_session: classification.category === "ai_search",
        landing_page_type: stored.landingPageType,
      });

      if (!isFresh) return;

      try {
        window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(stored));
        if (classification.category === "ai_search") {
          window.localStorage.setItem(
            LAST_AI_KEY,
            JSON.stringify({
              subcategory: classification.subcategory,
              landingPath: stored.landingPath,
              ts: stored.ts,
            })
          );
        }
      } catch {
        /* storage may be blocked; analytics is best-effort */
      }

      gaEvent("traffic_classified", {
        referrer_category: classification.category,
        referrer_subcategory: classification.subcategory,
        referrer_hostname: classification.referrerHostname,
        utm_source: classification.utmSource,
        utm_medium: classification.utmMedium,
        utm_campaign: classification.utmCampaign,
        landing_path: stored.landingPath,
        landing_page_type: stored.landingPageType,
      });

      if (
        classification.category === "ai_search" &&
        stored.landingPageType === "blog_article"
      ) {
        gaEvent("ai_citation_landing", {
          slug: stored.landingPath.replace(/^\/blog\//, ""),
          landing_path: stored.landingPath,
          ai_engine: classification.subcategory,
        });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
