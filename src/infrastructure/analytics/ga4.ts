declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type GaEventParamValue =
  | string
  | number
  | boolean
  | null
  | readonly unknown[]
  | Record<string, unknown>;

export type GaEventParams = Record<string, GaEventParamValue | undefined>;

export function stripUndefined<T>(obj: Record<string, T | undefined>): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v as T;
  }
  return out;
}

function callGtag(command: string, ...args: unknown[]): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag(command, ...args);
}

export function gaEvent(name: string, params: GaEventParams = {}): void {
  callGtag("event", name, stripUndefined(params));
}

export function gaSetUserProperties(props: GaEventParams): void {
  callGtag("set", "user_properties", stripUndefined(props));
}
