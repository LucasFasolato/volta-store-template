# STORE-AUDIT-001 — Architecture & Product Baseline

- **Status:** HISTORICAL BASELINE
- **Original audit source:** `docs/ai/60-audit.md` plus `docs/ai/*.yaml`
- **Adopted into Product OS:** 2026-08-25

## Executive baseline

The original audit assessed Store as a credible early-production SaaS with:

- focused scope;
- premium visual direction;
- clear admin/storefront separation;
- RLS enabled across the main data model;
- a simple WhatsApp commerce handoff.

It identified the main scale/safety concerns as structural rather than visual:

1. one-store-per-owner not DB-enforced;
2. public Storage asset boundary;
3. non-transactional onboarding bootstrap;
4. dynamic/uncached public storefront reads;
5. concentrated large client components;
6. incomplete media deletion lifecycle;
7. missing/weak composite query indexes;
8. opaque auth callback errors;
9. design-token constraints primarily in app code.

## Product findings

The audit considered the next perceived-value improvements to come from guided activation, publish confidence and operational clarity rather than adding more customization settings.

It proposed:

- launch checklist;
- publish readiness;
- basic analytics;
- share/publish workflow;
- trust signals;
- later catalog scaling/templates/theme history.

## Relationship to current state

This audit predates several later main-branch changes, including billing/paid activation work and multiple landing conversion passes. Therefore it remains evidence and architectural baseline, **not an assertion that every finding is still unresolved**.

`docs/DEBT.md` carries forward material findings with `REVERIFY` status. `docs/CURRENT_STATE.md` and current code/production are authoritative for operational work.

## Preserved source

The complete original material remains in `docs/ai/` to avoid losing detail during Product OS normalization.
