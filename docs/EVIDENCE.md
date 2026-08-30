# VOLTA Store — Evidence

**Last reviewed:** 2026-08-30  
**Company authority:** `VOLTA-PRD-001`  
**Portfolio classification:** `volta-foundation/registry/portfolio.yaml`

## Purpose

This document summarizes the current product evidence for VOLTA Store and the evidence required for the next meaningful product/strategy decision.

It does not replace raw analytics, merchant conversations, support observations, billing records or repository implementation truth.

It exists to answer:

> **What do we actually know, what remains uncertain, and what should we learn next?**

## Current lifecycle

**OPERATE** — moderate confidence.

Store is a real production system with published merchant storefronts, merchant billing infrastructure and operational product flows. However, implementation maturity is materially ahead of comparable evidence around activation, retained value, willingness to pay and repeatability.

OPERATE is not a claim of product-market fit or scale readiness.

## Current Primary Product Outcome

> **Establish whether real merchants can reach first meaningful distribution quickly, receive practical commercial value from the storefront/WhatsApp flow, and show enough repeated value or willingness to pay to justify increased investment.**

### Current activation metric

`first_share`

Current target:

> **Time to First Share < 10 minutes**

This remains a learning/activation target until real cohort evidence supports changing it.

`first_share` means merchant distribution intent. It is not recipient delivery and not a sale.

## Evidence profile

### Problem evidence — Early

Current product thesis is coherent and reflects a plausible recurring merchant problem:

- repeatedly sending photos/prices in chats;
- fragmented product presentation;
- incomplete/unstructured order requests;
- traditional ecommerce being heavier than needed for merchants who still close via WhatsApp.

What is not yet canonically established:

- strength/frequency of the problem across a defined primary ICP;
- comparative urgency against current alternatives;
- which merchant segment experiences the strongest problem.

### Behavior evidence — Early

Observed product behavior exists through production usage and current product data surfaces.

The new trustworthy activation funnel now measures prospectively:

`landing_view → signup_started → signup_completed → store_created → first_product → published → first_share`

However, the first comparable post-instrumentation merchant cohort is still required before drawing activation conclusions.

### Value evidence — Early / strength unknown

Store can deliver a complete value loop:

`merchant publishes → shares → shopper browses → cart → structured WhatsApp intent`

The system measures storefront intent such as product views, add-to-cart and WhatsApp checkout.

These signals are not yet sufficient to establish consistently realized merchant business value.

Important missing evidence includes:

- merchant perception of value after real use;
- whether structured WhatsApp intent improves actual selling workflow;
- whether merchants continue sharing/updating because the product remains useful;
- downstream commercial outcomes where they can be observed credibly.

### Economic evidence — Early / limited

Merchant SaaS billing is implemented and Mercado Pago payment/cancellation has historical operator validation.

Implementation of billing does not equal market-level economic evidence.

Current canonical sources do not establish a comparable cohort of independently paying merchants, conversion rate or durable willingness to pay.

### Repeatability — Unknown

No comparable evidence currently establishes that the same value loop repeats reliably across multiple relevant merchants.

### Retention — Unknown

No current canonical cohort establishes retained merchant usage or recurring value strongly enough for portfolio decisions.

### Scale evidence — Unknown

No current evidence supports a SCALE lifecycle classification.

Do not infer scale readiness from technical completeness, pricing availability or production deployment.

## First 10 merchant learning protocol

The next learning cycle should remain deliberately lightweight.

For each merchant, preserve only decision-relevant evidence such as:

- merchant/ICP category;
- acquisition source;
- signup/publish/first-share milestones where measurable;
- Time to First Share;
- where setup required help;
- what was immediately understood or confusing;
- what real task/value the merchant expected from Store;
- whether the merchant actually distributed the storefront;
- observed shopper/commercial intent where available;
- perceived value after use;
- willingness to pay / reason to upgrade or not upgrade;
- repeat usage or follow-up behavior;
- relevant direct qualitative signal.

Do not manufacture a heavy research CRM or interview process before it creates leverage.

## Decision questions for the first cohort

The first 10 learnings should help answer:

1. Which merchant profile reaches value fastest?
2. Where is the largest activation drop-off?
3. Is `first_share` a useful predictor of downstream value?
4. What does Store replace or improve in the merchant's current workflow?
5. What causes a merchant to return after publishing?
6. What problem clearly justifies paying for VOLTA?
7. Does PRO have enough real data to create credible decision advantage?
8. What product work is actually blocking value, versus distribution/sales/education?

## Promotion signals

Evidence that would justify materially increasing investment may include combinations of:

- repeated merchants reaching activation with low support;
- repeated real distribution/WhatsApp intent;
- merchants reporting meaningful workflow or commercial improvement;
- recurring product usage/updating;
- multiple independent paid conversions;
- evidence of retained paid value;
- acquisition channels showing signs of repeatability.

No single metric automatically proves readiness to scale.

## Reduce / pivot signals

Reconsider product direction or investment if repeated evidence shows combinations such as:

- merchants do not distribute after setup;
- storefront intent does not improve the selling workflow materially;
- high support remains necessary for basic activation;
- willingness to pay remains weak despite demonstrated usage;
- acquisition cost/effort is structurally disproportionate to likely value;
- the strongest merchant need lies outside the current Store thesis.

## Current rule

Until stronger evidence exists:

> **Learn from real merchants before expanding major feature breadth.**

The primary risk is not that Store lacks functionality.

The primary risk is that VOLTA continues increasing product sophistication faster than it increases evidence of real, repeatable merchant value.
