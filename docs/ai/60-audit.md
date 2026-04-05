# VOLTA System Audit

## Executive Summary

VOLTA already has a strong product foundation: focused scope, premium visual direction, clear separation between admin and storefront, and RLS enabled across the main data model. The system is credible for early production use.

The main scale and risk issues are structural:

1. The most important business invariant, one user = one store, is enforced only in application code.
2. Store assets live in a public bucket, so Storage bypasses the privacy model of the database.
3. Onboarding is multi-step and non-transactional, which can leave partial state.
4. The storefront is fully dynamic and uncached, which will become expensive at scale.
5. Some core admin experiences are implemented as very large client components, which will slow future iteration.

## Risk Summary

### High

- One-store-per-user is not DB-enforced.
- Public bucket means assets remain readable outside DB RLS.
- Onboarding bootstrap is non-transactional.

### Medium

- Missing composite indexes for common storefront queries.
- Dynamic public rendering with no cache strategy.
- Large monolithic client components in admin.
- Auth callback errors are not surfaced clearly in login UI.
- Image lifecycle is incomplete because deleted image rows do not delete Storage objects.

### Low

- Product slug behavior is ambiguous after rename.
- Theme token values are validated in app code but not constrained in DB.
- Some admin destructive actions still use browser `confirm()`.

## 1. Security Audit

### What is correct

- RLS is enabled on all core tables in `20240101000002_rls.sql`.
- Public reads are scoped to active stores and their related records.
- Owner reads and writes are scoped through `owner_id = auth.uid()` or related store ownership checks.
- Middleware protects `/admin` and redirects authenticated users away from `/login`.
- `/auth/callback` supports both Google OAuth and magic link without splitting the auth surface.

### Findings

#### High: Storage privacy is weaker than database privacy

The `store-assets` bucket is public. That means image URLs can be fetched directly even if the related store is later disabled or unpublished. Database RLS does not protect public object URLs.

Recommended fix:

- Decide explicitly whether assets are intended to be public.
- If not, move to signed URLs or a private bucket plus an image delivery strategy.

#### High: One-store-per-user is not enforced at the database layer

The product rule says each user owns exactly one store. The app uses `.single()` in many places and assumes this invariant. The schema only adds a non-unique index on `stores.owner_id`.

Impact:

- Duplicate rows would break admin loading, onboarding, and server actions.
- This is a business-critical invariant and should not live only in TypeScript.

Recommended fix:

- Add a unique index on `stores(owner_id)` after validating production data.

#### Medium: Service-role client exists and should stay tightly guarded

`createAdminClient()` exists in `src/lib/supabase/server.ts`. It is not currently used in the inspected code paths, which is good. It is still a high-risk primitive because it bypasses RLS.

Recommended fix:

- Keep it isolated.
- Add explicit guardrails in docs and code review to prevent accidental use in request-time user flows.

#### Medium: Auth error propagation is incomplete

`/auth/callback` redirects to `/login?error=...`, but the login page does not read and render those search params.

Impact:

- OAuth and magic link failures become opaque.

Recommended fix:

- Render callback error states on `/login`.

### Security Verdict

RLS correctness is broadly good. The main security gap is not table isolation, it is public asset exposure and missing DB enforcement for core business rules.

## 2. Backend Audit (Supabase)

### Schema Design

#### Strengths

- The schema is small and understandable.
- Core store customization data is normalized into `stores`, `store_theme`, `store_layout`, and `store_content`.
- `store_theme`, `store_layout`, and `store_content` each enforce one row per store through unique `store_id`.
- Category and product slugs are unique inside each store.

#### Risks

##### High: Onboarding bootstrap is not transactional

`ensureOnboarding()` may create profile, store, theme, layout, and content in separate calls. Failures in the middle can leave partial state.

Current mitigation:

- Admin layout re-runs onboarding and can self-heal missing rows.

Why this is still weak:

