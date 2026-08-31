# VOLTA Store — Agent Entry Point

This repository operates under the **VOLTA Company OS v1**.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Canonical company context

Company-level authority lives in `LucasFasolato/volta-foundation`.

Start from the minimum relevant canonical source rather than copying global standards into this repository:

- Company OS registry: `volta-foundation/registry/canonical-documents.yaml`
- Portfolio truth: `volta-foundation/registry/portfolio.yaml`
- Product: `VOLTA-PRD-001`
- Delivery: `VOLTA-DLV-001`
- Engineering: `VOLTA-ENG-001`
- Security: `VOLTA-SEC-001`
- Agent Operations: `VOLTA-AGT-001`
- Vercel agent delivery: `VOLTA-AGT-PROFILE-VERCEL-001`
- Visual Foundation / Design when UI is materially affected: `VOLTA-VIS-001` / `VOLTA-DSN-001`

Do not depend on the superseded `volta-os` repository for current VOLTA policy.

## Before changing code

1. Read `docs/CURRENT_STATE.md`.
2. Read `docs/GUARDRAILS.md`.
3. Read `docs/OPEN_QUESTIONS.md` before proposing or implementing new product scope, packaging, activation changes or evidence-led roadmap work.
4. Read the active initiative/task relevant to the requested outcome.
5. Read `docs/WEB-DESIGN-SYSTEM.md` before changing the public marketing landing or its visual language.
6. Read relevant ADRs in `docs/decisions/` when the work touches a durable decision.
7. Inspect the actual code and recent Git history; documentation is context, not a substitute for reality.
8. Check `docs/HANDOFF.md`, open PRs and overlapping branches when concurrent work may exist.
9. Load deeper Company OS context only when scope, uncertainty or consequence requires it.

Essential product knowledge must remain portable and must not depend on Cursor, ChatGPT, Grok, Claude or another provider.

## Authority

Agents may autonomously fix bugs, improve performance, accessibility, minor UX, directly related refactors, meaningful debt and non-destructive security issues inside approved scope.

Human approval is required for material new product scope, foundational product/architecture changes, material recurring cost, destructive production operations, dangerous data migrations and major commercial-model changes unless an already-approved initiative explicitly authorizes them.

A clear human response such as `dale`, `aprobado`, `excelente, hacelo`, `continuá`, `implementalo` or equivalent to a concrete proposal is approval to execute that proposal.

### Open-question discipline

- `BLOCKING`: do not silently choose an option or ship work whose product correctness depends on the unanswered question.
- `OPEN`: continue only when the requested work is materially independent of the answer and keep the implementation reversible.
- `ANSWERED`: follow the linked decision and do not reopen it without new evidence or explicit human direction.
- Agent recommendations are analysis, not product decisions.
- When human direction answers a durable question, update `docs/OPEN_QUESTIONS.md` and reconcile the relevant ADR, `PRODUCT`, `ROADMAP`, `GUARDRAILS` and active initiative.

## Development defaults

- Use a dedicated branch for planned/significant work when isolation creates value.
- Prefer targeted improvements over broad rewrites.
- Keep business rules in server/domain layers rather than scattering them through UI.
- Preserve mobile quality and premium simplicity.
- Use migrations for structural database changes.
- Never commit secret values or customer personal data.
- Fix directly related issues when safe; document meaningful debt rather than hiding it.

## Before marking work shipped

Follow `VOLTA-DLV-001` from `volta-foundation` and use the smallest verification set that establishes real confidence.

Relevant checks include build, typecheck, lint, tests, security/data-integrity checks, desktop/mobile visual review, critical journeys, deploy status and production verification.

A visual change is not fully verified only because it compiles. `SHIPPED` means integrated and, when production applies, deployed and verified at the intended release boundary.

### Vercel deployment discipline

Follow `VOLTA-AGT-PROFILE-VERCEL-001`.

Current operational budget:

- **hard ceiling: stay below 100 Vercel builds in any rolling 24-hour period**;
- **default: one final remote deployment per coherent feature/fix/work package**;
- develop, iterate and visually inspect locally before consuming remote build capacity;
- batch coherent changes before pushes that would trigger Vercel builds;
- use an additional preview/deployment only when hosted evidence materially improves confidence and cannot be obtained credibly locally;
- coordinate concurrent agents so multiple lanes do not create redundant previews for the same work;
- avoid dummy commits, incremental redeploy loops and repeated rate-limit retries;
- docs-only changes should not intentionally consume a runtime deployment when avoidable.

> **Parallelize development; consolidate deployment.**

There is no separate legacy shipping protocol that overrides `VOLTA-DLV-001`.

Update `docs/CURRENT_STATE.md` after a material state change. Leave `docs/HANDOFF.md` only when continuation context is actually needed.

## Legacy documentation

`docs/ai/` contains the original architecture audit and remains useful historical/reference material. When it conflicts with verified current code, migrations, production reality or current Company OS/Product documentation, investigate reality and update the current canonical local source rather than silently copying stale information.
