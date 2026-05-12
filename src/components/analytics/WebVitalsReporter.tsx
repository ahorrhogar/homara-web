"use client";

import { useReportWebVitals } from "next/web-vitals";
import { usePathname } from "next/navigation";
import { gaEvent } from "@/infrastructure/analytics/ga4";
import { getPageType } from "@/infrastructure/analytics/page-type";

type VitalsMetricName = "CLS" | "FID" | "INP" | "LCP" | "FCP" | "TTFB";

const THRESHOLDS: Record<VitalsMetricName, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  FID: { good: 100, poor: 300 },
};

function isCoreVital(name: string): name is VitalsMetricName {
  return name in THRESHOLDS;
}

function rateMetric(name: VitalsMetricName, value: number): "good" | "needs-improvement" | "poor" {
  const t = THRESHOLDS[name];
  if (value <= t.good) return "good";
  if (value <= t.poor) return "needs-improvement";
  return "poor";
}

function lcpElementFingerprint(entries: PerformanceEntryList | undefined): string | null {
  if (!entries?.length) return null;
  const last = entries.at(-1) as
    | (PerformanceEntry & { element?: Element; url?: string })
    | undefined;
  const el = last?.element;
  if (!el) return last?.url ?? null;
  if (el instanceof HTMLImageElement) {
    return (el.currentSrc || el.src || el.tagName).slice(0, 120);
  }
  const tag = el.tagName?.toLowerCase() ?? "unknown";
  const id = (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : "";
  return `${tag}${id}`.slice(0, 120);
}

export function WebVitalsReporter() {
  const pathname = usePathname();

  useReportWebVitals((metric) => {
    if (!isCoreVital(metric.name)) return;

    const isCls = metric.name === "CLS";
    const value = isCls ? Math.round(metric.value * 1000) : Math.round(metric.value);

    gaEvent("web_vitals", {
      metric_name: metric.name,
      metric_value: value,
      metric_rating: rateMetric(metric.name, metric.value),
      metric_id: metric.id,
      metric_delta: Math.round((metric as { delta?: number }).delta ?? 0),
      metric_navigation_type: (metric as { navigationType?: string }).navigationType,
      page_path: pathname,
      page_type: getPageType(pathname ?? "/"),
      ...(metric.name === "LCP" ? { lcp_element: lcpElementFingerprint(metric.entries) } : {}),
      non_interaction: true,
    });
  });

  return null;
}
