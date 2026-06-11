import "server-only";

import type { Metadata } from "next";

import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es").replace(/\/$/, "");

/**
 * `og:locale` values keyed by routing locale. Falls back to the raw locale when
 * unmapped so adding a language never crashes — just add the proper region tag
 * here when you add the locale.
 */
const OG_LOCALE_BY_LOCALE: Record<string, string> = {
  es: "es_ES",
};

/** Maps a routing locale (`es`) to its OpenGraph form (`es_ES`). */
export function toOpenGraphLocale(locale: string): string {
  return OG_LOCALE_BY_LOCALE[locale] ?? locale;
}

function absoluteFor(href: string, locale: string): string {
  return `${SITE_URL}${getPathname({ href, locale })}`;
}

/**
 * Absolute hreflang map for a locale-agnostic app path: one entry per active
 * locale plus `x-default` (→ the default locale). The single source of truth for
 * hreflang URLs, shared by page `<link rel="alternate">` tags (via
 * `buildAlternates`) and the sitemap's `<xhtml:link>` alternates, so the two can
 * never drift apart. For `es`-only this is `{ es, "x-default" }` at the no-prefix
 * URL; adding a locale auto-adds its prefixed entry.
 */
export function hreflangMap(href: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const activeLocale of routing.locales) {
    languages[activeLocale] = absoluteFor(href, activeLocale);
  }
  languages["x-default"] = absoluteFor(href, routing.defaultLocale);
  return languages;
}

/**
 * Builds the `alternates` metadata block for a public page: a self-referential
 * canonical for `locale` plus the shared hreflang `languages` map.
 *
 * With the single `es` locale this emits the canonical at the no-prefix URL plus
 * `hreflang="es"` + `x-default` pointing at the same URL — the canonical stays
 * exactly what it was before Phase 5; only the hreflang links are added. Adding a
 * locale auto-adds its entry (and prefixes its URLs) with no per-page changes.
 *
 * `href` is the locale-agnostic app path (e.g. `/blog/foo`); `getPathname`
 * applies the locale prefix policy (`as-needed` → no `/es/`).
 */
export function buildAlternates(
  href: string,
  locale: string = routing.defaultLocale,
): Metadata["alternates"] {
  return {
    canonical: absoluteFor(href, locale),
    languages: hreflangMap(href),
  };
}
