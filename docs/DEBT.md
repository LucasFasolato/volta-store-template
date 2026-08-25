# VOLTA Store — Material Technical Debt

Debt listed here comes primarily from the original architecture audit. **Open means not yet re-verified as fixed**; it does not claim newer code definitely still has the issue. Each item should be checked against current migrations/code before implementation or closure.

| ID | Priority | Area | Material impact | Recommended resolution | Status |
|---|---|---|---|---|---|
| STORE-DEBT-001 | P1 | Database | Duplicate stores can break single-store assumptions and navigation. | Verify production data, then enforce unique owner/store invariant at DB level if product remains one-store-per-owner. | OPEN / REVERIFY |
| STORE-DEBT-002 | P1 | Storage | Public asset URLs remain reachable outside DB RLS. | Explicitly decide public-vs-private asset contract; use private/signed strategy if privacy is required. | OPEN / REVERIFY |
| STORE-DEBT-003 | P1 | Onboarding | Partial multi-step bootstrap can leave inconsistent state or races. | Move bootstrap to transactional/race-safe DB/application contract. | OPEN / REVERIFY |
| STORE-DEBT-004 | P2 | Backend | Repeated auth/store lookup logic can drift and adds queries. | Centralize authenticated merchant/store resolution. | OPEN / REVERIFY |
| STORE-DEBT-005 | P2 | Frontend | Large appearance/client components slow iteration and testing. | Split by stable subdomain boundaries without rewriting UX. | OPEN / REVERIFY |
| STORE-DEBT-006 | P2 | Media | DB image removal may leave Storage objects. | Track object path and remove Storage object with lifecycle-safe deletion. | OPEN / REVERIFY |
| STORE-DEBT-007 | P2 | Database/performance | Storefront query patterns may lack optimal composites. | Verify query plans/current indexes; add store-scoped composite indexes where justified. | OPEN / REVERIFY |
| STORE-DEBT-008 | P2 | Performance | Public storefront was audited as dynamic/uncached. | Introduce explicit cache/revalidation strategy after verifying current read path. | OPEN / REVERIFY |
| STORE-DEBT-009 | P2 | Frontend/performance | Broad font loading increases payload. | Recheck current font strategy; scope/reduce always-on fonts if still excessive. | OPEN / REVERIFY |
| STORE-DEBT-010 | P2 | Auth | Callback errors may be opaque to users. | Verify current login/error UX and map failures to useful user-facing states. | OPEN / REVERIFY |
| STORE-DEBT-011 | P2 | Data integrity | Design-token enums may rely only on application validation. | Add DB checks for durable controlled sets when external/direct writers are a realistic risk. | OPEN / REVERIFY |
| STORE-DEBT-012 | P3 | Catalog | Product rename/slug semantics may drift. | Decide and document immutable-vs-migrating product slug behavior. | OPEN / REVERIFY |
| STORE-DEBT-013 | P3 | Admin UX | Native destructive confirmations reduce premium consistency. | Verify current flows and replace remaining native confirmation UI when present. | OPEN / REVERIFY |

## Debt policy

- Security/data-integrity debt with credible production risk is addressed before unrelated feature accumulation.
- Do not register aesthetic perfectionism as technical debt.
- Intentionally accepted launch debt must be bounded and realistically repayable with focused work; the operating target is roughly one week or less for consciously accepted launch debt.
- Closing an item requires evidence from current code/migrations/production behavior, not assumption.
