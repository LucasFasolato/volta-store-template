# VOLTA Store — Web Design System 2.1

Store is the commercial/light expression of the **VOLTA Company OS v1 Visual Foundation + Design System**. It should feel related to Corporate, Booking and Portfolio without becoming a clone.

Company-level visual authority lives in `LucasFasolato/volta-foundation`:

- `VOLTA-VIS-001` — foundational visual grammar;
- `VOLTA-DSN-001` — shared product experience rules;
- `VOLTA-BRD-001` — brand meaning and behavior.

This file owns **Store-specific expression and landing composition** only. It does not redefine VOLTA's foundational color, typography or visual grammar.

## Current migration status

Store predates the approved Visual Foundation v1 and still contains legacy implementation values in production, including `#12E89A` and several pre-v1 font choices.

Those values are **known Design Debt**, not a competing Company OS standard.

Do not trigger a broad visual rewrite merely to replace tokens. Adoption is incremental:

- new or materially redesigned VOLTA-owned surfaces SHOULD start from the current Visual Foundation;
- touched legacy surfaces SHOULD converge when doing so does not create disproportionate scope/risk;
- merchant-configurable storefront typography remains product/user expression and is not required to use the corporate UI font;
- changes must preserve current conversion/product behavior and receive render-level verification.

The canonical VOLTA Company OS v1 brand anchor is **VOLTA Green `#00E878`** and the foundational company/product UI family is **Instrument Sans Variable**. Store-specific secondary accents, merchant-selected fonts and bounded expression may vary within the approved system.

## Product landing contract

The landing sells one result: **a professional online store that turns product choice into an ordered WhatsApp conversation**.

Approved hero promise:

> **Tu tienda online, lista para vender por WhatsApp.**

Store is a retrofit benchmark, not a blank-slate redesign. Preserve proven commercial clarity, the real-store proof, plan truth, acquisition analytics and the WhatsApp handoff proposition.

## Primary structure

Store Landing 2.1 has exactly six primary chapters unless evidence justifies an information-architecture change:

1. Hero / product moment
2. How it works — `Cargá → Compartí → Vendé`
3. Product experience
4. Real-store proof
5. Pricing
6. Final CTA

FAQ/documentation chapters do not belong in the default commercial flow unless conversion evidence establishes a real objection that cannot be answered more compactly.

## Store personality

- light-first commerce surface;
- purposeful dark product chapter;
- product photography and product UI over abstract SaaS diagrams;
- VOLTA Green used as an intentional action/identity signal rather than wallpaper;
- generous but efficient whitespace;
- high-confidence, merchant-facing language;
- no invented testimonials, counters, ratings or sales claims.

## Shared VOLTA grammar

Store inherits from Visual Foundation v1:

- canonical primary brand anchor: `#00E878`;
- sophisticated neutral foundation;
- Instrument Sans Variable for VOLTA-owned product/corporate UI where the migration surface is current;
- The Shift as the foundational visual hook, used quietly in functional product surfaces;
- refined geometry with controlled softness;
- primitive → semantic → component token architecture;
- WCAG 2.2 AA baseline;
- product UI remains calmer than expressive brand surfaces.

Store-specific implementation SHOULD consume semantic roles rather than scattering raw brand primitives through components as the system evolves.

## Product Moment

The decisive Store moment is:

`Producto → carrito → WhatsApp`

The hero/demo should make that relationship understandable before the visitor reads feature copy.

## Content budget

- H1: one short promise;
- hero body: roughly 2–3 lines on desktop;
- no more than 3 trust signals in hero;
- one dominant CTA per viewport;
- how-it-works: exactly 3 steps;
- product chapter: max 4 major benefits;
- pricing: current product/commercial configuration is authoritative;
- no long FAQ or repeated feature chapters by default.

## Mobile/accessibility

- visible controls target at least 44px;
- safe-area insets must protect top/bottom controls;
- sticky acquisition CTA remains hidden while hero, pricing or final CTA is visible;
- do not rely on green alone to communicate meaning;
- preserve reduced-motion behavior and readable contrast;
- no horizontal overflow at representative 375/390/430 widths.

## Merchant storefront expression

The Store admin allows merchants to choose visual presentation for their own storefront.

That is user authorship, not VOLTA brand drift.

VOLTA still owns structural quality:

- readable contrast;
- responsive behavior;
- safe spacing and hierarchy;
- bounded typography/layout controls;
- robust fallback behavior;
- accessible controls.

Do not remove merchant expression merely to make every published store look like VOLTA Corporate.

## Analytics

Preserve the current acquisition contract:

- `landing_view`;
- `landing_primary_cta_click`;
- `landing_real_store_click`;
- `landing_pricing_view`;
- `landing_free_cta_click`;
- `landing_volta_cta_click`;
- `landing_pro_cta_click`.

Do not rename events for visual refactors without an analytics migration decision.

## Acceptance criteria

A Store landing change is not complete unless:

- the value proposition is understandable quickly;
- the six-chapter information architecture remains unless an approved evidence-backed change says otherwise;
- the real-store destination still works;
- plan/pricing facts come from current product configuration;
- OAuth root callback behavior remains intact;
- acquisition analytics remain intact;
- mobile controls and safe areas remain first-class;
- no unsupported proof or deferred product capability is advertised;
- applicable Company OS visual decisions are respected for the changed surface;
- relevant verifier/tests/build pass;
- visible changes receive render-level desktop/mobile verification proportional to scope.

## Shipping

Shipping/verification authority is `VOLTA-DLV-001` in `volta-foundation`.

Use the smallest sufficient verification set for the actual change. Remote previews/deployments are evidence tools, not mandatory ceremony.
