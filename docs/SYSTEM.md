# VOLTA Store — System

## System model

Production SaaS built with Next.js App Router, React/TypeScript and Supabase. Server components/actions own authenticated data/business rules; client components handle editing, storefront interaction, cart state and selected analytics/share interactions.

## Stack

- Next.js 16.3.1 / App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/Radix primitives
- Supabase Auth
- Supabase Postgres with RLS
- Supabase Storage
- Zustand browser cart
- Vercel
- Mercado Pago subscriptions for merchant SaaS billing
- WhatsApp shopper-commerce handoff

## Main entrypoints

- `src/app/page.tsx` — marketing/commercial landing.
- `src/app/login/page.tsx` — merchant login.
- `src/app/auth/callback/route.ts` — OAuth/magic-link callback.
- `src/app/onboarding/*` — onboarding entry/completion.
- `src/app/admin/*` — merchant admin.
- `src/app/admin/compartir/page.tsx` — Share Engine workspace.
- `src/app/admin/rendimiento/page.tsx` — merchant commercial analytics.
- `src/app/admin/plan/page.tsx` — commercial access/billing.
- `src/app/(public)/tienda/[slug]/page.tsx` — public storefront and historical-slug redirect.
- `src/app/billing/return/page.tsx` — provider return/recovery/welcome.
- `src/app/internal/billing/page.tsx` — protected VOLTA internal billing console.
- `src/app/api/billing/mercado-pago/webhook/route.ts` — Mercado Pago webhook.
- `src/proxy.ts` — request proxy/middleware entry.

## Major modules

### Auth and store context

`src/lib/server/store-context.ts` centralizes authenticated-user/store resolution. Auth callback/login UX maps expired links, provider failures, rate limits and other failures to merchant-facing states.

### Bootstrap and Activation 2.0

`src/lib/actions/onboarding.ts` ensures profile/store/scaffold records and relies on the DB one-owner/one-store invariant. Duplicate-store races are handled defensively, but profile/store/theme/layout/content creation remains a multi-step bootstrap.

Activation 2.0 is the publish-first product flow **Negocio → Portada → Producto → Publicar**, then first-share success.

### Catalog and storefront

Catalog is tenant-scoped and includes products, categories, brands, images, options, availability, discovery/filtering and commercial presentation fields. Composite tenant foreign keys protect category/brand relations at DB level.

The public route resolves store slug history before `notFound`, preserving shared links. Product slugs are generated on create and remain stable on ordinary product rename/update.

### Media

`store-assets` is intentionally a **public-read storefront media bucket**. Authenticated mutations are owner-folder scoped. This bucket is not a private document store.

Images are optimized client-side/server-validated. Product deletion enumerates linked/folder paths and removes Storage objects best-effort; upload-to-DB failure paths clean the newly uploaded object.

### Cart and checkout

Zustand persists shopper cart state locally. Checkout asks only the merchant-configured fields and produces a structured WhatsApp message. No server-side “paid shopper order” should be inferred from a WhatsApp handoff event.

### Sharing, attribution and durable links

Sharing helpers create store/product URLs and measurable distribution links. Storefront attribution parses `src`/`utm_source` and `campaign`/`utm_campaign`, persists session attribution and writes source/campaign on `store_events`.

Store slug changes are protected by `store_slug_history`; old links redirect to the canonical current slug while keeping query parameters/deep-link attribution.

### Merchant analytics

`store_events` supports:
- `store_view`
- `product_view`
- `add_to_cart`
- `cart_open`
- `whatsapp_checkout`

`/admin/rendimiento` aggregates visits, product interest, cart intent, WhatsApp intent, conversion, sources/campaigns, top products and simple commercial opportunities. These are intent signals, not completed-sale accounting.

### SaaS acquisition funnel

Production Supabase contains `saas_funnel_events` for VOLTA's own acquisition funnel with no direct client privileges. The Git migration history is reconciled in `20260825030110_saas_funnel_events.sql` and `20260825030156_saas_funnel_events_explicit_deny.sql`.

**Current application code does not yet write these events.** Do not describe SaaS funnel tracking as shipped until a server-managed ingestion/tracking path exists and is verified.

### Billing and commercial access

Commercial access uses `free | volta | pro` plan codes plus grandfathering and server-managed complimentary overrides. Free product/image limits are enforced by private DB trigger functions, not UI only.

Mercado Pago is used only for VOLTA merchant subscription billing. Billing has webhook/reconciliation, idempotency, cancellation, return recovery, paid welcome, internal operations and unit-economics fields. Complimentary access is fail-closed around provider cancellation when an active paid subscription exists.

## Current data model

Core application:
- `profiles`
- `stores`
- `store_theme`
- `store_layout`
- `store_content`
- `categories`
- `brands`
- `products`
- `product_images`
- `product_options`

Measurement:
- `store_events`
- `saas_funnel_events` (schema present; app writer pending)

Commercial:
- `billing_subscriptions`
- `billing_payments`
- `billing_access_overrides`

Durable links:
- `store_slug_history`

## Verified data/security invariants

- `stores.owner_id` is unique in production.
- Store theme/layout/content are one-per-store.
- Product category/brand relations are constrained to the same tenant.
- RLS is enabled on application tables.
- `saas_funnel_events` denies direct `anon`/`authenticated` access.
- Service-role/internal-admin capabilities are privileged and must not leak into ordinary user flows.
- Free plan DB triggers inspect commercial entitlement server-side.
- Public Storage URLs are intentionally public; DB RLS does not make them private.

## SEO/link model

- Canonical host: `https://www.voltastore.app`.
- Apex redirect to `www` is intentional.
- Root landing has canonical/OG/Twitter/JSON-LD.
- Store/product pages generate merchant-specific metadata/canonical URLs.
- Old store slugs resolve to canonical new slugs.

## Known architectural hotspots

- onboarding scaffold is multi-step rather than atomic;
- public storefront has no explicit cache/revalidation strategy;
- several appearance/admin client surfaces remain large;
- root layout loads four font families globally;
- provider billing regression remains primarily integration/manual validation rather than a fully automated external E2E;
- SaaS acquisition-funnel DB schema exists before its application writer.

## Reference material

`docs/ai/` and `docs/audits/` remain historical deep maps. Use current code, migrations and production reality before relying on their old risk statements.
