import "server-only";

import {
  credentialVersion,
  getAccessToken,
  invalidateToken,
  needsVersionHeaderSuffix,
} from "./auth";

/**
 * Low-level transport for the Amazon Creators API.
 *
 * Responsibilities:
 *  - mint/reuse the bearer token (see auth.ts)
 *  - attach common headers + partnerTag + marketplace to every request
 *  - throttle to the account TPS (default 1 req/s) so a cron batch can't burst
 *  - retry transient failures (429 / 5xx) with exponential backoff
 */

const BASE_URL = "https://creatorsapi.amazon";

export const PARTNER_TAG = process.env.AMAZON_PARTNER_TAG ?? "ahorrhogar-21";
export const MARKETPLACE = process.env.AMAZON_MARKETPLACE ?? "www.amazon.es";

/** Account allocation. Free tier starts at 1 TPS; override via env once scaled. */
const CONFIGURED_TPS = Number(process.env.AMAZON_TPS ?? 1);
const TPS = Number.isFinite(CONFIGURED_TPS) && CONFIGURED_TPS > 0 ? CONFIGURED_TPS : 1;
const MIN_REQUEST_INTERVAL_MS = Math.max(Math.round(1000 / TPS), 100);
const MAX_RETRIES = 4;

class AmazonApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: string,
  ) {
    super(message);
    this.name = "AmazonApiError";
  }
}

export { AmazonApiError };

// ── In-process TPS gate ──────────────────────────────────────────────────
// Serialises calls so consecutive requests are spaced ≥ MIN_REQUEST_INTERVAL_MS
// apart. Sufficient for the single-invocation cron and serial admin actions.
let throttleChain: Promise<void> = Promise.resolve();
let lastRequestAt = 0;

function nextSlot(): Promise<void> {
  const wait = throttleChain.then(async () => {
    const now = Date.now();
    const elapsed = now - lastRequestAt;
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await sleep(MIN_REQUEST_INTERVAL_MS - elapsed);
    }
    lastRequestAt = Date.now();
  });
  // Keep the chain unbroken even if a slot rejects.
  throttleChain = wait.catch(() => undefined);
  return wait;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function authHeader(token: string): string {
  return needsVersionHeaderSuffix()
    ? `Bearer ${token}, Version ${credentialVersion()}`
    : `Bearer ${token}`;
}

/**
 * POST a Creators API operation. `body` is merged with partnerTag + marketplace
 * defaults (caller values win). Returns the parsed JSON response of type T.
 */
export async function callCreatorsApi<T>(
  operationPath: string,
  body: Record<string, unknown>,
): Promise<T> {
  const payload = {
    partnerTag: PARTNER_TAG,
    marketplace: MARKETPLACE,
    ...body,
  };

  let attempt = 0;
  let authRetried = false;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await nextSlot();
    const token = await getAccessToken();

    let res: Response;
    try {
      res = await fetch(`${BASE_URL}${operationPath}`, {
        method: "POST",
        headers: {
          Authorization: authHeader(token),
          "Content-Type": "application/json",
          "x-marketplace": MARKETPLACE,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
    } catch (networkError) {
      if (attempt < MAX_RETRIES) {
        await sleep(backoffMs(attempt));
        attempt += 1;
        continue;
      }
      throw networkError;
    }

    if (res.ok) {
      return (await res.json()) as T;
    }

    // A 401 means the (possibly cached) token lapsed — drop it and retry once
    // with a freshly minted token before giving up.
    if (res.status === 401 && !authRetried) {
      await invalidateToken();
      authRetried = true;
      continue;
    }

    const retriable = res.status === 429 || res.status >= 500;
    if (retriable && attempt < MAX_RETRIES) {
      await sleep(backoffMs(attempt, res.headers.get("retry-after")));
      attempt += 1;
      continue;
    }

    const text = await res.text().catch(() => "");
    throw new AmazonApiError(
      `Creators API ${operationPath} failed (HTTP ${res.status})`,
      res.status,
      text.slice(0, 500),
    );
  }
}

function backoffMs(attempt: number, retryAfter?: string | null): number {
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000;
  }
  // 500ms, 1s, 2s, 4s + jitter
  return 2 ** attempt * 500 + Math.floor(Math.random() * 250);
}
