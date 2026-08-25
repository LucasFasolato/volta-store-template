# VOLTA Store — Roadmap

This roadmap is intentional direction, not an inventory of ideas. Already-shipped work is not repeated here as future scope.

## NOW

### Measure acquisition → activation end to end

`STORE-INIT-003` shipped the landing-side acquisition layer through `signup_started`. Extend it cleanly through:

- `signup_completed`;
- `store_created`;
- `first_product`;
- `published`;
- `first_share`;
- pricing/checkout/paid-plan transitions where the event contract is clear.

Primary activation target: **Time to First Share < 10 minutes**. First establish trustworthy measurement; do not optimize against guessed numbers.

### First 10 real customer learnings

Use the frozen landing + Activation 2.0 + Share Engine with real merchants. Observe where they hesitate, what they understand, what they value and why they would or would not pay. Prefer evidence and support friction over speculative feature breadth.

### Activation 2.x only from evidence

Do not redesign onboarding pre-emptively. Use funnel drop-off and session observation to decide whether the current **Negocio → Portada → Producto → Publicar → Compartir** journey needs another pass.

## NEXT

### Contextual feature discovery

After a user unlocks value, surface small contextual nudges rather than a long tour. Examples:

- Products: what the plan newly enables.
- Compartir: QR/measurable links.
- Rendimiento: newly available performance/attribution value.

### Usage-based upgrade psychology

Keep prompts tied to real need:

- catalog growth → VOLTA;
- meaningful traffic/data → PRO;
- no dark patterns or arbitrary artificial pain.

### PRO decision intelligence

Extend PRO only where data can support better decisions: channel comparison, campaign attribution, opportunities and recommendations. Do not sell “intelligence” to users without enough signal.

### Public performance/SEO revalidation

When data warrants it:
- evaluate storefront cache/revalidation strategy;
- recheck Search Console canonical/index status;
- decide whether public merchant storefronts belong in sitemap/indexing strategy.

## LATER

- operational/bulk catalog tools only after repeated merchant pain is observed;
- automation opportunities after distribution/measurement/intelligence are working;
- targeted refactors of oversized admin surfaces;
- deeper media/performance optimization based on measured cost;
- growth toward 20–30 paid merchants, with progressively more effort shifted from building to selling/observing/learning.

## Landing freeze

Landing Conversion Polish 1.0 is complete. Do **not** reopen structural redesign or visual churn without conversion data, real merchant/customer feedback or a concrete product-positioning change.

## Explicitly not prioritized

- marketplace;
- ERP/complex stock management;
- shopper card checkout replacing WhatsApp;
- giant ads manager;
- enterprise infrastructure without scale evidence;
- feature parity with Shopify/Tiendanube for its own sake.
