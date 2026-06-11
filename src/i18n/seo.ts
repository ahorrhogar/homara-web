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
 * Builds the `alternates` metadata block for a public page: a self-referential
 * canonical for `locale` plus an hreflang `languages` map covering every active
 * locale and `x-default` (→ the default locale).
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
  const languages: Record<string, string> = {};
  for (const activeLocale of routing.locales) {
    languages[activeLocale] = absoluteFor(href, activeLocale);
  }
  languages["x-default"] = absoluteFor(href, routing.defaultLocale);

  return {
    canonical: absoluteFor(href, locale),
    languages,
  };
}
