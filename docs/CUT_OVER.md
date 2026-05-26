# Cut-over checklist — Supabase → Neon + Better Auth

This document tracks the production switchover for the
`feat/neon-better-auth` branch. Run through it once Neon, Vercel Blob,
and Resend secrets are ready.

## Pre-flight (before merging to `dev`)

- [ ] `npm run lint && npm run typecheck && npm test && npm run build` all green locally
- [ ] Local dev (`npm run dev`) on the feature branch:
  - [ ] `/admin/login` → sign in as `ahorrhogar@gmail.com` (run `npm run db:seed-admin` first if needed)
  - [ ] `/admin` Dashboard renders without errors
  - [ ] Create a brand, a category, a merchant, a product, an offer
  - [ ] Upload a brand logo (requires `BLOB_READ_WRITE_TOKEN`)
  - [ ] Sign out — verify redirect back to `/admin/login`
  - [ ] Hit `/api/redirect?offerId=<offer-uuid>&track=1` → 302 + `Click` row appears in DB
  - [ ] `/sitemap.xml` lists active categories + published articles
  - [ ] `/buscar?q=<term>` returns results

## Provisioning

| Resource | Environment value |
| --- | --- |
| Neon Postgres (prod branch) | `DATABASE_URL` (pooled), `DIRECT_URL` (unpooled) |
| Better Auth secret | `BETTER_AUTH_SECRET` (generate `openssl rand -base64 32`) |
| Better Auth base URL | `BETTER_AUTH_URL` = `https://homara.es` |
| Vercel Blob | `BLOB_READ_WRITE_TOKEN` from Vercel dashboard |
| Resend | `RESEND_API_KEY` (optional; auth flows are dormant) |
| Public site URL | `NEXT_PUBLIC_SITE_URL` = `https://homara.es` |
| Initial admin | `ADMIN_INITIAL_EMAIL`, `ADMIN_INITIAL_PASSWORD` (only used by seed script) |

Set these on the Vercel project (Production + Preview scopes).

## Apply schema + seed

Against the **prod** Neon branch:

```bash
DATABASE_URL=… DIRECT_URL=… npx prisma migrate deploy
DATABASE_URL=… DIRECT_URL=… ADMIN_INITIAL_EMAIL=… ADMIN_INITIAL_PASSWORD=… \
  tsx scripts/seed-admin.ts
```

Tip: do this from a Vercel deploy hook or by running locally with prod
env vars temporarily exported.

## Deploy + smoke test (preview)

1. Push the branch — Vercel builds a preview deploy.
2. Verify in preview:
   - [ ] Homepage `/` renders (catalog likely empty until you re-seed content)
   - [ ] `/sitemap.xml` returns 200
   - [ ] `/api/redirect?offerId=<uuid>&track=1` → 302 (need an offer row first)
   - [ ] `/admin/login` works against the prod Neon admin user
   - [ ] Image upload via admin panel writes to Vercel Blob

## Promote to prod

1. Merge `feat/neon-better-auth` → `dev` → `main`.
2. Vercel deploys main. Watch logs.
3. After 24h of clean operation: keep Supabase project running (read-only) for the
   14-day rollback window.

## Rollback (if something breaks)

The easiest rollback is git-based:

```bash
git checkout main
git revert <merge-commit-sha>
git push origin main
```

Then on Vercel, re-set the old `NEXT_PUBLIC_SUPABASE_URL` /
`NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars (saved in your password manager).
The previous Supabase project must still be alive — keep it running for
**14 days** after cut-over.

## After 14 days of stability

- [ ] Pause/decommission the Supabase project
- [ ] Delete `supabase/` directory in this repo (kept until now for reference)
- [ ] Delete the saved Supabase env vars from your vault

## Known gaps to land later

- `editorial_static_source.ts` is not auto-seeded into the `editorial_articles`
  table. Re-add articles via the admin panel or write a one-off
  `scripts/seed-editorial.ts` before launch if you want them in the DB.
- The catalog will be empty after cut-over. Re-import via the
  `/admin/imports` CSV flow or write per-cluster seed scripts the way the
  legacy `scripts/seed_*_supabase.mjs` did. Slugs are deterministic from
  product names, so HARD RULE #2 is preserved as long as you re-use the
  same product names.
- `getDashboardMetrics()` returns empty arrays for the metrics that depend
  on per-product view tracking (we don't track product views yet — only
  clicks and editorial article views). Add product-view tracking later if
  needed.
