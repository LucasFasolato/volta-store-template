# VOLTA Store — System

## System model

Production SaaS built with Next.js App Router and Supabase. Server-rendered routes provide authenticated admin/public data while client components handle editing interactions, storefront modal/filter behavior and browser-local cart state.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- shadcn/ui-style primitives
- Supabase Auth
- Supabase Postgres with RLS
- Supabase Storage
- Zustand cart state
- Vercel deployment
- WhatsApp order handoff

## Main entrypoints

- `src/app/layout.tsx` — root layout and global foundations.
- `src/app/page.tsx` — product/landing root behavior.
- `src/app/login/page.tsx` — authentication screen.
- `src/app/auth/callback/route.ts` — shared OAuth/magic-link callback.
- `src/app/admin/layout.tsx` — protected admin shell/onboarding boundary.
- `src/app/(public)/tienda/[slug]/page.tsx` — public storefront.
- `src/proxy.ts` — request proxy/middleware entry.

## Major modules

### Auth

Supabase session handling, Google OAuth and magic-link flow. Anonymous users are kept out of admin routes and callbacks establish the session before onboarding/admin navigation.

### Onboarding/store bootstrap

Application logic ensures a profile/store and associated theme/layout/content rows exist. The original audit describes this as idempotent in intent but multi-step and non-transactional.

### Admin

Merchant-facing management for store identity/content, appearance/layout, products/categories and related commercial surfaces.

### Appearance system

A major product differentiator. Theme/layout tokens and previews allow non-technical merchants to control presentation while seeing consequences. Large client components remain a maintainability hotspot.

### Catalog

Product/category CRUD with image assets in Supabase Storage. Products/categories are store-scoped.

### Public storefront

Server data loading followed by interactive client experience for browsing, categories, modal/product detail and cart interactions.

### Cart and WhatsApp checkout

Zustand persists cart state in the browser. Checkout generates an encoded WhatsApp message and opens the WhatsApp handoff; the shopper order is not currently modeled as a server-side order record in the original audited architecture.

### Billing/commercial access

Recent main history shows billing return handling, plan access concepts and a paid-plan welcome experience integrated with Mercado Pago flows. This module is newer than the original architecture audit and should be inspected directly before making billing changes.

## Data model — audited core

- `profiles`
- `stores`
- `store_theme`
- `store_layout`
- `store_content`
- `categories`
- `products`
- `product_images`

The live repository may contain additional billing/analytics/support tables introduced after the original audit; agents touching those areas must inspect current migrations rather than treating this list as exhaustive.

## Security model

RLS is enabled across audited application tables. Public reads are scoped to active store data and owner operations resolve ownership server-side. The `store-assets` bucket was documented as public in the original audit, which creates a different privacy boundary than DB RLS.

Never assume public Storage URLs are protected by database RLS.

## Critical invariants

- Never trust client-provided ownership identifiers.
- Public storefront reads must not expose inactive/private store data.
- Store/theme/layout/content rows must retain valid store relationships.
- Slug semantics are externally visible and link-sensitive.
- Auth and billing return flows must preserve safe internal redirects.
- RLS/service-role boundaries must remain explicit.
- Destructive schema/data operations require elevated review under VOLTA OS.

## Known architectural hotspots

- onboarding consistency/transactionality;
- owner/store invariant enforcement;
- public asset strategy;
- public storefront caching/scaling;
- large appearance/product admin client components;
- product-image lifecycle;
- repeated server auth/store-resolution patterns.

## Legacy technical map

`docs/ai/` remains a useful historical deep map, especially:

- `00-index.yaml`
- `10-system-map.yaml`
- `20-modules.yaml`
- `30-contracts.yaml`
- `40-flows.yaml`
- `50-guardrails.yaml`
- `60-debt.yaml`
- `60-audit.md`
- `70-roadmap.md`

It is reference material, not automatically current truth.
