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
- Database (Prisma + Postgres / Neon in prod): `npm run db:migrate` (dev, creates + applies), `npm run db:migrate:deploy` (prod / re-apply), `npm run db:reset` (force re-create), `npm run db:studio` (browser inspector). Migrations live in `prisma/migrations/` and are timestamp-prefixed; never edit a merged migration — `prisma migrate dev <name>` creates a new one. `npm run vercel-build` runs `prisma migrate deploy && npm run build`.
- Seed scripts: `npm run db:seed-products` (load `scripts/data/products.ts` into the catalog). Run via `dotenv -e .env.local -- tsx scripts/<name>.ts`. The legacy `scripts/seed_*_supabase.mjs` files are deprecated artifacts of the Supabase era — do not mirror them. There is no admin seed: admins self-register at `/admin/registro` and authority comes from `SUPERADMIN_EMAILS` (see below).

## Required environment

`.env.local` from `.env.example`:

- `DATABASE_URL` — pooled Postgres connection (Neon in prod; `postgresql://mono:mono@localhost:5433/homara` in local dev). Includes `?pgbouncer=true&connection_limit=1` against Neon's pooler.
- `DIRECT_URL` — non-pooled connection used by `prisma migrate` for schema operations.
- `NEXT_PUBLIC_SITE_URL` — used by `app/sitemap.ts`, `app/robots.ts`, and `metadataBase`. Defaults to `https://homara.es` when unset.
- `FIRECRAWL_API_KEY` — only needed for `scripts/scrape-products.ts` (one-shot SEO product scrape pipeline). Not required by the app.
- Auth secrets and SMTP config live in `.env.local`; see `src/lib/auth.ts` for the full Better Auth configuration.
- `SUPERADMIN_EMAILS` — comma-separated emails granted admin-panel access. Authority is config, not DB state: `isSuperadmin(email)` in `src/lib/auth`'s sibling `src/lib/superadmin.ts` is the single source of truth, checked in `requireAdmin()`, the `(panel)` layout, and the login/signup pre-flight. There is no `role` column or DB-persisted admin flag.
- `AMAZON_CREATOR_API_CREDENTIAL_ID` / `AMAZON_CREATOR_API_CREDENTIAL_SECRET` / `AMAZON_CREATOR_API_VERSION` — Amazon Creators API credentials (issued in Associates Central; needs an Associate account with ≥10 qualifying sales in the last 30 days). Version selects the auth flow (`v3.2` = Login with Amazon EU, `v2.2` = Cognito EU). `AMAZON_PARTNER_TAG` (default `ahorrhogar-21`) and `AMAZON_MARKETPLACE` (default `www.amazon.es`) are appended to every request; optional `AMAZON_TPS` (default 1) is the throttle rate.
- `CRON_SECRET` — bearer token guarding `/api/cron/amazon-sync`; Vercel Cron sends it as `Authorization: Bearer <CRON_SECRET>`.

The legacy `VITE_*`, `SUPABASE_*`, and `VITE_USE_REDIRECT_API` variables have all been removed — every offer link now flows through `/api/redirect?offerId=…&track=1`, and the DB is reached via Prisma (`src/lib/db.ts`).

## Architecture

**Next.js 15 (App Router) + React 19 + TypeScript + Prisma + Postgres (Neon)**, deployed on Vercel. Auth is Better Auth (see `src/lib/auth.ts`). Path alias: `@/*` → `src/*` (preserved from the Vite era).

### Layered data flow

