# VOLTA Store — Guardrails

These are product/system invariants. They are intentionally stronger than implementation preferences.

## Security and data

- Never bypass RLS in user-facing flows for convenience.
- Never trust client-provided `store_id`, `owner_id` or equivalent ownership claims.
- Never expose inactive/private merchant data through public queries.
- Treat service-role/admin clients as privileged capabilities and keep them out of ordinary request-time user flows unless there is an explicit, reviewed reason.
- Never assume Supabase Storage privacy because a related DB row is protected by RLS.
- Never commit credentials, secret values, tokens or customer personal data.
- Structural DB changes belong in migrations; destructive production changes require explicit human approval and a rollback/backup strategy.

## Data integrity

- Preserve the effective one-merchant/one-store product assumption until an accepted decision changes the model; do not accidentally create duplicate stores.
- Do not change public slug semantics casually; public links are durable product surface.
- Theme/layout/content records require valid store ownership relationships.
- Product/category relationships must remain tenant-scoped.
- Decide Storage object lifecycle when deleting media-backed records; DB deletion alone is not automatically complete.
- Billing/commercial access must not be inferred from untrusted client state.

## Product UX

- Keep merchant-facing copy clear and non-technical.
- Do not hide the visual consequence of design settings when a preview is practical.
- Never accept unreadable contrast as the cost of customization.
- Mobile storefront quality is first-class; visual polish cannot degrade usability.
- First-run and activation experiences should make the next useful step obvious.
- Premium means clarity, spacing, consistency and responsiveness — not decorative complexity.
- Avoid native/browser interaction patterns when they materially break the established premium product language and an appropriate controlled component exists.

## Architecture

- Prefer server actions/domain helpers over ad-hoc API routes unless a real integration/runtime boundary justifies an API.
- Keep business rules in server/domain layers rather than scattering them through components.
- Prefer additive/targeted refactors over broad rewrites.
- Keep public storefront resilient when optional merchant fields are absent.
- Inspect current migrations and code before relying on the original audit; the repository evolves.

## Performance

- Performance is product quality.
- Optimize public reads and client payload when evidence indicates scale cost, but do not trade away correctness, isolation or freshness accidentally.
- Avoid shipping expensive global assets/fonts/interactions to routes that do not need them.

## Shipping

Before significant Store work is `SHIPPED`, apply relevant checks from VOLTA OS: build/typecheck/lint/tests, security/data review, visual desktop/mobile checks, critical-flow smoke tests and production verification where applicable.
