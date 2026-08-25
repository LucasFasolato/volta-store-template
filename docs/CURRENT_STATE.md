# VOLTA Store — Current State

**Last reviewed:** 2026-08-25  
**Lifecycle:** PRODUCTION  
**Authoritative branch:** `main`  
**Production:** `https://www.voltastore.app`

## What is shipped now

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

### Acquisition measurement

`STORE-INIT-003` closes the approved Landing Conversion Polish 1.0 and wires the previously prepared `saas_funnel_events` table through a server-managed ingestion endpoint.

The acquisition layer now records:

- `landing_view`;
- hero/header/final primary CTA clicks;
- real-store proof clicks;
- pricing-section view;
- Gratis / VOLTA / PRO CTA clicks;
- `signup_started` when the login/signup surface is reached.

Events include a session id, source/campaign when present, device/viewport, CTA location, plan and path. Direct client DB inserts remain denied; the browser sends a bounded payload to `/api/analytics/saas`, which performs the privileged insert server-side.

### Commercial access and billing

Current implementation has three commercial levels:

- **Gratis:** 10 products and 1 image/product, with core storefront/cart/WhatsApp functionality.
- **VOLTA:** current code uses ARS 15,000/month for the first 3 cycles, then ARS 30,000/month.
- **VOLTA PRO:** current code uses ARS 70,000/month.

Exact prices are implementation/commercial configuration, not permanent Product OS doctrine.

Billing uses Mercado Pago subscriptions for the merchant SaaS, not shopper checkout. The system includes signed webhook/reconciliation logic, `/billing/return`, paid-plan welcome, cancellation/access-until behavior, internal billing operations, complimentary access and unit-economics fields. Free limits are also enforced in the database. Existing eligible early stores are protected by grandfathering.

### Landing and SEO

- Root landing is production and structurally frozen after the current conversion polish; further redesign should require evidence.
- Critical NOVA demo photography is local/owned under `public/landing/nova/`; the landing no longer depends on Unsplash for its demo media.
- Pricing copy is merchant-facing and preserves the semantic ladder: Gratis = empezar, VOLTA = vender, PRO = entender/crecer.
- A real-store proof block links to a published storefront without invented testimonials, counts or ratings.
- Mobile has a restrained sticky acquisition CTA after the hero and outside pricing/final CTA visibility.
- Canonical host is `https://www.voltastore.app`; apex-to-www redirect is intentional.
- Root metadata, canonical, OG/Twitter, JSON-LD, robots and sitemap are present.
- Storefront metadata is dynamic per store/product.

## Manual/operator validation history

Project history reports a real Mercado Pago subscription payment and subsequent cancellation were manually validated, including the first promotional cycle and provider status normalization. Treat this as **operator validation, not automated regression coverage**; billing changes still require provider-level verification.

## Known incomplete or requiring revalidation

1. **The SaaS funnel currently stops at `signup_started`.** Clean joins for `signup_completed`, `store_created`, `first_product`, `published`, `first_share`, checkout and paid-plan events are the next measurement step.
2. **Onboarding bootstrap is race-safe around duplicate-store creation but not atomic.** Profile/store/scaffold creation is still multi-step and repairable/idempotent rather than one transaction.
3. **Public storefront caching strategy remains implicit/dynamic.** Optimize only when real scale/performance evidence justifies it.
4. **Search Console revalidation status is external/unknown.** Canonical/indexability hardening shipped, but current Google validation state was not verified in this review.
5. **Global font loading remains broad.** Four font families are loaded from the root layout; performance impact should be measured before changing it.
6. **Acquisition endpoint abuse/rate characteristics are not yet measured.** Payloads are schema-bounded and same-origin checked when Origin is present, but add stronger anti-abuse only if traffic proves necessary.

## Next recommended direction

1. Extend trustworthy SaaS measurement through signup → store → first product → publish → first share, keeping **Time to First Share < 10 minutes** as the current activation target.
2. Put real merchants through the full flow and prioritize the first 10 customer learnings over speculative feature breadth.
3. Add contextual feature discovery and usage-based upgrade prompts without dark patterns.
4. Use measured drop-off to decide whether Activation 2.x needs another UX pass; do not guess.
5. Keep PRO focused on better decisions/growth intelligence once enough merchant data exists.

## Last initiative

`STORE-INIT-003 — Landing Conversion & Acquisition Measurement` completes the approved landing polish and begins first-party SaaS funnel measurement without reopening the visual direction.
