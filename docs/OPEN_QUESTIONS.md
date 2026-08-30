# VOLTA Store — Open Product Questions

**Last reviewed:** 2026-08-30  
**Authority:** `docs/CURRENT_STATE.md` defines what exists; `docs/ROADMAP.md` defines intentional direction; this file defines unresolved human product decisions. Company-level authority lives in `LucasFasolato/volta-foundation`.

## Status contract

- `BLOCKING`: agents must not silently decide the answer or ship scope that depends on it.
- `OPEN`: independent work may continue; preserve reversibility.
- `ANSWERED`: link the durable decision and do not reopen it without new evidence or explicit direction.

Store's current landing and Activation 2.0 remain frozen pending real conversion/customer evidence. These questions are not permission to redesign them speculatively.

### STORE-Q001 — First-10-customer ICP
- **Status:** BLOCKING for vertical-specific product expansion; OPEN for current core work.
- **Question:** Which merchant profile should dominate the next 10 real customer learnings?
- **Candidates:** apparel/Instagram-first sellers, gastronomy, local retail, another explicitly chosen segment.
- **Why it matters:** determines onboarding language, examples, templates, support learning and future feature priority.
- **Recommendation:** choose one primary learning cohort while keeping the core storefront generic enough for adjacent merchants.
- **Decision:** Pending.

### STORE-Q002 — Durable activation / North Star
- **Status:** OPEN
- **Question:** Does `first_share` remain the principal activation event, or should Store graduate toward a downstream value event such as qualified WhatsApp purchase intent or repeat merchant usage?
- **Current truth:** `first_share` is the trustworthy activation milestone today; storefront analytics measure intent, not confirmed sales.
- **Recommendation:** keep `first_share` while the first real merchant cohort accumulates, but instrument downstream value separately before changing the North Star.
- **Decision:** Pending.

### STORE-Q003 — How customer learning becomes product evidence
- **Status:** ANSWERED for the current learning cycle.
- **Question:** What lightweight process will capture the first 10 merchant learnings so they become durable evidence instead of chat history?
- **Decision:** Use `docs/EVIDENCE.md` as the product-level evidence summary and preserve merchant-specific observations in a lightweight structured source linked from it. Capture only decision-relevant facts: acquisition source, setup friction, Time to First Share, support needed, perceived value, willingness to pay, observed commercial outcome and follow-up/repeat usage where available.
- **Rationale:** VOLTA Product OS requires evidence to improve decisions, not ceremony. A single evidence summary plus bounded merchant records prevents both chat dependency and unnecessary CRM/research bureaucracy.

### STORE-Q004 — Core paid-plan value
- **Status:** OPEN; BLOCKING before major packaging changes.
- **Question:** What customer problem most clearly justifies upgrading from Gratis to VOLTA?
- **Candidates:** catalog growth, richer merchandising/media, distribution, operational convenience, commercial measurement.
- **Recommendation:** let real limit encounters and merchant interviews determine the primary upgrade story; do not manufacture artificial pain.
- **Decision:** Pending.

### STORE-Q005 — PRO value proposition
- **Status:** OPEN; BLOCKING before broad PRO expansion.
- **Question:** What evidence-backed decision advantage justifies VOLTA PRO?
- **Recommendation:** keep PRO centered on useful commercial intelligence only when a merchant has enough traffic/campaign data for recommendations to be credible.
- **Decision:** Pending.

### STORE-Q006 — Revenue truth in the funnel
- **Status:** OPEN
- **Question:** When should checkout/paid-plan/revenue events join the acquisition → activation funnel, and what exact event counts as commercial truth?
- **Current truth:** WhatsApp handoff is intent, not proof of a completed shopper sale; SaaS billing exists separately.
- **Recommendation:** extend the funnel only when identity, idempotency and semantics are as trustworthy as the current activation milestones.
- **Decision:** Pending.

### STORE-Q007 — Shared VOLTA commercial model
- **Status:** OPEN
- **Question:** Should Store's `Gratis / VOLTA / PRO` vocabulary remain product-specific or become an ecosystem standard?
- **Recommendation:** keep it product-specific unless Strategy/Product evidence across several VOLTA products demonstrates that a shared commercial vocabulary creates real leverage. `volta-foundation` is the authority for any future cross-product policy.
- **Decision:** Pending at company/product-strategy level.

## Agent rule

If requested work depends on a pending `BLOCKING` question, surface the dependency and work only on reversible analysis/preparation unless the current human instruction or an approved initiative supplies the missing decision.
