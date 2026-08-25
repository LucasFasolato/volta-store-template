# VOLTA Store — Agent Entry Point

This repository is operated under **VOLTA OS v1.0**.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Before changing code

1. Read `docs/CURRENT_STATE.md`.
2. Read `docs/GUARDRAILS.md`.
3. Read the active initiative/task relevant to the requested outcome.
4. Read relevant ADRs in `docs/decisions/` when the work touches a durable decision.
5. Inspect the actual code and recent Git history; documentation is context, not a substitute for reality.
6. Check `docs/HANDOFF.md`, open PRs and overlapping branches when concurrent work may exist.

For global operating rules, authority, security and shipping conventions, use the `volta-os` repository. Essential product knowledge must remain portable and must not depend on Cursor, ChatGPT, Grok or another provider.

## Authority

Agents may autonomously fix bugs, improve performance, accessibility, minor UX, directly related refactors, meaningful debt and non-destructive security issues.

Human approval is required for material new product scope, foundational product/architecture changes, material recurring cost, destructive production operations, dangerous data migrations and major commercial-model changes unless an already-approved initiative explicitly authorizes them.

A clear human response such as `dale`, `aprobado`, `excelente, hacelo`, `continuá`, `implementalo` or equivalent to a concrete proposal is approval to execute that proposal.

## Development defaults

- Use a dedicated branch for planned/significant work.
- Prefer targeted improvements over broad rewrites.
- Keep business rules in server/domain layers rather than scattering them through UI.
- Preserve mobile quality and premium simplicity.
- Use migrations for structural database changes.
- Never commit secret values or customer personal data.
- Fix directly related issues when safe; document meaningful debt rather than hiding it.

## Before marking work shipped

Use the smallest verification set that establishes real confidence. Relevant checks include build, typecheck, lint, tests, security/data-integrity checks, desktop/mobile visual review, critical journeys, deploy status and production verification.

A visual change is not fully verified only because it compiles. `SHIPPED` means integrated and, when production applies, deployed and verified.

Update `docs/CURRENT_STATE.md` after a material state change. Leave `docs/HANDOFF.md` only when continuation context is actually needed.

## Legacy documentation

`docs/ai/` contains the original architecture audit and remains useful historical/reference material. When it conflicts with verified current code or the new Product OS documents, investigate reality and update the authoritative Product OS rather than silently copying stale information.
