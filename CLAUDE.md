# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Homara is

Homara is a Spanish-language **home & garden affiliate comparison site** (Amazon + Awin). It is **not a store** — the business model is *SEO content + comparator + affiliate clicks*. The cadena de valor is: `Tráfico SEO → Contenido editorial → Comparador / Ficha → Clic afiliado → Comisión`.

Strategic context — vision, OKRs, SEO architecture, monetization rules, brand voice — lives in the sibling Obsidian vault at `/Users/martiwarda/Projects/homara/homara-brain`. When a task touches strategy, content tone, category structure, or affiliate behavior, read the relevant note in `02-Estrategia/`, `03-SEO/`, `05-Producto/` or `06-Monetizacion/` before deciding. Always reflect changes in this codebase back to the corresponding note when the source of truth shifts.

User-facing copy is **Spanish**, voice is editorial/expert/close-to-the-reader (`01-Empresa/Tono-y-voz.md`): short sentences, concrete data (medidas, materiales, consumo, garantía), no empty superlatives, no aggressive CTAs.

## Hard rules (from `homara-brain/05-Producto/Reglas-de-cambio.md` and `06-Monetizacion/Proteccion-de-enlaces.md`)

1. **Never put raw affiliate links in content.** Every outbound click must go through `/api/redirect?offerId=…&track=1`, which logs the click and 302s to the merchant URL. See `src/app/api/redirect/route.ts` and `trackClick` in `src/data/catalog/tracking.ts`.
2. **Do not change existing affiliate URLs, merchant IDs, or product slugs** without a documented reason. Losing the URL = losing accumulated SEO authority and click history = losing revenue.
3. **Do not break existing UI/UX** without explicit need. Stability + SEO + conversion outrank refactor aesthetics.
4. **One intention = one URL.** No duplicate content, no parallel routes for the same query intent.
5. Sensitive changes need a backup + rollback plan. Architectural shifts need a `Plantilla-Decision` note in the brain vault.

## Commands

Package manager: **npm** only (the `bun.lock*` files were removed during migration; Vercel uses `npm install`).

- `npm run dev` — Next.js dev server (default `:3000`).
- `npm run build` — Next.js production build; output in `.next/`. Vercel auto-detects.
- `npm run start` — serve the production build locally.
- `npm run lint` — `next lint` (ESLint flat config extending `next/core-web-vitals` + `next/typescript`).
- `npm run typecheck` — `tsc --noEmit`.
- `npm run test` / `npm run test:watch` — Jest (configured via `next/jest`). Pattern: `src/**/*.{test,spec}.{ts,tsx}`. Test setup file: `jest.setup.ts`.
- Single test: `npx jest src/domain/catalog/home-ranking.test.ts` (or `-t "<name>"` to filter).
- Supabase (when CLI is linked): `supabase db push`, `supabase db reset --linked`. Migrations live in `supabase/migrations/` and are timestamp-prefixed; never edit a merged migration — add a new one.

## Required environment

