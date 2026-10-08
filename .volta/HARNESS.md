# VOLTA execution harness — protocol 1.0.0

Operational implementation companion to the approved VOLTA Company OS. Canonical policy stays in [volta-foundation](https://github.com/LucasFasolato/volta-foundation/blob/main/registry/canonical-documents.yaml); this protocol does not change authority, approvals, product boundaries or runtime choices. Local product instructions remain material context. The human directs outcomes and acceptance; agents implement and verify within granted scope.

## Execution loop

1. Recover current repository state: branch, HEAD, uncommitted changes, concurrent PRs and owning issue. Preserve other work. Read AGENTS.md, the local adapter and only the context that affects the task.
2. State intended outcome, bounds and sufficient evidence. Discover before asking. Resolve routine implementation decisions autonomously. Escalate only a missing consequential decision or unavailable authority.
3. Implement one coherent work package. Use runtime-native tools and the adapter's actual commands. Do not introduce abstractions, infrastructure, providers or dependencies without a demonstrated need.
4. Verify the affected behavior and plausible failure paths proportionally. For visible changes inspect the critical journey and relevant mobile/desktop views. For authorization verify both allow and deny. A structural harness check is not a product test.
5. Reconcile durable docs with actual behavior; retain source revisions and material decisions. Do not copy Company OS into every repo or preserve conversation transcripts as current truth.
6. Integrate and release only within the session's authority and local release policy. Follow the applicable Vercel delivery profile: local first, one coherent final release by default, coordinate remote build capacity. Never use green CI alone as production or product acceptance evidence.
7. Report outcome, changes, verification actually executed, exact revision, current docs and remaining decisions/limitations. Put execution evidence in GitHub and give the human a direct way to test the product.

## Evidence vocabulary

- Proposed: direction or design awaiting decision.
- Implemented: code exists at a stated revision.
- Verified locally: named checks passed with recorded environment/coverage.
- Integrated: accepted into the stated branch.
- Deployed: hosted revision independently observed.
- Product accepted: human/real-use criteria supported by evidence.

These are separate claims. GitHub activity does not measure founder effort, unseen conversations, local unpushed work, user activity or commercial value.

## Handoff format

Result sought; current state and source revisions; scope and constraints; current implementation/PR; verified checks; unresolved failure/risk; next useful decision. Transfer state, not a full transcript. Work, Codex and Claude Code can all use the same neutral context; optional vendor entry files only route to it.

## Local adapter

`.volta/harness.json` declares repository identity, branch model, entry documents and existing verification script names. `.volta/check.mjs` checks this declaration, local paths and routing. `--verify` runs the declared local baseline checks; browser/security/data checks remain task-dependent and require their actual environment. It never chooses product priorities, grants privileges, sends messages, deploys, migrates or substitutes for source-specific tests.

Implementation source: volta-control/harness. Versioned portable copies are intentional tooling distribution, not parallel policy. Changing global policy still follows the Company OS change model.
