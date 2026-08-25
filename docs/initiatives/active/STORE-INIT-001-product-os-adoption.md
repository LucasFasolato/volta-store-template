# STORE-INIT-001 — Product OS Adoption

- **Status:** VERIFYING
- **Priority:** P1
- **Owner:** ChatGPT agent
- **Branch:** `chore/store-INIT-001-volta-os-adoption`
- **Started:** 2026-08-25

## Problem

Store has strong technical documentation, but context is split between historical `docs/ai`, conversations and evolving code. A new agent cannot reliably distinguish current truth, historical audit findings, roadmap direction and durable decisions without reconstructing context manually.

## Outcome

Adopt VOLTA OS v1.0 so Store can be continued safely from any compatible agent/tool with minimal conversational dependence.

## Scope

- Add portable `AGENTS.md`.
- Add machine-readable `volta.product.yaml`.
- Define Product, System, Current State, Roadmap, Debt, Guardrails and Handoff.
- Preserve and normalize the original audit.
- Add foundational Store ADRs.
- Keep `docs/ai/` as historical/reference evidence rather than delete it.
- Establish soft ownership for concurrent agents.

## Out of scope

- Fixing all audit debt in the same migration.
- Rewriting application code.
- Introducing a dashboard/CLI/issue tracker.
- Pretending unverified audit findings are already resolved.

## Acceptance criteria

- A new agent can establish current Store context from standard files.
- Current vs historical knowledge is clearly distinguished.
- Critical guardrails are explicit.
- Material debt is tracked with re-verification semantics.
- Product direction is organized as NOW/NEXT/LATER.
- Durable shopper/store-ownership decisions have ADR coverage.
- Existing historical audit detail is preserved.

## Verification

- Compare branch to latest `main` before PR.
- Review all newly authoritative documents for contradiction.
- Confirm no application runtime files changed.
- Merge through PR because this changes the operating contract of the repository.

## Next

After shipping, clear the handoff adoption lock and use the Product OS during the next real Store engineering initiative. Feed verified Store metadata back into the global `volta-os` registry.
