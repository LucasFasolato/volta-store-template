# STORE-INIT-003 — Landing Conversion & Acquisition Measurement

- **Status:** SHIPPED
- **Priority:** P0
- **Branch:** `feat/store-init-003-landing-acquisition`
- **Started:** 2026-08-25
- **Shipped:** 2026-08-25

## Outcome

Close the current landing direction instead of redesigning it again, improve commercial clarity and begin trustworthy measurement of acquisition into signup.

## Delivered

- Removed external Unsplash dependency from the NOVA demo and moved critical demo photography to owned/local assets under `public/landing/nova/`.
- Simplified “Cómo funciona” and pricing language for non-technical merchants.
- Added explicit real-store proof without invented testimonials, customer counts or ratings.
- Added a restrained mobile sticky CTA that appears after the hero and hides around pricing/final CTA.
- Wired the existing `saas_funnel_events` schema through a server-managed ingestion endpoint; direct client DB access remains denied.
- Tracks landing view, primary/store-demo/pricing/plan interactions and signup start while preserving source/campaign attribution in-session.
- Preserved the existing structural landing direction; this initiative is polish + measurement, not Landing 4.0.

## Verification required before merge

- GitHub tests/build and Next.js TypeScript build green.
- Vercel preview render checked on desktop/mobile.
- Production deployment must resolve to the merge SHA before this initiative is considered shipped.
- At least one controlled production event should be observed in `saas_funnel_events` after release.

## Follow-up

Do not keep redesigning the landing without evidence. Next work should extend measurement cleanly through signup/store/first-product/publish/first-share and use real merchant sessions to decide where Activation 2.x needs improvement.
