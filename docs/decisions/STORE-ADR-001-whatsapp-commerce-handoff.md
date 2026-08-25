# STORE-ADR-001 — WhatsApp as the shopper commerce handoff

- **Status:** ACCEPTED
- **Decision class:** Product / architecture
- **Source:** Existing product architecture and product definition

## Context

VOLTA Store targets merchants who already sell and communicate through WhatsApp. The product's value is to structure discovery, product presentation, cart intent and order preparation without forcing the merchant into a traditional ecommerce operating model.

## Decision

The core shopper purchase flow culminates in a structured WhatsApp handoff to the merchant. The storefront/cart prepares the order; WhatsApp remains the primary close/communication channel at this stage.

VOLTA merchant SaaS billing (for example Mercado Pago commercial access) is a separate concern and does not change this shopper-flow decision.

## Why

- aligns with merchant behavior and the original product promise;
- reduces implementation/operational complexity for small merchants;
- preserves human selling/support where it adds value;
- keeps shopper checkout understandable.

## Consequences

- WhatsApp availability/contact correctness is conversion-critical.
- Shopper orders are not automatically equivalent to server-side paid orders.
- Analytics should distinguish cart/WhatsApp intent from completed merchant sales unless completion is explicitly captured later.

## Alternatives rejected for now

A full generic payment/order-management checkout replacing WhatsApp as the default close is outside current Store scope.
