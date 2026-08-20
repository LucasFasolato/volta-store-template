# Supabase migration reconciliation — 2026-08-20

Project: `zfugbeyixqaphkgfnkbb` (`volta-store`)

This record documents the production migration-history repair required before
`20260820214507_tenant_relation_integrity.sql` can be applied. The repair is
metadata-only: it must not execute or revert application DDL.

## Evidence collected

- Production contains 21 migration-history rows, beginning at
  `20260815230610`.
- The repository contains 32 migrations before the tenant-integrity migration.
- All objects represented by the 19 local-only versions exist in production.
  Checks covered tables, columns, constraints, indexes, RLS flags, policies,
  grants, triggers, functions and the `store-assets` bucket.
- Production has 12 stores, 7 categories, 9 brands and 30 products. There are
  no cross-store product/category or product/brand relationships.
- No application DDL is missing. The divergence is in migration metadata and
  timestamp selection, not in the current schema.

## Equivalent timestamp groups

| Production history | Repository history | Equivalence |
| --- | --- | --- |
| `20260815230610_catalog_presentation_and_ordering` | `20260815201000_catalog_presentation_and_ordering` | Exact SQL (`md5 71804fc30af1896335e37982b188c91b`) |
| `20260818195013_catalog_discovery` + `20260818195722_catalog_discovery_security_hardening` + `20260818200517_catalog_discovery_performance_hardening` + `20260818200611_catalog_discovery_trim_speculative_indexes` | `20260818194500_catalog_discovery` + `20260818195722_catalog_discovery_security_hardening` + `20260818200700_catalog_discovery_performance_hardening` + `20260818201200_catalog_discovery_trim_speculative_indexes` | Cumulative schema equivalence. The repository's first file includes later hardening, while the following idempotent files reproduce the same final policies, function search path and index set. |
| `20260820180314_billing_access_overrides` | `20260820180000_billing_access_overrides` | Exact SQL (`md5 1d30ae5ad27cca680fcd26b2fa4418ba`) |
| `20260820180855_billing_access_overrides_explicit_deny` | `20260820181300_billing_access_overrides_explicit_deny` | Exact SQL (`md5 333b1568c993785484942c1b7fd0280f`) |
| `20260820180944_billing_access_overrides_updated_by_index` | `20260820181600_billing_access_overrides_updated_by_index` | Exact SQL (`md5 348096ac290515e52e0c1468792a403b`) |

The shared versions not listed above already match. Four shared files have only
comment/whitespace differences or an idempotent repeat of the same statement;
their final catalog objects match production.

## Metadata entries to change

Mark these production-only versions as `reverted` in migration history:

```text
20260815230610
20260818195013
20260818200517
20260818200611
20260820180314
20260820180855
20260820180944
```

Mark these verified local versions as `applied`:

```text
20240101000001
20240101000002
20240101000003
20240101000004
20260403143000
20260404000000
20260405000000
20260406000000
20260409120000
20260415000000
20260415110000
20260812193000
20260815201000
20260818194500
20260818200700
20260818201200
20260820180000
20260820181300
20260820181600
```

## Supported repair procedure

Use the official Supabase CLI
[`migration repair`](https://supabase.com/docs/reference/cli/supabase-migration-repair)
command from an authenticated, linked checkout. Do not mutate
`supabase_migrations.schema_migrations` directly.

```powershell
supabase link --project-ref zfugbeyixqaphkgfnkbb

supabase migration repair --status reverted `
  20260815230610 20260818195013 20260818200517 20260818200611 `
  20260820180314 20260820180855 20260820180944

supabase migration repair --status applied `
  20240101000001 20240101000002 20240101000003 20240101000004 `
  20260403143000 20260404000000 20260405000000 20260406000000 `
  20260409120000 20260415000000 20260415110000 20260812193000 `
  20260815201000 20260818194500 20260818200700 20260818201200 `
  20260820180000 20260820181300 20260820181600
```

`migration repair` changes only the tracking rows. It does not apply or undo
the SQL in these migrations.

## Required postchecks

1. `supabase migration list --linked` has identical local and remote versions.
2. `supabase db push --linked --dry-run` lists only
   `20260820214507_tenant_relation_integrity.sql` when run from PR #41.
3. The production schema snapshot and zero-cross-tenant data prechecks remain
   unchanged.
4. Do not apply the tenant-integrity migration as part of the repair.
