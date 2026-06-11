import { defineRouting } from "next-intl/routing";

/**
 * Central i18n routing config. Only `es` is active today; adding a locale is a
 * purely additive change (append to `locales` + drop in `messages/<locale>.json`
 * + backfill the `<locale>` translation rows).
 *
 * `localePrefix: "as-needed"` keeps the default locale (`es`) at the site root
 * with NO `/es/` prefix, so every existing Spanish URL stays byte-identical
 * (HARD RULE #2). A future `en` would be served under `/en/...`.
 */
export const routing = defineRouting({
  locales: ["es"],
  defaultLocale: "es",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
