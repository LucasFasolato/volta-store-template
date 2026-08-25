# VOLTA Store — Current State

**Last reviewed:** 2026-08-25  
**Lifecycle:** PRODUCTION  
**Authoritative branch:** `main`  
**Production:** `https://www.voltastore.app`  
**Production discovery:** current public search resolves the domain and describes the product as a WhatsApp-selling catalog/storefront.  
**Last main commit observed during adoption:** `1d614249ff315854c3741de637625222bd7b4e1e` — Rebuild landing previews as native premium UI.

## Production health

**Status: operational / no known SEV-1 in the evidence reviewed for Product OS adoption.**

This status is not a synthetic uptime guarantee. Product-specific health checks are not yet automated under VOLTA OS.

## Recently shipped

Recent `main` history shows active work on:

- Landing Conversion 2.0.
- Paid activation welcome/billing return experience.
- Premium landing assets and product previews.
- iOS Safari contrast correction for VOLTA PRO.
- Canonical SEO/indexability hardening.
- Store landing conversion/mobile redesign.
- Native premium preview rebuild.

## Core system currently present

- Google OAuth + magic-link authentication.
- Admin and public storefront split.
- Store bootstrap/onboarding logic.
- Store/content/configuration management.
- Category/product CRUD.
- Appearance/layout customization.
- Public storefront by slug.
- Persisted browser cart.
- WhatsApp order handoff.
- Supabase Postgres/RLS/Storage.
- Billing/commercial-access surface with Mercado Pago return handling.

## Active Product OS work

`STORE-INIT-001 — Product OS Adoption` is being used to normalize context and make this repository independently continuable by any compliant agent.

## Known material risks

The original Store audit identified high-priority structural risks that have not been assumed fixed merely because newer feature work exists:

1. one-store-per-owner invariant may still lack DB enforcement;
2. audited Storage bucket strategy is public;
3. onboarding bootstrap was non-transactional;
4. public storefront caching/scaling needs explicit verification;
5. large client-side admin surfaces increase maintenance cost.

See `DEBT.md`. Agents must verify current implementation before closing any of these debts.

## Blocked / external validation

A full real-money Mercado Pago end-to-end payment validation may require a buyer account distinct from the merchant/payment-owner account. This was a known practical validation constraint in recent product work and should remain an explicit external-test item rather than be simulated as completed.

## Next recommended direction

1. Finish Product OS adoption and use it during real Store work.
2. Re-verify high-risk audit debts against current migrations/code before executing fixes.
3. Continue activation/conversion work with publish-readiness and analytics as high-value directions once scale-safety priorities are controlled.
4. Validate multi-agent soft ownership during the next substantial Store initiative.

## Last operating agent

VOLTA OS adoption performed by ChatGPT agent on `chore/store-INIT-001-volta-os-adoption`.
