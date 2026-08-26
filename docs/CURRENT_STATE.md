# VOLTA Store — Current State

**Last reviewed:** 2026-08-25  
**Lifecycle:** PRODUCTION  
**Authoritative branch:** `main`  
**Production:** `https://www.voltastore.app`

## Release state

`STORE-INIT-003 — Landing Conversion & Acquisition Measurement` is **SHIPPED**.

Verified production evidence:

- Vercel deployment `dpl_8yPgErMfNb3sgVQgXFP7sasipTVg` is `READY` on SHA `6ec32fe775c37b7f70cfabfdd5d1608d0fcb21c3`, a descendant containing the full STORE-INIT-003 runtime.
- `www.voltastore.app` serves the new landing markup and repository-local NOVA assets.
- `/landing/nova/hero-editorial.jpg` and `/landing/nova/essential-set.jpg` are served as valid JPEGs.
- Production browsers have written real `landing_view`, `landing_pricing_view` and `landing_real_store_click` rows to `saas_funnel_events` across desktop/tablet/mobile viewports.
- `/api/analytics/saas` returns accepted responses and no error/fatal runtime logs were observed for the verified production deployment.
- PR #57 subsequently merged a non-user-facing middleware hardening that skips pointless Supabase auth refreshes for anonymous traffic while preserving protected-route behavior. Product correctness did not depend on this follow-up.

The landing direction is now frozen pending conversion evidence or a genuine positioning change.

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

### Landing and acquisition measurement

- The NOVA demo keeps repository-local placeholder JPEGs, while the current runtime recovery layer replaces them with curated remote product photography and an embedded SVG fallback so a media failure cannot leave broken-image UI. Owned local NOVA photography remains the preferred long-term state.
- “Cómo funciona” and pricing use merchant-facing language.
- A real-store proof block links to a live storefront without invented testimonials, counts or ratings.
- Mobile has a restrained sticky acquisition CTA after the hero and away from pricing/final CTA visibility.
- First-party SaaS measurement records landing view, primary/store-demo/pricing/plan interactions and `signup_started`.
- Events preserve session id, source/campaign, device/viewport, CTA location, plan and path.
- The browser does not insert directly into `saas_funnel_events`; `/api/analytics/saas` validates the payload and performs the privileged server-side insert.

### Commercial access and billing

Current implementation has three commercial levels:

- **Gratis:** 10 products and 1 image/product, with core storefront/cart/WhatsApp functionality.
- **VOLTA:** current code uses ARS 15,000/month for the first 3 cycles, then ARS 30,000/month.
- **VOLTA PRO:** current code uses ARS 70,000/month.

Exact prices are implementation/commercial configuration, not permanent Product OS doctrine.

Billing uses Mercado Pago subscriptions for the merchant SaaS, not shopper checkout. The system includes signed webhook/reconciliation logic, `/billing/return`, paid-plan welcome, cancellation/access-until behavior, internal billing operations, complimentary access and unit-economics fields. Free limits are also enforced in the database. Existing eligible early stores are protected by grandfathering.

### SEO

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
6. **Acquisition endpoint abuse/rate characteristics are not yet measured.** Payloads are schema-bounded and same-origin checked when Origin is present; add stronger anti-abuse only if real traffic requires it.

## Next recommended direction

1. Extend trustworthy SaaS measurement through signup → store → first product → publish → first share, keeping **Time to First Share < 10 minutes** as the current activation target.
2. Put real merchants through the full flow and prioritize the first 10 customer learnings over speculative feature breadth.
3. Add contextual feature discovery and usage-based upgrade prompts without dark patterns.
4. Use measured drop-off to decide whether Activation 2.x needs another UX pass; do not guess.
5. Keep PRO focused on better decisions/growth intelligence once enough merchant data exists.