`.env.local` from `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — required (used by both browser and server clients via `@supabase/ssr`).
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` — server-only fallback (read by `src/integrations/supabase/server.ts` and `src/middleware.ts` when the `NEXT_PUBLIC_*` versions aren't set).
- `NEXT_PUBLIC_SITE_URL` — used by `app/sitemap.ts`, `app/robots.ts`, and `metadataBase`. Defaults to `https://homara.es` when unset.

The legacy `VITE_*` variables and the `VITE_USE_REDIRECT_API` feature flag have been removed — every offer link now flows through `/api/redirect?offerId=…&track=1`.

## Architecture

**Next.js 15 (App Router) + React 19 + TypeScript + Supabase**, deployed on Vercel. Path alias: `@/*` → `src/*` (preserved from the Vite era).

### Layered data flow

```
src/app/**/page.tsx (RSC)  →  src/data/catalog/* (server-only, unstable_cache + tags)  →  Supabase
                              src/data/editorial/* (static editorial source)

Mutations on /admin/(panel)/*: browser-side React Query → src/admin/services/* → Supabase (cookie-auth)
                               then  src/admin/_actions/cache.ts (server action) → revalidateTag('catalog' | 'articles' | 'ranking-signals')
Click tracking on /api/redirect: src/data/catalog/tracking.ts → Supabase RPC, then revalidateTag('ranking-signals')
```

- **`src/domain/`** — pure business types and logic. No I/O, no React. Examples: `catalog/home-ranking.ts`, `catalog/offer-sync.ts`, `editorial/article-logic.ts`, `assistant/recommendation`. Tests run under the Node Jest environment.
- **`src/data/catalog/`** — server-only data layer built on `unstable_cache` + tag-based revalidation. `import "server-only"` at the top of each module so a client import fails the build:
  - `_helpers.ts` — pure transforms (slugify, parseSpecs, buildProducts, buildCategories, buildMerchants, buildOffersByProductId, buildPriceHistoryMap) + row types + meta constants
  - `snapshot.ts` — `getCatalogSnapshot()` (180s, tag `catalog`); owns the cache-tag constants (`CATALOG_CACHE_TAG`, `CATEGORIES_CACHE_TAG`, `PRODUCTS_CACHE_TAG`, `OFFERS_CACHE_TAG`, `ARTICLES_CACHE_TAG`, `RANKING_SIGNALS_CACHE_TAG`)
  - `ranking-signals.ts` — `getRankingSignals()` (120s, tag `ranking-signals`); catches all errors and returns empty signals
  - `tracking.ts` — `trackClick`, `trackSearchTerm`, `getOfferRedirectPayload`; calls `revalidateTag('ranking-signals')` after writes
  - `search.ts` — `searchProducts(query, limit)` with snapshot-local scoring + remote brand/category/merchant cross-matching
  - `categories.ts`, `products.ts`, `offers.ts`, `articles.ts` — facades that read from snapshot/ranking-signals and re-export
- **`src/data/editorial/`** — static editorial source for the article catalog (`static-source.ts`, `types.ts`).
- **`src/services/`** — application services that survive the migration: `analyticsService`, `analyticsSession`, `cookieConsentService`, `editorialService`, `editorialTrackingService`, `productNavigationService`. The legacy `productService` / `categoryService` / `offerService` / `searchTrackingService` were deleted in Step 7 — App Router code reads from `src/data/catalog/*` directly.
- **`src/infrastructure/`** — cross-cutting: `analytics/`, `logging/`, `rate-limit/`, `security/` (sanitize, safe-redirect, affiliateUrl).
- **`src/integrations/supabase/`** — `client.ts` exports `getSupabaseClient()` (browser, via `@supabase/ssr` `createBrowserClient`); `server.ts` exports `createServerSupabaseClient()` (cookie-aware, for RSC + server actions + middleware) and `createAnonymousServerSupabaseClient()` (cookieless, for sitemap + redirect); `anonymous.ts` exports `getAnonymousSupabaseClient()` (sync, works in any context — used by `unstable_cache` callbacks).
- **`src/admin/`** — admin panel. Auth is enforced **server-side** by `src/middleware.ts` (refreshes the Supabase session, calls the `is_admin` RPC, redirects to `/admin/login` or `/admin/denegado` before any RSC renders). The login form is a client component posting to a server action at `src/admin/_actions/auth.ts`. The browser-side admin services in `src/admin/services/*` invoke `src/admin/_actions/cache.ts` after mutations to push `revalidateTag()` through the public-site cache pipeline.
- **`src/app/api/redirect/route.ts`** — affiliate redirect endpoint. Validates the `offerId` UUID, runs `isAffiliateUrlAllowed`, optionally records a click via `trackClick` from `@/data/catalog/tracking`, and 302s to the merchant URL.
- **`src/app/sitemap.ts`** — generates `/sitemap.xml` from a static route list plus a Supabase fetch of active categories and published `editorial_articles`. Cached for 1 hour.
- **`src/app/robots.ts`** — generates `/robots.txt`. Disallows `/api/` and `/admin/`.

### Routing (Next.js App Router, `src/app/`)

- Public: `/`, `/categoria/[slug]/[[…subSlug]]`, `/producto/[slug]`, `/buscar` (RSC reading `searchParams.q`, `metadata.robots: { index: false }`), `/blog` (article hub), `/blog/[slug]` (dynamic editorial fallback), `/asistente`, `/acerca-de`, `/cookies`, `/politica-privacidad`, `/aviso-legal`. The 12 hardcoded blog guides each live at `src/app/blog/<slug>/page.tsx` (URLs unchanged per HARD RULE #2); adding a new hand-built guide just means dropping a new `page.tsx` folder.
- Admin: `/admin/login` and `/admin/denegado` are bare pages. The authenticated panel lives under the `src/app/admin/(panel)/` route group: `/admin` (Dashboard), `/admin/products`, `/admin/offers`, `/admin/categories`, `/admin/brands`, `/admin/merchants`, `/admin/articles`, `/admin/imports`, `/admin/analytics`, `/admin/audit`, `/admin/settings`. The shared sidebar + sign-out form is in `src/app/admin/(panel)/layout.tsx`. Each panel page is a `"use client"` component using React Query + the existing browser-side admin services.
- URL aliases (HARD RULE #4: one intention = one URL): `next.config.ts` 301s `/guias` → `/blog`, `/politica-cookies` → `/cookies`, `/condiciones-generales-de-uso` → `/aviso-legal`. Don't add pages at the source paths.
- 404: `src/app/not-found.tsx`. The legacy SPA rewrite (`vercel.json /(.*) → /index.html`) is gone — Next handles it natively.

### UI conventions

- **shadcn/ui** (config in `components.json`, base color `slate`, components under `src/components/ui/`). Use existing primitives before adding new dependencies.
- **Tailwind** with `tailwindcss-animate` and `@tailwindcss/typography`. The `font-sans` / `font-display` Tailwind utilities resolve through CSS variables emitted by `next/font/google` (`--font-sans` for Inter, `--font-display` for Plus Jakarta Sans), wired in `src/app/layout.tsx`.
- **next/font** owns webfonts. Don't reintroduce `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` or `@import url(...)` — those are slower and break CSP.
- **TanStack Query** for client async state. The `QueryClientProvider` is in `src/app/providers.tsx` (a client island wrapped by `src/app/layout.tsx`). Use it for admin polling / optimistic mutations; on public pages, prefer RSC fetches via `src/data/catalog/*` so initial HTML ships with content.
- **Server vs client**: data fetching defaults to RSC (server component + `unstable_cache` + tag). Drop `"use client"` in only when interactivity demands it (state, effects, browser APIs, event handlers). `src/data/catalog/*` modules `import "server-only"` so a client import fails fast.
- **Cookie consent gates analytics**: `useCookieConsent` controls whether `@vercel/analytics` and `@vercel/speed-insights` mount (see `src/components/analytics/AnalyticsScripts.tsx`); the click-tracking RPC in `src/data/catalog/tracking.ts` only fires when `?track=1` is present on the redirect URL, which the client only sets when `canUseAnalytics()` returns true. Don't fire tracking outside that gate.
- **Affiliate URLs**: every product card's "Ir a la tienda" button must point to `/api/redirect?offerId=<uuid>&track=1`. The legacy `VITE_USE_REDIRECT_API` toggle is gone — there's no opt-out.

### TypeScript posture

`tsconfig.json` runs with `strict: false`, `strictNullChecks: false`, `noImplicitAny: false`, `noUnusedLocals: false`. The catalog data layer (`src/data/catalog/*`) and App Router pages were written defensively to be strict-clean, but the legacy admin code (`src/admin/services/*`, `src/app/admin/(panel)/*`) carries ~195 errors under full `strict: true`, mostly `'data' is possibly null` from Supabase query patterns. Flipping to strict is a follow-up cleanup, not migration scope. New files should be written as if `strict: true` were on. ESLint disables `@typescript-eslint/no-unused-vars`, `@typescript-eslint/no-explicit-any`, `react/no-unescaped-entities`, and `@next/next/no-img-element` (the last for the 3 remaining `<img>` tags in two hardcoded blog guides).

### SEO + structured data expectations

When touching pages that ship to production:

- **Schema.org JSON-LD**: `Product` + `Offer` on product pages, `Article` + `BreadcrumbList` on blog pages, `ItemList` on rankings.
- **Interlinking** (`homara-brain/03-SEO/Interlinking.md`): every article links to its parent category and ≥2 related pieces; every category links to its subcategories and ≥3 cluster articles; every comparativa links to the individual product pages it compares. Anchor text must read naturally.
- **Canonicals**: filters/paginations canonical to the parent unless they have their own intent. Internal search pages: `noindex`.
- Performance budgets: LCP < 2.5s, CLS < 0.1, INP < 200ms. Use AVIF/WebP + lazy load for images.
- The sitemap is dynamic — adding a new editorial slug doesn't require manual sitemap edits, but it does require the article row in Supabase (or the static guide pages map in `api/sitemap.xml.ts`).

## Working with Supabase migrations

- Migrations are append-only, timestamp-prefixed: `YYYYMMDDhhmmss_description.sql`. Patterns visible in the directory: catalog schema, admin panel, RLS hardening, click-tracking thresholds, and per-cluster seed migrations (e.g. `*_terrace_tables_*`, `*_publish_*_article.sql`).
- Click-tracking and admin-auth migrations encode the security model — don't loosen RLS without reading the existing hardening migrations (`*_affiliate_security_hardening.sql`, `*_click_tracking_hardening.sql`, `*_admin_users_single_source_auth.sql`).
- `scripts/seed_*_supabase.mjs` are one-shot seed runners for editorial product clusters (umbrellas, pools). Use them as a template when seeding a new cluster; don't repurpose an existing one.

## Conventions for new code (post-migration)

- Pure logic stays in `src/domain/` (no I/O, no React).
- Server data fetchers go in `src/data/catalog/*` — must `import "server-only"`, must use `unstable_cache` with a stable key + tags, must accept primitive args (slugs, ids) so cache keys serialize cleanly.
- Mutations on `/admin/*` go in `src/app/admin/_actions/<entity>.ts` as `"use server"` functions, call `revalidateTag(CATALOG_CACHE_TAG | …)` after writes.
- Pages default to RSC; only add `"use client"` when interactivity demands it. Lift state up so most of the tree stays server-rendered.
- Components that need browser APIs (`window`, `document`, `localStorage`, `navigator`) MUST start with `"use client"` and live in a clearly named client component file.
- Run `npm run build` before opening a PR — `next build` exercises both the type checker and the prerender path.
