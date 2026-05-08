import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "node:util";

// jsdom strips Node's TextEncoder/TextDecoder globals; Next's server code (transitively
// pulled in by `next/cache`) needs them to load even when the cache APIs are not used.
const globals = globalThis as Record<string, unknown>;
if (globals.TextEncoder === undefined) {
  globals.TextEncoder = TextEncoder;
}
if (globals.TextDecoder === undefined) {
  globals.TextDecoder = TextDecoder;
}

if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
