# VOLTA Store — Current State

**Last reviewed:** 2026-08-25  
**Lifecycle:** PRODUCTION  
**Authoritative branch:** `main`  
**Production:** `https://www.voltastore.app`

## Release state

- `main` currently contains `STORE-INIT-003` at `cb1edd880fff3651674de0a27ff75c9d6413d4a7`.
- GitHub Actions for PR #56 passed 47 tests plus Next.js production build/TypeScript.
- Vercel rejected the post-merge production build because the account hit `build-rate-limit`.
- Latest confirmed Vercel production `READY` deployment remains on SHA `0cc1e9053f20c850611e8b5481a2949259a27c0a`.

**Important:** the landing/acquisition changes below are merged but are **not yet production-verified**. See `docs/initiatives/STORE-INIT-003-landing-conversion-acquisition-measurement.md` and `HANDOFF.md`.

## Production capabilities already verified before STORE-INIT-003

### Merchant activation and administration

- Google OAuth and magic-link authentication with explicit login/callback feedback.
- One owner = one Store is enforced in the database (`stores.owner_id` unique).
- Activation 2.0 uses a publish-first flow: **Negocio → Portada → Producto → Publicar**, then a first-share success state.
- Admin surfaces cover business data, storefront content, appearance, catalog, sharing, performance and plan/billing.
- Storefront media is optimized before upload; product deletion cleans linked/folder assets best-effort and failed image DB writes roll back uploaded objects.

### Catalog and storefront

- Products, categories and brands, multiple images, compare price, SKU, featured state and availability.
- Product options support `unavailable_values` for sold-out option values.
- Search, category/brand filters, URL-backed discovery, sorting, promotions and related-product behavior.
- Product detail UX is responsive and purchase controls remain in context on mobile/desktop.
- Checkout collects configurable customer/fulfillment/notes/custom fields and finishes with a structured WhatsApp handoff.
- Store slug history protects shared store links and redirects old slugs while preserving query parameters.
- Store/product metadata includes canonical, Open Graph and Twitter metadata.
- Product slugs are created once and are not regenerated on product rename in the current write path.

### Distribution and merchant measurement

- Share Engine v1 supports store/product sharing patterns including measurable links and QR-oriented distribution.
- Attribution accepts `src` / `utm_source` and `campaign` / `utm_campaign`, persists session attribution and records it on storefront events.
- Merchant commercial analytics exists at `/admin/rendimiento`: visits, product opens, add-to-cart, WhatsApp intent, conversion, top products, channel/source performance and opportunity prompts.
- These metrics represent storefront intent; they are not proof of a completed merchant sale.

### Commercial access and billing

Current implementation has three commercial levels:

- **Gratis:** 10 products and 1 image/product, with core storefront/cart/WhatsApp functionality.
- **VOLTA:** current code uses ARS 15,000/month for the first 3 cycles, then ARS 30,000/month.
- **VOLTA PRO:** current code uses ARS 70,000/month.

Exact prices are implementation/commercial configuration, not permanent Product OS doctrine.

Billing uses Mercado Pago subscriptions for the merchant SaaS, not shopper checkout. The system includes signed webhook/reconciliation logic, `/billing/return`, paid-plan welcome, cancellation/access-until behavior, internal billing operations, complimentary access and unit-economics fields. Free limits are also enforced in the database. Existing eligible early stores are protected by grandfathering.

### Landing and SEO currently in production

- Root landing uses the native premium preview direction introduced before `STORE-INIT-003`.
- Canonical host is `https://www.voltastore.app`; apex-to-www redirect is intentional.
- Root metadata, canonical, OG/Twitter, JSON-LD, robots and sitemap are present.
- Storefront metadata is dynamic per store/product.

## Merged in STORE-INIT-003 — awaiting production deploy

Once Vercel deploys the current main SHA, the landing will additionally have:

- local/owned NOVA demo photography under `public/landing/nova/` instead of Unsplash;
- simplified “Cómo funciona” and pricing copy;
- explicit real-store proof;
- a restrained mobile sticky CTA;
- first-party SaaS acquisition tracking through `signup_started`;
- server-managed `/api/analytics/saas` ingestion into the existing `saas_funnel_events` table while direct client DB access remains denied.

## Manual/operator validation history

Project history reports a real Mercado Pago subscription payment and subsequent cancellation were manually validated, including the first promotional cycle and provider status normalization. Treat this as **operator validation, not automated regression coverage**; billing changes still require provider-level verification.

## Known incomplete or requiring revalidation

1. **STORE-INIT-003 production release is blocked by Vercel build quota.** Deploy + desktop/mobile visual QA + controlled event observation remain open.
2. **After STORE-INIT-003 ships, the SaaS funnel will still stop at `signup_started`.** Clean joins for `signup_completed`, `store_created`, `first_product`, `published`, `first_share`, checkout and paid-plan events are the next measurement step.
3. **Onboarding bootstrap is race-safe around duplicate-store creation but not atomic.** Profile/store/scaffold creation is still multi-step and repairable/idempotent rather than one transaction.
4. **Public storefront caching strategy remains implicit/dynamic.** Optimize only when real scale/performance evidence justifies it.
5. **Search Console revalidation status is external/unknown.** Canonical/indexability hardening shipped, but current Google validation state was not verified in this review.
6. **Global font loading remains broad.** Four font families are loaded from the root layout; performance impact should be measured before changing it.

## Next recommended direction

1. Finish `STORE-INIT-003` production deployment and verify visual/event behavior; do not claim shipped before that.
2. Extend trustworthy SaaS measurement through signup → store → first product → publish → first share, keeping **Time to First Share < 10 minutes** as the current activation target.
3. Put real merchants through the full flow and prioritize the first 10 customer learnings over speculative feature breadth.
4. Add contextual feature discovery and usage-based upgrade prompts without dark patterns.
5. Use measured drop-off to decide whether Activation 2.x needs another UX pass; do not guess.
6. Keep PRO focused on better decisions/growth intelligence once enough merchant data exists.
