# VOLTA Store — Current State

**Last reviewed:** 2026-08-26  
**Lifecycle:** PRODUCTION  
**Authoritative branch:** `main`  
**Production:** `https://www.voltastore.app`

## Release state

`STORE-INIT-004 — Activation Funnel & Time to First Share` is **SHIPPED**.

Verified production evidence:

- Runtime merge `2f7a02ef0641d02f176da316b2aa1d4803620a02` is live in Vercel deployment `dpl_E9JPaVfTwk1pS1ssU8k9ckYBHf4F`, `READY` on both production domains.
- Production build includes `/api/analytics/saas` and protected `/internal/funnel`.
- Anonymous access to `/internal/funnel` resolves to the login surface rather than exposing internal funnel data.
- Supabase production has the `activation_funnel_milestones` migration: `user_id`/`store_id`, expanded event constraint, milestone dedupe indexes and DB triggers for first product / first publish.
- Post-migration Security Advisor returned only the pre-existing `Leaked Password Protection Disabled` warning; no new advisory was introduced.
- No error/fatal runtime logs were observed on the verified production deployment.

The landing direction remains frozen pending conversion evidence or a genuine positioning change.

## What is shipped now

### Merchant activation and administration

- Google OAuth and magic-link authentication with explicit login/callback feedback.
- One owner = one Store is enforced in the database (`stores.owner_id` unique).
- Activation 2.0 uses a publish-first flow: **Negocio → Portada → Producto → Publicar**, then distribution/share.
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
- Product slugs are created once and are not regenerated on ordinary product rename.

### Distribution and merchant measurement

- Share Engine v1 supports store/product sharing, WhatsApp, copy/native share, measurable links and QR-oriented distribution.
- Attribution accepts `src` / `utm_source` and `campaign` / `utm_campaign`, persists session attribution and records it on storefront events.
- Merchant commercial analytics at `/admin/rendimiento` covers visits, product opens, add-to-cart, WhatsApp intent, conversion, top products, channel/source performance and opportunity prompts.
- These metrics represent storefront intent; they are not proof of a completed merchant sale.

### Landing and acquisition measurement

- The current NOVA demo uses curated remote product photography with an embedded SVG fallback; local placeholders remain in-repo. Owned local NOVA photography is still the preferred long-term media state.
- “Cómo funciona” and pricing use merchant-facing language; a real-store proof block avoids invented testimonials/counts/ratings.
- Mobile has a restrained sticky acquisition CTA after the hero and away from pricing/final CTA visibility.
- Landing tracking records view, CTA/store-demo/pricing/plan interactions and `signup_started`.
- Browser acquisition context includes first-party session/source/campaign plus device/viewport/CTA metadata and is posted to the bounded server endpoint.

### Activation funnel and Time to First Share

VOLTA now measures prospectively:

`landing_view → signup_started → signup_completed → store_created → first_product → published → first_share`

Contracts:

- `signup_completed` is first successful signup/auth completion for a new user, not every login.
- `store_created` requires a Store row to be genuinely created.
- `first_product` and `published` are durable DB-backed milestones with dedupe.
- `first_share` means the authenticated merchant deliberately distributed/copied/opened a share action from VOLTA; it does not mean recipient delivery or sale.
- `user_id` and `store_id` are derived server-side, never trusted from browser payloads.
- Anonymous session/source/campaign continuity is carried into auth with bounded first-party cookies. Cross-browser loss is surfaced as lower join coverage instead of being guessed.

`/internal/funnel` is protected by the existing VOLTA internal-admin boundary and supports 7 / 30 / 90-day views with stage conversion, median Time to First Share, store→share time, join coverage, source and device.

Existing pre-INIT-004 acquisition rows remain intact. Activation milestones are intentionally prospective; old merchants were not backfilled into a fake cohort.

### Commercial access and billing

Current implementation has three commercial levels:

- **Gratis:** 10 products and 1 image/product, with core storefront/cart/WhatsApp functionality.
- **VOLTA:** current code uses ARS 15,000/month for the first 3 cycles, then ARS 30,000/month.
- **VOLTA PRO:** current code uses ARS 70,000/month.

Exact prices are implementation/commercial configuration, not permanent Product OS doctrine.

Billing uses Mercado Pago subscriptions for merchant SaaS billing, not shopper checkout. It includes signed webhook/reconciliation logic, `/billing/return`, paid-plan welcome, cancellation/access-until behavior, internal operations, complimentary access and unit-economics fields. Free limits are also DB-enforced. Existing eligible early stores are grandfathered.

### SEO

- Canonical host is `https://www.voltastore.app`; apex-to-www redirect is intentional.
- Root metadata, canonical, OG/Twitter, JSON-LD, robots and sitemap are present.
- Storefront metadata is dynamic per store/product.

## Manual/operator validation history

Project history reports a real Mercado Pago subscription payment and subsequent cancellation were manually validated, including the first promotional cycle and provider status normalization. Treat this as **operator validation, not automated regression coverage**; billing changes still require provider-level verification.

## Known incomplete or requiring revalidation

1. **Activation data needs real new merchants.** STORE-INIT-004 establishes trustworthy measurement; it does not manufacture a historical cohort or prove where current users drop yet.
2. **Checkout / paid-plan transitions are not yet part of the same acquisition-to-revenue funnel contract.** Add them only when their identity/idempotency semantics are equally clear.
3. **Onboarding bootstrap is race-safe around duplicate-store creation but not atomic.** Profile/store/scaffold creation remains multi-step and repairable/idempotent rather than one transaction.
4. **Public storefront caching strategy remains implicit/dynamic.** Optimize only when scale/performance evidence justifies it.
5. **Search Console revalidation status is external/unknown.** Canonical/indexability hardening shipped, but current Google validation state is not verified here.
6. **Global font loading remains broad.** Four font families load from the root layout; measure before changing it.
7. **Acquisition endpoint abuse/rate characteristics are not yet measured.** Payloads are schema-bounded and same-origin checked when Origin is present; strengthen only if real traffic requires it.

## Next recommended direction

1. Put real merchants through the full flow and prioritize the first 10 customer learnings over speculative feature breadth.
2. Use `/internal/funnel` and real support/session observation to identify the largest activation drop-off before changing Activation 2.x.
3. Add contextual feature discovery after paid-plan unlocks.
4. Add usage-based upgrade psychology without dark patterns.
5. Keep PRO focused on better decisions/growth intelligence once enough merchant data exists.
