# VOLTA Store — Roadmap

This roadmap is intentional direction, not an inventory of ideas. Already-shipped work is not repeated here as future scope.

## NOW

### First 10 real customer learnings

`STORE-INIT-004` shipped trustworthy acquisition → activation measurement through first share. Use the frozen landing + Activation 2.0 + Share Engine with real merchants and observe:

- where they hesitate;
- what they understand without help;
- how long they take to reach first share;
- what they value;
- why they would or would not pay.

Prefer evidence and support friction over speculative feature breadth.

### Activation 2.x only from measured drop-off

Do not redesign onboarding pre-emptively. Use `/internal/funnel`, support observation and real sessions to decide whether the current **Negocio → Portada → Producto → Publicar → Compartir** journey needs another pass.

Primary activation target remains **Time to First Share < 10 minutes** until evidence justifies changing it.

### Protect measurement quality while data accumulates

- Treat join coverage explicitly; do not invent cross-browser attribution.
- Keep `first_share` as merchant distribution intent, not recipient delivery or sale.
- Do not backfill old merchants into a fake activation cohort.
- Add checkout/paid-plan transitions to the SaaS funnel only when identity and idempotency semantics are equally trustworthy.

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
