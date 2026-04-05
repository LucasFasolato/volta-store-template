# VOLTA Product Roadmap

## Top 10 High-Impact Features

1. Launch checklist with completion score  
   Why: turns setup into a guided flow and improves activation.

2. Publish readiness gate  
   Why: prevents sharing stores without slug, WhatsApp, products, and key trust fields.

3. Basic analytics dashboard  
   Why: show visits, product opens, add-to-cart events, and WhatsApp clicks.

4. Shareable preview and publish workflow  
   Why: gives confidence before sending the public link to customers.

5. Starter store templates by vertical  
   Why: speeds time-to-value for non-technical users.

6. Catalog scaling tools  
   Why: pagination, sorting, and bulk actions become necessary as merchants grow.

7. Media pipeline hardening  
   Why: image compression, cleanup, and safer asset handling improve performance and cost.

8. Trust block management  
   Why: hours, address, Instagram, and support details should visibly improve conversion.

9. Theme history or draft restore  
   Why: users experiment more when edits feel reversible.

10. Share-safe slug change flow  
    Why: protect existing links and reduce support friction when rebranding.

## UX Improvements

- Add a persistent setup checklist in `/admin`.
- Make readiness visible on the main dashboard.
- Surface auth callback errors and next steps on `/login`.
- Replace `confirm()` with first-class dialogs.
- Reduce repeated admin wrappers and keep action areas consistent.
- Keep the most important store identity fields editable from the dashboard summary.
- Show why a store is not ready to share, not just what is missing.

## Conversion Improvements

- Show operational trust signals more intentionally on the storefront.
- Make WhatsApp availability feel reliable before checkout starts.
- Highlight featured products with clearer commerce intent, not only visual polish.
- Add click tracking for CTA, product detail open, add-to-cart, and WhatsApp handoff.
- Add a simple publish/share panel with copyable store link and status.
- Use admin prompts that push users toward first product, first image, and first share.

## Premium Feel Improvements

- Remove remaining browser-native interactions from admin.
- Tighten success, error, and pending states into one consistent interaction model.
- Keep admin copy short, clear, and non-technical.
- Reduce component sprawl by using stronger page structure and fewer ad-hoc wrappers.
- Preserve live previews, but move implementation toward smaller, more testable parts.
- Improve perceived speed with caching, lazy-loaded heavy interactions, and lighter font payloads.

## Recommended Delivery Order

### Phase 1: Scale Safety

- Enforce one-store-per-user in DB
- Transactional onboarding bootstrap
- Storage strategy decision
- Composite indexes for storefront reads
- Login error surfacing

### Phase 2: Activation and Conversion

- Launch checklist
- Publish readiness gate
- Basic analytics
- Share/publish panel
- Trust block improvements

### Phase 3: Merchant Expansion

- Catalog scaling tools
- Vertical templates
- Theme history/drafts
- Safer slug migration flow
