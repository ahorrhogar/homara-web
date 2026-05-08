"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useCookieConsent } from "@/hooks/useCookieConsent";

export function AnalyticsScripts() {
  const { canUseAnalytics } = useCookieConsent();

  if (!canUseAnalytics()) {
    return null;
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