- Partial state is still possible.
- More concurrency increases the chance of race conditions.

Recommended fix:

- Move bootstrap to a DB function or RPC with transaction semantics.

##### Medium: Theme and layout token columns are weakly constrained

Many design-token fields are plain text in Postgres and only constrained in Zod.

Impact:

- Invalid values can enter through future scripts, direct DB edits, or integrations.

Recommended fix:

- Add DB check constraints for controlled token sets.

##### Medium: Referential integrity is functional but not fully modeled

`products.category_id` references `categories.id`, but the DB does not enforce that the category belongs to the same store as the product.

Recommended fix:

- Accept this if application-only writes remain the rule, or tighten with a trigger/check strategy if outside writers will exist.

### Missing or Weak Indexes

Existing indexes are decent for the current size, but common read patterns are not fully covered.

Recommended indexes:

- `products(store_id, is_active, sort_order)`
- `products(store_id, is_featured, sort_order)`
- `categories(store_id, sort_order)`
- `product_images(product_id, sort_order)`

Why these matter:

- Public storefront queries are always store-scoped.
- Current standalone indexes on `is_active` and `is_featured` are less useful than store-scoped composites as the dataset grows.

### Query and Consistency Issues

#### Medium: Duplicate owner-store lookup logic

The same store-resolution pattern is repeated across server actions and admin routes.

Impact:

- More code to maintain.
- More chances for drift in auth and ownership checks.

Recommended fix:

- Consolidate into one shared server helper.

#### Medium: Image lifecycle is incomplete

Deleting a product image removes the DB row but does not delete the object from Storage.

Impact:

- Storage waste.
- Stale public assets remain accessible.

Recommended fix:

- Persist object path separately and delete the file on image removal.

#### Low: Product slug strategy is unclear

Products get a slug on create, but not on rename.

Impact:

- Name and slug can drift.

Recommended fix:

- Make slugs explicitly immutable, or handle rename with redirect-safe slug updates.

### Backend Verdict

The Supabase model is good for an early SaaS. The next step is to move critical invariants and bootstrap behavior from app code into the database layer.

## 3. Frontend Audit

### What is working

- The app has a clear route split: auth, admin, public storefront.
- Shared primitives and common components are reasonably organized.
- The admin has a strong premium direction and useful live-preview patterns.
- The storefront uses theme variables cleanly and consistently.
- Zustand is scoped to cart concerns only, which is appropriate.

### Findings

#### Medium: Large feature components concentrate too much responsibility

Examples:

- `src/components/admin/ThemeForm.tsx` is roughly 867 lines.
- `src/components/admin/ProductForm.tsx` is also large and multi-purpose.

Impact:

- Harder testing.
- Harder ownership boundaries.
- Higher render complexity.

Recommended fix:

- Split by subdomain, not by arbitrary size.
- Example for appearance: token controls, preview builders, and server-submit shell.

#### Medium: Repeated auth and store-loading patterns across admin routes

Many admin pages repeat:

- create server client
- get user
- redirect if no user
- get admin store
- redirect if no store

Impact:

- Repetition.
- More work for future route additions.

Recommended fix:

- Extract an admin route helper for authenticated store context.

#### Low: Local optimistic state can drift from server truth

`ProductList` and `CategoriasList` keep local copies after mutations. This is fine for speed, but it creates a second source of truth during long sessions.

Recommended fix:

- Keep local state for responsiveness, but consider `router.refresh()` or targeted cache refresh after destructive actions.

#### Low: Premium UX is held back by native confirmations

Product and category deletes still rely on `confirm()`.

Recommended fix:

- Replace with controlled dialog components from the existing UI system.

### Frontend Verdict

The frontend architecture is directionally good. The next improvement is not another visual pass; it is reducing component concentration and duplicated route logic.

## 4. Performance Audit

### Main issues

#### Medium: Public storefront is dynamic and uncached

