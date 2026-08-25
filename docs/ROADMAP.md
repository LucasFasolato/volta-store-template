# VOLTA Store — Roadmap

This roadmap expresses intentional direction, not every idea. It intentionally avoids artificial dates.

## NOW

### STORE-INIT-001 — Product OS Adoption
Establish portable context, truthful current state, guardrails, debt, decisions and agent continuity for Store.

### Scale-safety verification
Re-verify the original high-risk audit findings against current code/migrations, then prioritize fixes that remain valid:

- DB enforcement of one-store-per-owner;
- transactional or race-safe onboarding;
- public asset/storage strategy;
- composite storefront indexes where still needed;
- auth/billing failure visibility and security boundaries.

Critical debt blocks feature accumulation when it materially threatens production integrity.

## NEXT

### Activation and publish confidence
Continue reducing merchant time-to-value with a guided readiness model, clear publish/share confidence and an obvious next step.

Potential scope derived from the existing approved product direction:

- launch/setup checklist;
- publish readiness;
- share/publish panel improvements;
- trust/contact completeness guidance.

### Basic conversion analytics
Give merchants evidence that the storefront is working:

- visits;
- product detail opens;
- add-to-cart;
- WhatsApp handoff intent;
- useful funnel/conversion summaries.

### Public performance hardening
Move public reads toward a cache/revalidation strategy appropriate to scale and reduce unnecessary client/runtime cost without weakening freshness or tenant isolation.

## LATER

- catalog scaling tools and bulk operations;
- vertical starter templates;
- media compression/lifecycle hardening;
- theme history/draft restore;
- share-safe slug migration/redirect strategy;
- deeper merchant growth tools after core funnel telemetry exists.

## Idea vs roadmap

The historical `docs/ai/70-roadmap.md` remains useful input, but this file is the current intentional ordering. New ideas belong outside the roadmap until promoted by an explicit decision.
