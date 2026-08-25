# STORE-ADR-004 — Commercial plan ladder and grandfathering

- **Status:** ACCEPTED
- **Decision class:** Product / commercial architecture
- **Source:** Current plan implementation, commercial migrations and approved product direction

## Context

VOLTA Store needs a free entry point, a practical selling plan and a growth/intelligence tier without turning product complexity or artificial limits into the value proposition.

## Decision

Preserve the semantic ladder:

- **Gratis:** start and discover VOLTA;
- **VOLTA:** sell with the complete practical selling toolkit;
- **VOLTA PRO:** grow through attribution, opportunities, comparison and better decisions.

Exact prices, promotional cycles and bounded limits are commercial configuration and may change through approved decisions. They are not frozen by this ADR.

PRO should primarily monetize **decision quality/intelligence**, not arbitrary capacity restrictions.

Existing eligible early users are protected by grandfathered access; silently removing grandfathered value requires explicit commercial approval and migration planning.

## Consequences

- Free must remain useful enough to reach value before upgrade.
- VOLTA upgrade prompts should correspond to real selling needs.
- PRO should be promoted when merchant traffic/data makes its intelligence useful.
- New packaging must preserve entitlement consistency across UI, DB enforcement, billing provider and return/recovery flows.
- Shopper checkout/payment remains independent from merchant SaaS billing.