```
src/app/**/page.tsx (RSC)  →  src/data/catalog/* (server-only, unstable_cache + tags)  →  Prisma → Postgres
                              src/data/editorial/* (static editorial source)

Mutations on /admin/(panel)/*: browser-side React Query → src/admin/services/* → Prisma (via server actions / API routes)
                               then  src/admin/_actions/cache.ts (server action) → revalidateTag('catalog' | 'articles' | 'ranking-signals')
Click tracking on /api/redirect: src/data/catalog/tracking.ts → Prisma click insert, then revalidateTag('ranking-signals')
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
- **`src/lib/db.ts`** — Prisma singleton (`db`). The single entry point for every DB read/write. Use `import { db } from "@/lib/db"` in server code; never instantiate `new PrismaClient()` elsewhere. Schema is `prisma/schema.prisma`.
- **`src/lib/auth.ts`** — Better Auth configuration (email/password). Server actions and route handlers call `auth.api.*` for sign-in/sign-up; sessions are managed via Better Auth cookies. Admin access is gated by `isSuperadmin(email)` (`src/lib/superadmin.ts`) against `SUPERADMIN_EMAILS` — not a DB role.
- **`src/admin/`** — admin panel. Auth is enforced **server-side**: the edge gate `src/proxy.ts` only checks for a session cookie, then the `(panel)` layout (Node runtime) validates the session and runs `isSuperadmin(session.user.email)`, redirecting to `/admin/login` or `/admin/denegado` before any RSC renders. The login form is a client component posting to a server action at `src/admin/_actions/auth.ts`. The browser-side admin services in `src/admin/services/*` invoke `src/admin/_actions/cache.ts` after mutations to push `revalidateTag()` through the public-site cache pipeline.
- **`src/app/api/redirect/route.ts`** — affiliate redirect endpoint. Validates the `offerId` UUID, runs `isAffiliateUrlAllowed`, optionally records a click via `trackClick` from `@/data/catalog/tracking`, and 302s to the merchant URL.
- **Amazon Creators API integration** — sources products from Amazon and keeps prices fresh:
  - `vendor/creatorsapi-nodejs-sdk/` — the official Apache-2.0 SDK, vendored as a prebuilt `dist` (`file:` dependency; Amazon ships it as a ZIP, not on npm). Upgrade per its README.
  - `src/infrastructure/amazon/` (server-only) — `client.ts` wraps the SDK (singleton, TPS throttle, 429/5xx backoff, 401 token-refresh); `operations.ts` exposes typed `getItems`/`searchItems`/`getVariations`; `resources.ts` has `FULL_RESOURCES` vs cheap `PRICE_RESOURCES`.
  - `src/domain/catalog/amazon-mapping.ts` — pure item→catalog mapper (specs/attributes/offer). The API returns **no ratings/reviews**, so `specs.rating` stays manual.
  - `src/admin/services/adminAmazonService.ts` + `/admin/amazon` — super-admin search/queue/approve dashboard. New products land in `amazon_scrape_candidates` and require human approval (brand + category); price/stock updates auto-apply.
  - `src/data/catalog/amazon-sync.ts` + `/api/cron/amazon-sync` — hourly cron refreshing Amazon `Offer` rows (price/stock/deal), bounded per run, re-checking ~50min out (under Amazon's 1h offer-cache TTL). Schedules in `vercel.json` (sub-daily crons need Vercel Pro). Amazon offers carry `externalSource="amazon"`, `externalId=ASIN`, unique on `(merchantId, externalId)`.
  - **TOS**: never alter the vended `detailPageURL`; the product page shows a "precio a fecha de…" disclaimer (`productPage.amazonPriceDisclaimer`) from `Offer.lastUpdated`.
- **`src/app/sitemap.ts`** — generates `/sitemap.xml` from a static route list plus a Prisma read of active categories and published `editorial_articles`. Cached for 1 hour.
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

`tsconfig.json` runs with `strict: false`, `strictNullChecks: false`, `noImplicitAny: false`, `noUnusedLocals: false`. The catalog data layer (`src/data/catalog/*`) and App Router pages were written defensively to be strict-clean, but the legacy admin code (`src/admin/services/*`, `src/app/admin/(panel)/*`) carries ~195 errors under full `strict: true`, mostly `'data' is possibly null` from the previous Supabase query patterns that survived the Prisma migration. Flipping to strict is a follow-up cleanup. New files should be written as if `strict: true` were on. ESLint disables `@typescript-eslint/no-unused-vars`, `@typescript-eslint/no-explicit-any`, `react/no-unescaped-entities`, and `@next/next/no-img-element` (the last for the 3 remaining `<img>` tags in two hardcoded blog guides).

### SEO + structured data expectations

When touching pages that ship to production:

- **Schema.org JSON-LD**: `Product` + `Offer` on product pages, `Article` + `BreadcrumbList` on blog pages, `ItemList` on rankings.
- **Interlinking** (`homara-brain/03-SEO/Interlinking.md`): every article links to its parent category and ≥2 related pieces; every category links to its subcategories and ≥3 cluster articles; every comparativa links to the individual product pages it compares. Anchor text must read naturally.
- **Canonicals**: filters/paginations canonical to the parent unless they have their own intent. Internal search pages: `noindex`.
- Performance budgets: LCP < 2.5s, CLS < 0.1, INP < 200ms. Use AVIF/WebP + lazy load for images.
- The sitemap is dynamic — adding a new editorial slug doesn't require manual sitemap edits, but it does require the `editorial_articles` row in Postgres (via Prisma) or the static guide page added under `src/app/blog/<slug>/page.tsx`.

## Working with Prisma migrations

- Migrations are append-only, timestamp-prefixed, generated by `prisma migrate dev <name>` and saved under `prisma/migrations/<timestamp>_<name>/migration.sql`. Never edit a merged migration — create a new one with a small, focused change.
- Schema is `prisma/schema.prisma`. Many editorial fields (product slug, long description, rating, review count, sku, ean, tags, material/dimensions/weight, etc.) live in `Product.specs` (JSONB), NOT as top-level columns. See `SPEC_META_KEYS` in `src/data/catalog/_helpers.ts:82` for the authoritative list; `_helpers.ts:414` is the slug-resolution rule (`specs.slug || slugify(name)`).
- To find a product by slug from a script: `db.product.findFirst({ where: { specs: { path: ["slug"], equals: slug } } })`. No native Prisma `upsert` because there's no unique index on slug — use find-then-create-or-update.
- Local dev DB: `postgresql://mono:mono@localhost:5433/homara` (per `.env.local`). On Vercel the build runs `prisma migrate deploy` before `next build`.
- Seed pipeline for products: `scripts/scrape-products.ts` (Firecrawl-driven) writes `scripts/data/products.ts`; `scripts/seed-products.ts` (`npm run db:seed-products`) reads that file and upserts brands → categories → products → product_images → merchants → offers → price_history.

## Conventions for new code (post-migration)

- Pure logic stays in `src/domain/` (no I/O, no React).
- Server data fetchers go in `src/data/catalog/*` — must `import "server-only"`, must use `unstable_cache` with a stable key + tags, must accept primitive args (slugs, ids) so cache keys serialize cleanly.
- Mutations on `/admin/*` go in `src/app/admin/_actions/<entity>.ts` as `"use server"` functions, call `revalidateTag(CATALOG_CACHE_TAG | …)` after writes.
- Pages default to RSC; only add `"use client"` when interactivity demands it. Lift state up so most of the tree stays server-rendered.
- Components that need browser APIs (`window`, `document`, `localStorage`, `navigator`) MUST start with `"use client"` and live in a clearly named client component file.
- Run `npm run build` before opening a PR — `next build` exercises both the type checker and the prerender path.
