# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Homara is

Homara is a Spanish-language **home & garden affiliate comparison site** (Amazon + Awin). It is **not a store** — the business model is *SEO content + comparator + affiliate clicks*. The cadena de valor is: `Tráfico SEO → Contenido editorial → Comparador / Ficha → Clic afiliado → Comisión`.

Strategic context — vision, OKRs, SEO architecture, monetization rules, brand voice — lives in the sibling Obsidian vault at `/Users/martiwarda/Projects/homara/homara-brain`. When a task touches strategy, content tone, category structure, or affiliate behavior, read the relevant note in `02-Estrategia/`, `03-SEO/`, `05-Producto/` or `06-Monetizacion/` before deciding. Always reflect changes in this codebase back to the corresponding note when the source of truth shifts.

User-facing copy is **Spanish**, voice is editorial/expert/close-to-the-reader (`01-Empresa/Tono-y-voz.md`): short sentences, concrete data (medidas, materiales, consumo, garantía), no empty superlatives, no aggressive CTAs.

## Hard rules (from `homara-brain/05-Producto/Reglas-de-cambio.md` and `06-Monetizacion/Proteccion-de-enlaces.md`)

1. **Never put raw affiliate links in content.** Every outbound click must go through the offer redirect path (logs click → applies current affiliate tag → redirects). See `src/server/nextjs/app/api/redirect/route.ts` and `offerService.trackClick`.
2. **Do not change existing affiliate URLs, merchant IDs, or product slugs** without a documented reason. Losing the URL = losing accumulated SEO authority and click history = losing revenue.
3. **Do not break existing UI/UX** without explicit need. Stability + SEO + conversion outrank refactor aesthetics.
4. **One intention = one URL.** No duplicate content, no parallel routes for the same query intent.
5. Sensitive changes need a backup + rollback plan. Architectural shifts need a `Plantilla-Decision` note in the brain vault.

## Commands

Package manager: **npm** in CI / Vercel; a `bun.lock` is present locally — pick one and stick with it for a given task. Vercel runs `npm install`.

- `npm run dev` — Vite dev server on `:8080` (HMR overlay disabled in `vite.config.ts`).
- `npm run build` — production bundle; output in `dist/`. Vercel deploy uses this.
- `npm run build:dev` — dev-mode build (keeps `lovable-tagger`).
- `npm run lint` — ESLint on the whole repo.
- `npm run test` — Vitest, single run, jsdom env. Pattern: `src/**/*.{test,spec}.{ts,tsx}`.
- `npm run test:watch` — Vitest in watch mode.
- Single test: `npx vitest run src/domain/catalog/home-ranking.test.ts` (or `-t "<name>"` to filter).
- Supabase (when CLI is linked): `supabase db push`, `supabase db reset --linked`. Migrations live in `supabase/migrations/` and are timestamp-prefixed; never edit a merged migration — add a new one.

## Required environment

