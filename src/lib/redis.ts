import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const isConfigured = Boolean(url && token);

export const redis = isConfigured ? new Redis({ url: url!, token: token! }) : null;

type LimitConfig = { tokens: number; window: `${number} ${"s" | "m" | "h" | "d"}` };

const inMemoryBuckets = new Map<string, { count: number; resetAt: number }>();

function inMemoryLimit(key: string, cfg: LimitConfig) {
  const now = Date.now();
  const ms = parseWindowMs(cfg.window);
  const entry = inMemoryBuckets.get(key);
  if (!entry || entry.resetAt <= now) {
    inMemoryBuckets.set(key, { count: 1, resetAt: now + ms });
    return { success: true, remaining: cfg.tokens - 1, reset: now + ms };
  }
  if (entry.count >= cfg.tokens) {
    return { success: false, remaining: 0, reset: entry.resetAt };
  }
  entry.count += 1;
  return { success: true, remaining: cfg.tokens - entry.count, reset: entry.resetAt };
}

function parseWindowMs(w: LimitConfig["window"]): number {
  const [n, unit] = w.split(" ") as [string, "s" | "m" | "h" | "d"];
  const num = Number(n);
  switch (unit) {
    case "s":
      return num * 1000;
    case "m":
      return num * 60_000;
    case "h":
      return num * 3_600_000;
    case "d":
      return num * 86_400_000;
  }
}

export function makeRateLimit(prefix: string, cfg: LimitConfig) {
  if (redis) {
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(cfg.tokens, cfg.window),
      prefix: `homara:rl:${prefix}`,
      analytics: false,
    });
    return (key: string) => rl.limit(key);
  }
  return async (key: string) => inMemoryLimit(`${prefix}:${key}`, cfg);
}

export const RATE_LIMITS = {
  click: makeRateLimit("click", { tokens: 30, window: "1 m" }),
  searchTerm: makeRateLimit("search", { tokens: 60, window: "1 m" }),
  articleView: makeRateLimit("article", { tokens: 10, window: "30 m" }),
  adminWrite: makeRateLimit("admin-write", { tokens: 60, window: "1 m" }),
} as const;
