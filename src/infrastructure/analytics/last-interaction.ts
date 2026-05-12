export const LAST_INTERACTION_KEY = "homara.lastInteraction";
export const ORIGIN_MAX_AGE_SEC = 30 * 60;

export const ORIGIN_SOURCES = ["search", "assistant", "assistant_result"] as const;
export type OriginSource = (typeof ORIGIN_SOURCES)[number];

export function isOriginSource(value: unknown): value is OriginSource {
  return typeof value === "string" && (ORIGIN_SOURCES as readonly string[]).includes(value);
}

type LastInteractionPayload =
  | { source: "search"; term: string }
  | { source: "assistant"; priority: string; budget: number; category_id: string | null }
  | { source: "assistant_result"; product_id: string; index: number; tag: string | null };

export function setLastInteraction(payload: LastInteractionPayload): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      LAST_INTERACTION_KEY,
      JSON.stringify({ ...payload, ts: Date.now() }),
    );
  } catch {
    /* storage may be blocked; analytics is best-effort */
  }
}

export function readOriginParams(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = window.sessionStorage.getItem(LAST_INTERACTION_KEY);
    if (!raw) return "";
    const parsed = JSON.parse(raw) as { source?: string; ts?: number };
    if (!parsed.source || !parsed.ts || !isOriginSource(parsed.source)) return "";
    const ageSec = Math.round((Date.now() - parsed.ts) / 1000);
    if (ageSec > ORIGIN_MAX_AGE_SEC) return "";
    return `&origin=${encodeURIComponent(parsed.source)}&origin_age=${ageSec}`;
  } catch {
    return "";
  }
}
