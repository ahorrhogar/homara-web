import { GoogleAnalytics } from "@next/third-parties/google";
import { WebVitalsReporter } from "@/components/analytics/WebVitalsReporter";
import { TrafficClassifier } from "@/components/analytics/TrafficClassifier";

interface Props {
  gaId?: string | null;
}

export function GoogleAnalyticsMount({ gaId }: Props) {
  if (!gaId) return null;
  return (
    <>
      <GoogleAnalytics gaId={gaId} />
      <WebVitalsReporter />
      <TrafficClassifier />
    </>
  );
}