`getStoreBySlug()` uses the server Supabase client. In Next.js App Router this makes the route effectively dynamic.

Impact at scale:

- Every store visit pays the full fetch cost.
- Harder to leverage CDN or ISR-style performance.

Recommended fix:

- Introduce a cache-friendly public data path with explicit revalidation on store changes.

#### Medium: Full catalog loads eagerly

The storefront fetches:

- store
- theme
- layout
- content
- all categories
- all active products
- all product images

This is fine for small catalogs, but not for larger merchants.

Recommended fix:

- Add catalog pagination or progressive loading once merchant size grows.

#### Medium: Client bundles include heavy interaction layers up front

The public storefront always ships client code for:

- product modal
- cart sheet
- floating cart bar
- Framer Motion transitions

Recommended fix:

- Lazy-load modal and cart interactions.
- Keep non-interactive sections as lean as possible.

#### Medium: Font payload is broader than necessary

The root layout loads many Google fonts globally for all pages.

Impact:

- Higher CSS and font cost on login, admin, and storefront alike.

Recommended fix:

- Scope or reduce font loading.

#### Low: Add-to-cart for quantity is update-heavy

`ProductModal` adds quantity by looping `addItem()` multiple times.

Recommended fix:

- Add a quantity-aware cart action.

#### Low: Some derived client calculations repeat inside render

Examples:

- Category lookup during filtering
- Subtotal/item count derived repeatedly in UI selectors

Recommended fix:

- Minor optimization only after bigger issues above.

### Performance Verdict

The biggest scaling win is not micro-optimization. It is making the public store cacheable and progressively loaded.

## 5. Product Audit

### Onboarding

Current state:

- Authentication works.
- Store bootstrap works.
- Admin is visually strong.

Main issue:

- Activation is under-guided.

The system creates a store, but the user still needs to understand:

- store name
- slug
- WhatsApp number
- logo and hero
- products
- whether the store is truly ready to share

Recommended improvement:

- Add a visible launch checklist with completion states and one-click navigation.

### Conversion

Strengths:

- WhatsApp checkout is simple.
- Premium storefront improves trust.
- Cart and product modal reduce friction.

Friction points:

- No explicit publish-readiness signal in admin.
- No analytics for store visits, add-to-cart, or WhatsApp clicks.
- No trust-building operational signals when contact data is missing.

Recommended improvement:

- Add readiness and trust signals before more features.

### Premium Feel

Strengths:

- Admin and storefront already move toward a Stripe/Vercel/Linear feel.
- Appearance previews are a real differentiator.

Gaps:

- Some interactions still feel like internal tools rather than premium product workflows.
- Native confirmations and weak error propagation reduce polish.
- Empty states are good, but activation guidance is still too implicit.

### Product Verdict

VOLTA is close to sellable for a focused niche. The next leap in perceived value comes from guided activation, publish confidence, and operational clarity, not from adding more settings.

## 6. High-Value Code Improvements

These are the highest-value engineering changes without rewriting the system:

1. Enforce `stores.owner_id` uniqueness in DB.
2. Replace onboarding multi-write logic with a transactional RPC or DB function.
3. Centralize authenticated store resolution for server actions and admin pages.
4. Split `ThemeForm` into focused subcomponents while preserving the current UX.
5. Add composite indexes for storefront queries.
6. Add proper Storage object cleanup on image deletion.
7. Make public storefront data cacheable with explicit revalidation.
8. Scope global font loading.
9. Surface auth callback errors on the login page.
10. Replace native delete confirmations with controlled dialogs.

## Final Assessment

VOLTA is a solid early production SaaS with good product instincts and mostly correct data isolation. It is not yet scale-hardened.

To support thousands of users safely, focus first on:

1. database-enforced invariants
2. transactional onboarding
3. cacheable public reads
4. Storage privacy strategy
5. reducing monolithic client surfaces in admin
