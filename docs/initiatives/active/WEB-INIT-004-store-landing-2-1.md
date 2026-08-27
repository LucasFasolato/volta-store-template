# WEB-INIT-004 — VOLTA Store Landing 2.1

**Status:** IMPLEMENTED IN THIS REVISION / PRODUCTION VERIFICATION PENDING  
**Scope:** public commercial landing only  
**Program:** VOLTA Web Design System 2.0 migration

## Objective

Retrofit VOLTA Store into the shared Web 2.0 family without redesigning the strongest existing commercial landing from zero. The goal is less scroll, clearer VOLTA family grammar and stronger guardrails while preserving Store's proven light/commercial personality.

## Approved direction

- preserve hero promise **“Tu tienda online, lista para vender por WhatsApp.”**;
- preserve Store as the lightest/most commercial VOLTA product;
- preserve real-store proof and current pricing truth;
- preserve OAuth root callback and acquisition analytics;
- reduce the landing to six primary chapters;
- remove the long FAQ chapter;
- reduce card density in how-it-works/product explanation;
- preserve the mobile sticky acquisition CTA;
- use dark only for the purposeful product experience;
- protect mobile safe areas and >=44px primary targets.

## Delivered

### Structure

1. Hero
2. `Cargá → Compartí → Vendé`
3. Product experience
4. Real-store proof
5. Pricing
6. Final CTA

### Visual system

- canvas aligned to the Web 2.0 light family;
- VOLTA / Store lockup in header;
- tighter, shorter section rhythm;
- decisive `Producto → carrito → WhatsApp` Product Moment;
- editorial step rows instead of three isolated marketing cards;
- product benefits rendered as restrained rows instead of nested cards;
- same Store green semantics and purposeful dark product chapter;
- existing NOVA product imagery retained.

### Conversion/product truth

Preserved:

- `/tienda/strongprotein` real-store proof;
- Free/VOLTA/PRO configuration-driven prices/features;
- Mercado Pago subscription trust copy;
- root Google OAuth callback redirect contract;
- landing acquisition analytics event names and placements;
- mobile sticky CTA visibility logic.

No testimonials, sales counts or unsupported product claims were added.

### Quality protection

- `scripts/verify-store-landing.mjs` enforces six chapters, approved promise, real-store link, analytics, pricing source, OAuth callback, safe-area/mobile targets and FAQ retirement;
- GitHub Build workflow runs the Store landing contract before tests/build;
- `docs/WEB-DESIGN-SYSTEM.md` becomes local authority for future Store marketing changes.

## Deployment discipline

This work follows the global one-deploy policy. The feature revision is prepared as one coherent Git commit/ref update so the connected Vercel project sees at most one feature preview attempt. The final merge to `main` is the single intended production deployment for this requirement.

If Vercel returns the current daily build/deployment limit, record the blocker and stop retrying; do not create dummy commits or manual redeploy loops.

## Verification boundary

Code/CI verification and production/render verification are separate. A successful build is required before merge, but the initiative must not claim production visual verification unless the final `main` deployment is actually `READY` and inspected.
