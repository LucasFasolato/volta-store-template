# STORE-INIT-003 — Landing Conversion & Acquisition Measurement

- **Status:** MERGED / PRODUCTION DEPLOY BLOCKED
- **Priority:** P0
- **Main SHA:** `cb1edd880fff3651674de0a27ff75c9d6413d4a7`
- **Started:** 2026-08-25
- **Merged:** 2026-08-25

## Outcome

Close the current landing direction instead of redesigning it again, improve commercial clarity and begin trustworthy measurement of acquisition into signup.

## Merged to main

- Local/owned NOVA demo photography under `public/landing/nova/` replaces the landing's Unsplash dependency.
- “Cómo funciona” and pricing language are simplified for non-technical merchants.
- Explicit real-store proof is added without invented testimonials, customer counts or ratings.
- A restrained mobile sticky CTA appears after the hero and hides around pricing/final CTA.
- The existing `saas_funnel_events` schema is wired through a server-managed ingestion endpoint; direct client DB access remains denied.
- Landing view, primary/store-demo/pricing/plan interactions and signup start preserve source/campaign attribution in-session.
- The landing structure remains frozen; this is polish + measurement, not another redesign.

## Verified

- PR #56 merged to `main` after rebasing over concurrent README work.
- GitHub Actions: 47 tests passed.
- Next.js production build and TypeScript completed successfully; `/api/analytics/saas` is present in the route manifest.
- Diff was isolated from unrelated concurrent work.

## Blocker

Vercel rejected the post-merge production build because the account hit `build-rate-limit`. Latest confirmed production `READY` deployment is still on `main` SHA `0cc1e9053f20c850611e8b5481a2949259a27c0a`.

Therefore this initiative is **not SHIPPED yet**, even though the runtime code is merged.

## Close when

1. Vercel accepts one production build for `cb1edd880fff3651674de0a27ff75c9d6413d4a7` (or a descendant containing this change).
2. Deployment is `READY` and `www.voltastore.app` resolves to that SHA.
3. Landing is visually checked on desktop/mobile, especially NOVA media, pricing, proof block and sticky CTA.
4. At least one controlled landing event is observed in `saas_funnel_events` and no new runtime errors appear.
5. Move this file to `docs/initiatives/completed/` and clear `docs/HANDOFF.md`.
