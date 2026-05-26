import "server-only";
import { logger } from "@/infrastructure/logging/logger";
import { stripUndefined } from "@/infrastructure/analytics/ga4";

const MP_ENDPOINT = "https://www.google-analytics.com/mp/collect";

type MpParamValue = string | number | boolean | null;

export interface MpEventInput {
  clientId: string;
  eventName: string;
  params?: Record<string, MpParamValue | undefined>;
  userProperties?: Record<string, { value: string | number | boolean }>;
}

export async function mpEvent(input: MpEventInput): Promise<void> {
  const gaId = process.env.GA_ID;
  const apiSecret = process.env.GA4_API_SECRET;
  if (!gaId || !apiSecret) return;

  const body = JSON.stringify({
    client_id: input.clientId,
    events: [{ name: input.eventName, params: stripUndefined(input.params ?? {}) }],
    ...(input.userProperties ? { user_properties: input.userProperties } : {}),
  });

  const url = `${MP_ENDPOINT}?measurement_id=${encodeURIComponent(gaId)}&api_secret=${encodeURIComponent(apiSecret)}`;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    });
  } catch (error) {
    logger.log({
      level: "warn",
      message: "Measurement Protocol event failed",
      timestamp: new Date().toISOString(),
      context: {
        eventName: input.eventName,
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }
}
