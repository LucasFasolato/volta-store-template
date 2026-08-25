# STORE-ADR-002 — One owner, one Store product assumption

- **Status:** ACCEPTED / REQUIRES DB ENFORCEMENT VERIFICATION
- **Decision class:** Product / data model
- **Source:** Existing application contract and architecture audit

## Context

Admin and onboarding code were designed around one authenticated owner resolving to one Store. The audit documented repeated `.single()` assumptions while `stores.owner_id` was not guaranteed unique at DB level.

## Decision

Preserve **one owner = one Store** as the current product contract until a future accepted product decision introduces multi-store ownership.

Implementation should enforce critical invariants in the database as well as application code where feasible.

## Consequences

- onboarding must not create a second store for the same owner;
- owner/store resolution can remain simple;
- adding multi-store later is a deliberate product/data migration, not an incidental refactor;
- `STORE-DEBT-001` remains open until current DB enforcement is verified/fixed.

## Supersession

A future multi-store product decision must supersede this ADR and define migration, navigation, permissions and billing implications.
