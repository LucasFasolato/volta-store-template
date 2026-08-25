# VOLTA Store Product OS

This directory is the operational source of truth for VOLTA Store under VOLTA OS v1.0.

## Read order

1. `CURRENT_STATE.md` — what is true and active now.
2. `PRODUCT.md` — why Store exists and what it is intended to do.
3. `SYSTEM.md` — concise technical architecture and critical flows.
4. `GUARDRAILS.md` — invariants that must not be casually broken.
5. `ROADMAP.md` — intentional direction: NOW / NEXT / LATER.
6. `DEBT.md` — material known technical debt.
7. `decisions/` — durable decisions and their rationale.
8. `initiatives/` — work that needs continuity across sessions or agents.
9. `audits/` — historical audit snapshots.
10. `HANDOFF.md` — only current continuation context, not a permanent history.

## Source hierarchy

When sources disagree, use this order while distinguishing bugs from intended behavior:

1. explicit current human instruction;
2. verified production/external reality;
3. current code on the authoritative branch;
4. accepted ADR/fundamental contract;
5. current Product OS documentation;
6. roadmap;
7. historical documentation such as `docs/ai/`;
8. conversation history.

The repository and production behavior remain inspectable facts; neither should be assumed correct merely because they currently behave a certain way.
