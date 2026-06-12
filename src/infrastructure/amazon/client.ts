import "server-only";

import { ApiClient, DefaultApi } from "@amzn/creatorsapi-nodejs-sdk";

/**
 * Transport for the Amazon Creators API, built on the official vendored SDK
 * (@amzn/creatorsapi-nodejs-sdk — see vendor/). The SDK owns OAuth2 token
 * minting, caching and renewal; this module adds what the SDK leaves to the
 * application per Amazon's best-practices doc:
 *   - a process-wide singleton so the cached token is reused across warm
 *     serverless invocations (one token, not one-per-request)
 *   - an in-process TPS gate so a cron batch can't burst past the allocation
 *   - 429/5xx retry with exponential backoff, and 401 token-refresh recovery
 */

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
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "AmazonApiError";
  }
}

export { AmazonApiError };

// ── SDK singleton ─────────────────────────────────────────────────────────
let apiClient: ApiClient | null = null;
let api: DefaultApi | null = null;

function getApi(): DefaultApi {
  if (api && apiClient) return api;

  const credentialId = process.env.AMAZON_CREATOR_API_CREDENTIAL_ID;
  const credentialSecret = process.env.AMAZON_CREATOR_API_CREDENTIAL_SECRET;
  if (!credentialId || !credentialSecret) {
    throw new Error(
      "Amazon Creators API credentials missing (AMAZON_CREATOR_API_CREDENTIAL_ID / _SECRET).",
    );
  }

  apiClient = new ApiClient();
  apiClient.credentialId = credentialId;
  apiClient.credentialSecret = credentialSecret;
  // SDK expects "3.2"; our env stores "v3.2".
  apiClient.version = (process.env.AMAZON_CREATOR_API_VERSION ?? "3.2").replace(/^v/i, "");
  api = new DefaultApi(apiClient);
  return api;
}

/** Force the cached OAuth2 token to be re-minted on the next call. */
function clearToken(): void {
  apiClient?.tokenManager?.clearToken();
}

// ── In-process TPS gate ─────────────────────────────────────────────────
// Serialises calls so consecutive requests are spaced ≥ MIN_REQUEST_INTERVAL_MS
// apart. Sufficient for the single-invocation cron and serial admin actions.
let throttleChain: Promise<void> = Promise.resolve();
let lastRequestAt = 0;

function nextSlot(): Promise<void> {
  const wait = throttleChain.then(async () => {
    const elapsed = Date.now() - lastRequestAt;
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await sleep(MIN_REQUEST_INTERVAL_MS - elapsed);
    }
    lastRequestAt = Date.now();
  });
  throttleChain = wait.catch(() => undefined);
  return wait;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function statusOf(error: unknown): number | undefined {
  const e = error as { status?: number; response?: { status?: number } };
  return e?.status ?? e?.response?.status;
}

function bodyOf(error: unknown): unknown {
  const e = error as { response?: { body?: unknown }; message?: string };
  return e?.response?.body ?? e?.message;
}

/**
 * Invokes an SDK operation with the shared throttle, retry/backoff and 401
 * recovery. `op` receives the singleton DefaultApi.
 */
export async function callSdk<T>(op: (api: DefaultApi) => Promise<unknown>): Promise<T> {
  let attempt = 0;
  let authRetried = false;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await nextSlot();
    try {
      return (await op(getApi())) as T;
    } catch (error) {
      const status = statusOf(error);

      // Token lapsed before the SDK refreshed it — clear and retry once.
      if (status === 401 && !authRetried) {
        clearToken();
        authRetried = true;
        continue;
      }

      const retriable = status === 429 || (typeof status === "number" && status >= 500);
      if (retriable && attempt < MAX_RETRIES) {
        await sleep(backoffMs(attempt));
        attempt += 1;
        continue;
      }

      if (typeof status === "number") {
        throw new AmazonApiError(
          `Creators API call failed (HTTP ${status})`,
          status,
          bodyOf(error),
        );
      }
      throw error;
    }
  }
}

function backoffMs(attempt: number): number {
  // 500ms, 1s, 2s, 4s + jitter
  return 2 ** attempt * 500 + Math.floor(Math.random() * 250);
}