`.env.local` from `.env.example`:

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — required client-side.
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` — also read by `src/integrations/supabase/client.ts` for non-Vite contexts.
- `VITE_USE_REDIRECT_API` — `true` makes offer links go through `/api/redirect?offerId=…` (preferred for Next.js / when redirect endpoint is live); default `false` keeps direct affiliate URLs.

## Architecture

This is a **Vite + React 18 + TypeScript SPA backed by Supabase**, structured to migrate to Next.js (App Router) with minimal churn. Path alias: `@/*` → `src/*`.

### Layered data flow

```
pages / components  →  services  →  data/sources (Supabase adapter)  →  Supabase
                       ↑
                    domain (pure logic, no I/O)
```

- **`src/domain/`** — pure business types and logic. No I/O, no React. Examples: `catalog/home-ranking.ts`, `catalog/offer-sync.ts`, `editorial/article-logic.ts`, `assistant/recommendation`. Has the only tests that don't need jsdom.
- **`src/data/sources/`** — data adapters implementing `CatalogDataSource` / `ExtendedCatalogDataSource` (`catalogSource.types.ts`). The active source is `supabaseCatalogSource.ts`. `mockCatalogSource.ts` is a **legacy alias that re-exports the Supabase source** — keep importing from `@/data/sources/mockCatalogSource` to preserve the contract; do not revive the actual mocks. `src/data/mock-data.ts` is historical reference only.
- **`src/services/`** — application services consumed by pages (`productService`, `categoryService`, `offerService`, `editorialService`, `analyticsService`, `editorialTrackingService`, `searchTrackingService`, `cookieConsentService`). UI must depend on services, never on data sources directly. Re-exported from `src/services/index.ts`.
- **`src/infrastructure/`** — cross-cutting: `analytics/`, `logging/`, `rate-limit/`, `security/` (sanitize, safe-redirect).
- **`src/server/`** — Next.js migration scaffolding. `contracts/catalogApi.ts` is the API response baseline; `nextjs/app/api/redirect/route.ts` is the canonical affiliate redirect endpoint; `nextjs/integration-notes.md` documents the target route mapping (`app/categoria/[slug]/[[...subSlug]]`, `app/producto/[slug]`, `app/api/catalog/*`, server actions).
- **`src/admin/`** — admin panel: `AdminAuthProvider` + `AdminGuard` gate every `/admin/*` route. Auth uses Supabase RLS plus the `is_admin` RPC (see `supabase/migrations/*admin*`). Admin routes are lazy-loaded.
- **`src/integrations/supabase/client.ts`** — cached singleton that resolves env from both `import.meta.env` and `process.env` (so the same client works in Vite, Vitest, and the Vercel API route).
- **`api/sitemap.xml.ts`** — Vercel serverless route that builds the sitemap from Supabase categories + editorial articles, exposed at `/sitemap.xml` via `vercel.json` rewrite.

### Routing (`src/App.tsx`, `react-router-dom`)

- Public: `/`, `/categoria/:slug[/:subSlug]`, `/producto/:slug`, `/buscar`, `/blog` (alias `/guias`), `/blog/:slug` for dynamic editorial, plus a long list of **explicit `/blog/*` routes** for hand-built guide pages in `src/pages/blog/`. Adding a new hand-built guide → add the lazy import and the explicit `<Route>` *before* the dynamic `/blog/:slug` fallback.
- Admin: `/admin/login`, `/admin/denegado`, then everything under `/admin/*` behind `<AdminGuard>` and `<AdminLayout>`.
- SPA fallback: `vercel.json` rewrites `/(.*)` → `/index.html`, with `/sitemap.xml` carved out to the API route.

### UI conventions

- **shadcn/ui** (config in `components.json`, base color `slate`, components under `src/components/ui/`). Use existing primitives before adding new dependencies.
- **Tailwind** with `tailwindcss-animate` and `@tailwindcss/typography`.
- **TanStack Query** for async state (`QueryClient` is created at app root in `App.tsx`).
- **Cookie consent gates analytics**: `useCookieConsent` controls whether `@vercel/analytics` and `@vercel/speed-insights` mount; `offerService.trackClick` and tracking services call `canUseAnalytics()` before persisting. Don't fire tracking outside that gate.

### TypeScript posture

`tsconfig.json` runs with `strictNullChecks: false`, `noImplicitAny: false`, `noUnusedLocals: false`. The codebase is permissive — don't introduce `any` casually, but don't expect strict-mode guarantees either. ESLint disables `@typescript-eslint/no-unused-vars`.

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

## Migration to Next.js

The project is staged to move to Next.js but is **still a Vite SPA today**. When adding a new feature:

- Put pure logic in `src/domain/` so it ports unchanged.
- Put Supabase reads behind a `services/*Service.ts` method, not in the page.
- For new server-only endpoints, prefer the `src/server/nextjs/app/api/*` shape so they're already in the target layout. The current Vercel `/api/sitemap.xml.ts` is the only live serverless route.
