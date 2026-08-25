# STORE-ADR-003 — Public storefront media boundary

- **Status:** ACCEPTED
- **Decision class:** Architecture / security / product
- **Source:** Storage migrations, current media pipeline and storefront product requirement

## Context

Storefront product/hero/logo images must resolve as simple public web assets. Supabase database RLS does not protect a public Storage object URL, so ambiguity about whether `store-assets` is private creates security risk.

## Decision

`store-assets` is intentionally a **public-read bucket for storefront media**.

- public read is allowed;
- authenticated mutation remains scoped to the owner's top-level folder;
- this bucket must never hold private/sensitive documents or data;
- media replacement/deletion should include Storage lifecycle cleanup.

## Why

- storefront images are intentionally public content;
- public URLs keep rendering/sharing simple;
- owner-scoped writes preserve tenant mutation boundaries;
- explicitly documenting the privacy contract is safer than pretending database RLS protects public files.

## Consequences

- agents must not “fix” public storefront images by making the bucket private without an approved product/migration plan;
- private future assets require a separate privacy contract/bucket/signed-access strategy;
- deleting a DB media row alone is not sufficient lifecycle handling.
