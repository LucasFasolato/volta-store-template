# STORE-ADR-002 — One owner, one Store product assumption

- **Status:** ACCEPTED / VERIFIED
- **Decision class:** Product / data model
- **Source:** Application contract, migration history and production schema

## Context

Admin, onboarding, commercial access and navigation resolve one authenticated owner to one Store. Multi-store ownership would change navigation, permissions, billing, activation and data migration semantics.

## Decision

Preserve **one owner = one Store** as the current product/data contract until an explicit accepted product decision introduces multi-store ownership.

The invariant is enforced in the database, not only application code.

## Verification

- `supabase/migrations/20260405000000_enforce_store_owner_uniqueness.sql` detects existing duplicates before adding `stores_owner_id_unique unique(owner_id)`.
- Production schema inspection on 2026-08-25 reports `stores.owner_id` as unique.
- Current onboarding retries/re-resolves on uniqueness collisions instead of intentionally creating another store.

## Consequences

- onboarding must never create a second store for an owner;
- owner/store resolution can stay simple;
- tests/refactors may rely on one Store per owner;
- multi-store is a deliberate product + schema + billing migration, not an incidental UI feature.

## Supersession

A future multi-store decision must supersede this ADR and define migration, navigation, permissions, activation and billing behavior.
