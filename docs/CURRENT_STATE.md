# VOLTA Store — Current State

**Last reviewed:** 2026-08-25  
**Lifecycle:** PRODUCTION  
**Authoritative branch:** `main`  
**Production:** `https://www.voltastore.app`

## Verified production baseline

- This reconciliation review started from `main` at `bc1477829bf2f6f8e83bbb1e23756817eda57327`; Vercel production was `READY` on that baseline.
- `STORE-INIT-002` changes Product OS documentation and reconciles already-applied migration files only; it does not change application runtime behavior.
- Supabase production schema was inspected during this review; it includes catalog, analytics, billing, slug-history and commercial-plan migrations through 2026-08-25.
- No unresolved Product OS adoption handoff remains. `STORE-INIT-001` is shipped and archived.

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

### Distribution and measurement

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

### Landing and SEO

- Root landing is production and has been redesigned around native premium product previews.
- The earlier corrupt landing WebP incident is resolved in the current runtime; the final mitigation moved critical preview UI away from fragile raster-only mockups.
- Canonical host is `https://www.voltastore.app`; apex-to-www redirect is intentional.
- Root metadata, canonical, OG/Twitter, JSON-LD, robots and sitemap are present.
- Storefront metadata is dynamic per store/product.

## Manual/operator validation history

Project history reports a real Mercado Pago subscription payment and subsequent cancellation were manually validated, including the first promotional cycle and provider status normalization. Treat this as **operator validation, not automated regression coverage**; billing changes still require provider-level verification.

## Known incomplete or requiring revalidation

1. **Landing Conversion Polish 1.0 is approved but not shipped.** The current landing still uses external Unsplash photography; the approved next pass is owned/local NOVA media, pricing-copy polish, real-store proof, a mobile conversion CTA and funnel measurement without another structural redesign.
2. **SaaS acquisition funnel instrumentation is only partially delivered.** Production Supabase already contains `saas_funnel_events`, but current application code has no writer/tracker for it. The schema migrations are reconciled into Git by `STORE-INIT-002`; wiring events remains future work.
3. **Onboarding bootstrap is race-safe around duplicate-store creation but not atomic.** Profile/store/scaffold creation is still multi-step and repairable/idempotent rather than one transaction.
4. **Public storefront caching strategy remains implicit/dynamic.** Optimize only when real scale/performance evidence justifies it.
5. **Search Console revalidation status is external/unknown.** Canonical/indexability hardening shipped, but current Google validation state was not verified in this review.
6. **Global font loading remains broad.** Four font families are loaded from the root layout; performance impact should be measured before changing it.

## Next recommended direction

1. Finish the approved landing conversion polish **without another redesign** and wire the existing SaaS funnel schema.
2. Measure landing → signup → activation → first share; keep **Time to First Share < 10 minutes** as the activation target until real data justifies changing it.
3. Add contextual feature discovery and usage-based upgrade prompts without dark patterns.
4. Put real merchants through the full flow and prioritize the first 10 customer learnings over speculative feature breadth.
5. Keep PRO focused on better decisions/growth intelligence once enough merchant data exists.

## Last operating review

`STORE-INIT-002` performs the deep truth reconciliation that the initial VOLTA OS adoption intentionally did not have enough conversation/production evidence to complete.
