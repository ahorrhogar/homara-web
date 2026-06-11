import "server-only";

/**
 * OAuth2 client-credentials token minting for the Amazon Creators API.
 *
 * Token endpoints are rate-limited and tokens live ~1h, so we MUST cache and
 * reuse them. We cache in Upstash Redis via its REST API (env vars are already
 * present; no client dependency needed) and fall back to a module-level
 * in-memory cache for local dev where Redis may be unset.
 *
 * Credential version (AMAZON_CREATOR_API_VERSION) selects the flow:
 *  - v3.x → Login with Amazon (LwA), JSON body, scope "creatorsapi::default"
 *  - v2.x → Cognito, form-encoded body, scope "creatorsapi/default"
 * Homara runs v3.2 (EU), but both are implemented for completeness.
 */

const CLIENT_ID = process.env.AMAZON_CREATOR_API_CREDENTIAL_ID;
const CLIENT_SECRET = process.env.AMAZON_CREATOR_API_CREDENTIAL_SECRET;
const VERSION = (process.env.AMAZON_CREATOR_API_VERSION ?? "v3.2").trim();

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const TOKEN_CACHE_KEY = "amazon:creatorsapi:token";
/** Refresh this many seconds before the real expiry, to avoid edge races. */
const EXPIRY_SKEW_SECONDS = 60;

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type?: string;
}

interface CachedToken {
  token: string;
  /** Epoch ms after which the token must be refreshed. */
  expiresAt: number;
}

let memoryToken: CachedToken | null = null;

function isV3(): boolean {
  return VERSION.startsWith("v3") || VERSION.startsWith("3");
}

/** EU (v3.2 / v2.2) endpoints — Homara's region. */
function tokenEndpoint(): string {
  if (isV3()) return "https://api.amazon.co.uk/auth/o2/token";
  return "https://creatorsapi.auth.eu-south-2.amazoncognito.com/oauth2/token";
}

// ── Upstash REST helpers (best-effort; never throw to the caller) ────────

async function redisGet(key: string): Promise<string | null> {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  try {
    const res = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { result?: string | null };
    return body.result ?? null;
  } catch {
    return null;
  }
}

async function redisSetEx(key: string, value: string, ttlSeconds: number): Promise<void> {
  if (!REDIS_URL || !REDIS_TOKEN) return;
  try {
    await fetch(
      `${REDIS_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}?EX=${ttlSeconds}`,
      { headers: { Authorization: `Bearer ${REDIS_TOKEN}` }, cache: "no-store" },
    );
  } catch {
    // best-effort cache; ignore failures
  }
}

// ── Token minting ───────────────────────────────────────────────────────

async function mintToken(): Promise<TokenResponse> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      "Amazon Creators API credentials missing (AMAZON_CREATOR_API_CREDENTIAL_ID / _SECRET).",
    );
  }

  const endpoint = tokenEndpoint();
  const init: RequestInit = isV3()
    ? {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "client_credentials",
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          scope: "creatorsapi::default",
        }),
      }
    : {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
        },
        body: "grant_type=client_credentials&scope=creatorsapi/default",
      };

  const res = await fetch(endpoint, { ...init, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Amazon token request failed (HTTP ${res.status}): ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as TokenResponse;
  if (!json.access_token) {
    throw new Error("Amazon token response missing access_token.");
  }
  return json;
}

/**
 * Returns a valid bearer access token, reusing the cached one until shortly
 * before expiry. The version suffix the catalog API expects on the
 * Authorization header (v2.x only) is handled by the client, not here.
 */
export async function getAccessToken(): Promise<string> {
  const now = Date.now();

  if (memoryToken && memoryToken.expiresAt > now) {
    return memoryToken.token;
  }

  const cached = await redisGet(TOKEN_CACHE_KEY);
  if (cached) {
    // Stored just before expiry already; treat presence as validity.
    memoryToken = { token: cached, expiresAt: now + 5 * 60_000 };
    return cached;
  }

  const minted = await mintToken();
  const ttl = Math.max(minted.expires_in - EXPIRY_SKEW_SECONDS, 60);
  memoryToken = { token: minted.access_token, expiresAt: now + ttl * 1000 };
  await redisSetEx(TOKEN_CACHE_KEY, minted.access_token, ttl);
  return minted.access_token;
}

/** True when the credential version expects a `Version` suffix on the header. */
export function needsVersionHeaderSuffix(): boolean {
  return !isV3();
}

export function credentialVersion(): string {
  return VERSION;
}
