# VOLTA Store Decisions

ADRs record durable decisions that future agents might otherwise reopen without context.

## Rules

- Use ADRs for architecture, durable product behavior, major UX/product contracts and model decisions.
- Accepted ADRs are historical records; do not rewrite history to make an old decision look current.
- If a decision changes, add a new ADR that `supersedes` the prior one.
- Record rejected alternatives when they are likely to be proposed again.
- Implementation details that are cheap to change do not need ADR ceremony.
