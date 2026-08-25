# VOLTA Store — Product

## Purpose

VOLTA Store lets a business create a professional online catalog/storefront and turn browsing into an organized order that closes through WhatsApp.

The product reduces the complexity of "selling online" for businesses that already operate through WhatsApp. A merchant should not need to understand ecommerce infrastructure to publish products, present them well and receive a structured buying intent.

## Target users

Initial fit:

- local and independent businesses;
- merchants already using WhatsApp as a primary sales channel;
- businesses with product catalogs but no structured online storefront;
- non-technical operators who value speed and presentation quality.

## Problem

Typical merchants face fragmented product presentation, repetitive conversations, slow answers, unstructured orders and excessive dependence on manual WhatsApp handling.

## Value proposition

**Create a store that looks professional, share it and receive organized orders in WhatsApp without operating a traditional ecommerce stack.**

## Core customer journey

1. Merchant signs in.
2. VOLTA ensures the initial store context exists.
3. Merchant configures identity, WhatsApp, content and appearance.
4. Merchant creates categories/products and publishes a storefront.
5. A shopper opens the public store, browses and adds products to cart.
6. VOLTA builds a structured order message.
7. The shopper hands the order to the merchant through WhatsApp.

## Current product capabilities

The repository currently contains:

- Supabase authentication with Google OAuth and magic-link support;
- protected admin experience;
- store configuration/content editing;
- category and product administration;
- product media through Supabase Storage;
- extensive appearance/layout customization and live-preview patterns;
- public storefront by durable store slug;
- browser-local persisted cart;
- WhatsApp order handoff;
- commercial/billing surface including Mercado Pago return handling and paid-plan welcome experience;
- corporate/marketing landing at the root product domain.

Capabilities above are source-derived from the repository/audit and recent main commits. Product OS must be updated when implementation changes materially.

## Product principles

- Hide operational complexity from the merchant.
- Make the next useful action obvious.
- Premium presentation is part of conversion, not decoration.
- Mobile storefront quality is first-class.
- Commerce should remain simple and understandable.
- Configuration should show its visual consequence whenever practical.
- Avoid technical language in merchant-facing UI.
- Reliability, speed and data integrity are product features.

## Non-goals — current stage

Unless a future approved initiative changes direction, Store is not trying to become:

- a generic enterprise ecommerce ERP;
- a marketplace aggregating multiple merchants;
- a complex omnichannel order-management suite;
- a feature-dense platform that forces merchants to configure technical primitives;
- a traditional payment checkout replacing the WhatsApp handoff as the core purchase flow.

Billing VOLTA merchants for use of the SaaS is separate from shopper checkout.

## Commercial model

VOLTA Store is a SaaS product. The repository includes billing/commercial-access concepts; exact pricing and commercial experiments may evolve and should not be hard-coded into long-lived product doctrine unless explicitly decided.
