# VOLTA Store — Guardrails

These are product/system invariants, not style preferences.

## Product boundary

- The core shopper flow ends in a **structured WhatsApp handoff**. Do not add shopper payment/ERP/order-management complexity as an incidental refactor.
- Preserve radical simplicity: few controls, human language, automate before configuring.
- Mobile quality is first-class.
- Premium means clarity, hierarchy, spacing, responsiveness and reliability — not decorative complexity.
- Do not chase Shopify/Tiendanube feature parity for its own sake.
- Features should create observable merchant value; avoid “because SaaS usually has it”.
- Activation should always make the next useful step obvious; keep **Time to First Share < 10 minutes** as the current target until evidence changes it.

## Commercial model

- Preserve the role of the plan ladder: **Gratis = start/discover, VOLTA = sell, PRO = grow/decide better**.
- Exact prices/experiments may change through approved commercial decisions; do not hard-code them into permanent doctrine beyond current implementation references.
- PRO should monetize better decisions/attribution/opportunities, not arbitrary capacity pain.
- Upgrade nudges must be contextual and must not use dark patterns, fake urgency or invented proof.
- Preserve grandfathered entitlements unless an explicit approved commercial migration changes them.
- Complimentary access is privileged. If a paid provider subscription is active, provider cancellation must succeed before granting a conflicting complimentary state; fail closed.

## Security and tenant data

- Never bypass RLS in user-facing flows for convenience.
- Never trust client-provided `store_id`, `owner_id` or entitlement claims.
- Keep service-role/internal-admin capabilities out of ordinary client/request flows unless explicitly reviewed.
- Public storefront reads must not expose inactive/private merchant data.
- Product/category/brand relationships must remain tenant-scoped.
- `stores.owner_id` is a DB-enforced one-owner/one-store invariant; multi-store requires an explicit product/data decision.
- Structural DB changes use migrations. Destructive production changes require human approval plus recovery planning.
- Never commit secrets, tokens, credentials or customer personal data.

## Media

- `store-assets` is intentionally public-read storefront media. **Never place private/sensitive documents there.**
- Upload/update/delete must remain owner-scoped.
- DB RLS does not make a public Storage URL private.
- Media lifecycle is part of a mutation: when replacing/deleting media, handle Storage objects and rollback orphan uploads where practical.
- Recommended image quality should not become a needless hard blocker; VOLTA should optimize acceptable merchant media automatically.

## Links, attribution and SEO

- Public store slugs are durable shared surface. Preserve slug history/redirect behavior and query parameters.
- Product slugs are currently stable after creation; do not casually regenerate them on rename.
- Preserve `src`/UTM and campaign attribution through storefront navigation/deep links.
- Canonical production host is `https://www.voltastore.app`; apex redirect is intentional.
- Do not mark dashboards/internal/auth/billing utility routes indexable accidentally.
- Do not invent testimonials, customer counts, ratings or reviews.

## Analytics

- Storefront analytics measure **intent**, not confirmed merchant revenue unless completion is explicitly captured later.
- Keep source/campaign attribution attached to the session/event path.
- `saas_funnel_events` is server-managed and currently denies direct client access. When wiring acquisition tracking, preserve that boundary rather than opening public inserts by default.
- Do not make PRO recommendations from insufficient data and present them as certainty.

## UX and browser reliability

- Merchant-facing copy should be clear and non-technical.
- Show the visual consequence of appearance settings when practical.
- Never accept unreadable contrast as the cost of customization.
- Preserve known iOS/Safari hardenings in checkout and dark contrast unless a verified replacement is better.
- A visual bug is not resolved because a file returns `200` or a build is green; validate the rendered result.

## Architecture

- Keep business rules in server/domain/database boundaries, not scattered through UI.
- Prefer server actions/domain helpers over ad-hoc APIs unless a real integration/runtime boundary justifies an API.
- Prefer additive/targeted refactors over broad rewrites.
- Keep storefront resilient when optional merchant data is missing.
- Inspect current migrations/code/production before relying on legacy audits.

## Shipping and operations

- Before significant work is `SHIPPED`, use the smallest verification set that proves the change: tests/build/typecheck/security/data checks/critical journey/visual desktop+mobile/production as applicable.
- Avoid unnecessary Vercel previews and dummy commits. Consolidate work locally/branch-side and prefer one reviewed production release when practical.
- Distinguish clearly: prepared → tested/CI → merged to `main` → deployed → production-verified.
- Never claim a visual fix is production-verified without render-level evidence.
