import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation wrappers. Use these for ALL app-internal links and
 * programmatic navigation so a future non-default locale auto-prefixes its URLs
 * (e.g. `/en/blog`). For the current single `es` locale these behave identically
 * to `next/link` + `next/navigation` (no prefix is ever emitted).
 *
 * Keep using `next/link` for explicit non-localized targets such as
 * `/api/redirect?...` — those must never receive a locale prefix.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
