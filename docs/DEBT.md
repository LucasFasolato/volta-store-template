# VOLTA Store — Material Technical & Design Debt

Only current, evidence-backed debt belongs here. Historical audit findings that are now fixed or intentionally accepted are recorded separately so agents do not repeatedly “rediscover” them.

## Open

| ID | Priority | Area | Evidence / material impact | Recommended resolution | Status |
|---|---|---|---|---|---|
| STORE-DEBT-003 | P2 | Onboarding | `ensureOnboarding` still creates/repairs profile, store and scaffold across multiple operations. Duplicate-store races are protected, but a process failure can leave partial bootstrap state. | Keep repair/idempotency behavior; move to a transactional/RPC boundary only when the benefit justifies migration complexity. | OPEN |
| STORE-DEBT-005 | P2 | Frontend | Appearance/admin surfaces remain large client components and costly to reason about/test. | Split only along stable domain boundaries while preserving current UX; no broad rewrite. | OPEN |
| STORE-DEBT-008 | P2 | Performance | Public storefront is server-rendered dynamically without an explicit cache/revalidation contract. | Measure real traffic/latency, then introduce a tenant-safe freshness strategy if needed. | OPEN |
| STORE-DEBT-009 | P3 | Frontend/performance | Root layout loads Geist, Geist Mono, Plus Jakarta Sans and Playfair Display globally. | Measure route/font cost; scope or reduce only if impact is meaningful. When VOLTA-owned product UI typography is materially redesigned, converge toward the current Visual Foundation rather than adding another competing family. | OPEN |
| STORE-DEBT-011 | P3 | Data integrity | Some durable appearance values have DB checks, while broad `store_theme` token sets still rely mainly on app validation. | Add DB checks only for genuinely durable controlled sets with realistic non-app writers. | OPEN / BOUNDED |
| STORE-DEBT-014 | P3 | Types | `saas_funnel_events` gained `user_id` / `store_id` in STORE-INIT-004, while generated Supabase TS types have not yet been refreshed; privileged funnel modules therefore keep localized casts. | Regenerate types during a low-risk maintenance pass and remove only the now-unnecessary funnel casts. | OPEN / BOUNDED |
| STORE-DEBT-015 | P2 | Design System | Store predates VOLTA Visual Foundation v1. Raw legacy brand green `#12E89A` remains across the landing and multiple VOLTA-owned admin/onboarding surfaces; Instrument Sans is not yet the company/product UI family in implementation. The local Web Design System previously presented the legacy green as shared VOLTA grammar. | Treat current implementation as legacy-compatible, not canonical. Converge incrementally on materially redesigned/touched VOLTA-owned surfaces toward `VOLTA-VIS-001` (`#00E878`, Instrument Sans, semantic token use). Do not rewrite merchant-selected storefront typography or perform a broad migration without product value/verification. | OPEN / CONTROLLED DESIGN DEBT |
| STORE-DEBT-016 | P3 | Design tokens | Brand/action colors are still repeated as raw values in several components rather than flowing consistently through semantic roles. This increases drift risk during future Visual Foundation adoption. | When relevant surfaces are touched, centralize repeated VOLTA-owned action/brand decisions into semantic tokens. Avoid a standalone token migration project unless coordination/repetition justifies it. | OPEN / BOUNDED |

## Verified closed / retired audit findings

| ID | Prior concern | Current evidence | Status |
|---|---|---|---|
| STORE-DEBT-001 | One owner could have duplicate stores. | `20260405000000_enforce_store_owner_uniqueness.sql` adds `stores_owner_id_unique`; production reports `owner_id` unique. | CLOSED |
| STORE-DEBT-002 | Public Storage could be mistaken for private media. | Public-read `store-assets` is an intentional storefront-media contract; writes/deletes are owner-folder scoped. See `STORE-ADR-003`. | ACCEPTED CONTRACT |
| STORE-DEBT-004 | Auth/store resolution duplicated across server code. | `src/lib/server/store-context.ts` centralizes authenticated user/store identity/data/context helpers. | CLOSED |
| STORE-DEBT-006 | Product deletion could orphan Storage assets. | Image/storage hardening enumerates linked/folder objects, removes them on product deletion and rolls back failed image DB writes. | CLOSED |
| STORE-DEBT-007 | Generic catalog/storefront index concern from old audit. | Discovery/performance hardening and newer indexes shipped; no current query-plan evidence proves a material missing index. Re-open only from measured/EXPLAIN evidence. | RETIRED |
| STORE-DEBT-010 | Auth callback errors were opaque. | `login-feedback.ts` provides explicit states for invalid links, rate limits, Google/provider/callback/auth failures. | CLOSED |
| STORE-DEBT-012 | Product rename could destabilize product deep links. | Product slug is created on create and ordinary `updateProduct` does not regenerate it. | CLOSED |
| STORE-DEBT-013 | Native destructive confirmation consistency. | This is not material technical debt by itself. Re-open only if a current flow creates measurable usability/safety risk. | RETIRED |

## Delivery/revalidation gaps (not debt)

- STORE-INIT-004 now wires the SaaS funnel through first share; real post-release merchants are still needed before the funnel can support activation conclusions.
- Real Mercado Pago payment/cancellation has operator-reported manual validation, but external provider E2E is not an automated regression suite.
- Search Console revalidation after canonical hardening is external/unknown.
- Company OS v1 visual adoption is intentionally incremental; the existence of legacy visual tokens alone does not justify a broad UI rewrite.

## Debt policy

- Security/data-integrity issues with credible production risk beat unrelated feature accumulation.
- Do not label aesthetic perfectionism or speculative scale work as debt.
- Design drift against an approved Company OS foundation is debt when it creates future inconsistency, but migration priority remains proportional to product impact and change scope.
- Close debt only with code/migration/render/production evidence appropriate to the debt.
- Prefer a narrow fix over an architecture or visual rewrite.
