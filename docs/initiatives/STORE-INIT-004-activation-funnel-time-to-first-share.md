# STORE-INIT-004 — Activation Funnel & Time to First Share

- **Status:** IN PROGRESS
- **Priority:** P0
- **Started:** 2026-08-26
- **Approved scope:** acquisition → signup → store → first product → publish → first share measurement, plus a compact internal funnel view.

## Outcome

Turn VOLTA Store activation from an assumed journey into a measurable one, with **Time to First Share < 10 minutes** as the current activation target.

## Scope

- Extend the server-managed SaaS funnel with `signup_completed`, `store_created`, `first_product`, `published` and `first_share`.
- Correlate anonymous acquisition session data with authenticated merchant/store milestones without trusting client-provided tenant IDs.
- Preserve source/campaign/session continuity from landing into authenticated activation.
- Record milestone events at the point where the underlying action actually succeeds.
- Add a compact internal dashboard for 7/30-day funnel conversion, Time to First Share and source/device segmentation.
- Keep direct client access to `saas_funnel_events` denied.

## Non-goals

- No onboarding redesign before drop-off evidence exists.
- No broad BI platform, third-party analytics suite or session replay.
- No new commercial plan logic or merchant-facing analytics changes.
- No fabricated conversion benchmarks.

## Definition of done

- Structural DB changes are migrated and production-safe.
- Auth, store creation, first product, first publish and first share milestones are deduplicated and queryable.
- Internal dashboard is protected by the existing VOLTA internal-admin boundary.
- Tests/build/typecheck pass.
- Production receives the new release and at least one safe event-path verification confirms ingestion without exposing customer data.
- `CURRENT_STATE`, `ROADMAP` and this initiative reflect the shipped truth.
