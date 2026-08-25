# STORE-INIT-003 — Landing Conversion & Acquisition Measurement

- **Status:** SHIPPED
- **Priority:** P0
- **Started:** 2026-08-25
- **Merged:** 2026-08-25
- **Production verified:** 2026-08-25
- **Runtime merge:** `cb1edd880fff3651674de0a27ff75c9d6413d4a7`
- **Verified production deployment:** `dpl_8yPgErMfNb3sgVQgXFP7sasipTVg`
- **Verified production SHA:** `6ec32fe775c37b7f70cfabfdd5d1608d0fcb21c3`

## Outcome

Closed the current landing direction instead of redesigning it again, improved commercial clarity and started trustworthy first-party acquisition measurement into signup.

## Delivered

- Local NOVA demo photography under `public/landing/nova/`; core demo media no longer depends on Unsplash.
- Merchant-facing “Cómo funciona” and pricing language.
- Explicit real-store proof without invented testimonials, customer counts or ratings.
- Restrained mobile sticky CTA after the hero and away from pricing/final CTA visibility.
- Server-managed `/api/analytics/saas` ingestion into `saas_funnel_events`; direct client DB access remains denied.
- Tracking for landing view, primary/store-demo/pricing/plan interactions and `signup_started`, preserving source/campaign, device/viewport and CTA context.
- Landing structure frozen after this pass unless evidence or positioning changes justify reopening it.

## Verification

- PR #56 merged after rebasing over concurrent README work.
- GitHub Actions: 47 tests passed; Next.js production build and TypeScript passed.
- Vercel production deployment `dpl_8yPgErMfNb3sgVQgXFP7sasipTVg` is `READY` on a descendant containing the full initiative runtime.
- `www.voltastore.app` serves the new landing markup and local NOVA paths.
- Both NOVA assets returned valid JPEG/JFIF responses in production.
- Real browser traffic produced `landing_view`, `landing_pricing_view` and `landing_real_store_click` rows in `saas_funnel_events` across desktop/tablet/mobile viewports.
- `/api/analytics/saas` returned accepted responses and no error/fatal production logs were observed.
- A follow-up PR #57 removed expected anonymous Supabase auth-refresh warning noise without changing protected-route security behavior; this was observability hardening, not a blocker to the initiative outcome.

## Follow-up

Next work should extend measurement through signup/store/first-product/publish/first-share, then use real merchant sessions to decide where Activation 2.x needs improvement. Do not keep redesigning the landing without evidence.
