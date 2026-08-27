# VOLTA Store — Web Design System 2.0

Store is the commercial/light expression of **VOLTA Web Design System 2.0**. It should feel related to Corporate, Booking and Portfolio without becoming a clone.

## Product landing contract

The landing sells one result: **a professional online store that turns product choice into an ordered WhatsApp conversation**.

Approved hero promise:

> **Tu tienda online, lista para vender por WhatsApp.**

Store is a retrofit benchmark, not a blank-slate redesign. Preserve proven commercial clarity, the real-store proof, plan truth, acquisition analytics and the WhatsApp handoff proposition.

## Primary structure

Store Landing 2.1 has exactly six primary chapters:

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
- VOLTA green means action, active state or confirmation;
- generous but efficient whitespace;
- high-confidence, merchant-facing language;
- no invented testimonials, counters, ratings or sales claims.

## Shared VOLTA grammar

- canvas: `#F6F8F5` family;
- ink/dark: `#07120F` family;
- primary green: `#12E89A`;
- tight display tracking and strong hierarchy;
- pill primary/secondary CTAs with minimum ~44px touch targets;
- product moments explain causality rather than decorate;
- cards only when the content is actually an object;
- mobile is a primary layout, not stacked desktop;
- dark sections must communicate product/operation/result, not generic “tech”.

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
- exactly six primary chapters remain unless an approved evidence-backed IA change says otherwise;
- the real-store destination still works;
- plan/pricing facts come from current product configuration;
- OAuth root callback behavior remains intact;
- acquisition analytics remain intact;
- mobile controls and safe areas remain first-class;
- no unsupported proof or deferred product capability is advertised;
- relevant verifier/tests/build pass.

## Shipping budget

Follow `volta-os/governance/SHIPPING-PROTOCOL.md`: one requirement = one production deploy from `main`; preview target 0 and normally no more than one when genuinely necessary.
