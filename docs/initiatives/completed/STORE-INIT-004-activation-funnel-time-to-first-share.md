# STORE-INIT-004 — Activation Funnel & Time to First Share

- **Status:** SHIPPED
- **Priority:** P0
- **Started:** 2026-08-26
- **Merged:** 2026-08-26
- **Production verified:** 2026-08-26
- **Runtime merge:** `2f7a02ef0641d02f176da316b2aa1d4803620a02`
- **Verified production deployment:** `dpl_E9JPaVfTwk1pS1ssU8k9ckYBHf4F`

## Outcome

Extended VOLTA Store measurement from acquisition into activation so the team can observe the real journey from landing through first distribution instead of guessing where merchants drop off. **Time to First Share < 10 minutes** remains the current activation target; the metric is only shown when session joins are trustworthy enough to compute it.

## Delivered

- Added `signup_completed`, `store_created`, `first_product`, `published` and `first_share` to the server-managed SaaS funnel.
- Added server-derived `user_id` / `store_id` correlation without accepting tenant identity from the browser.
- Preserved anonymous session/source/campaign context across auth redirects and tabs with bounded first-party cookies.
- Recorded `store_created` only when a Store row is genuinely created.
- Recorded `first_product` and first publish from durable database transitions, with transaction-safe dedupe.
- Recorded `first_share` only after a real merchant distribution action succeeds (copy/native share) or WhatsApp navigation is deliberately initiated; it does not claim recipient delivery or a completed sale.
- Added a protected `/internal/funnel` view for 7/30/90 days with stage conversion, Time to First Share, store→share time, join coverage and source/device segmentation.
- Added activation-funnel tests and kept direct client privileges on `saas_funnel_events` denied.

## Data migration

Production migration `activation_funnel_milestones`:

- added nullable `user_id` and `store_id` foreign keys;
- expanded the event-type constraint;
- added indexes and partial unique milestone indexes;
- added DB triggers for first product and first publish.

Post-migration verification confirmed both columns, both unique indexes and both triggers exist. Supabase Security Advisor returned only the pre-existing `Leaked Password Protection Disabled` warning; this project uses passwordless auth and the migration introduced no new security advisory.

## Verification

- PR #59 was squash-merged after Vercel preview builds reached `READY` on the final head.
- The test suite reached 50 passing tests during CI; subsequent fixes were type-safety/client-tracking refinements and the final Vercel head build/typecheck completed successfully.
- Production deployment `dpl_E9JPaVfTwk1pS1ssU8k9ckYBHf4F` is `READY` on runtime SHA `2f7a02ef0641d02f176da316b2aa1d4803620a02` and aliases both production domains.
- Production build includes `/internal/funnel` and `/api/analytics/saas`.
- Anonymous access to `/internal/funnel` resolves to the login surface, confirming the internal-admin route is not publicly exposed.
- No error/fatal runtime logs were observed for the verified production deployment.
- Existing acquisition rows remain intact after migration. New activation milestones will accumulate prospectively; old merchants are not backfilled into a fake activation cohort.

## Measurement contracts

- `signup_completed`: first successful signup/auth completion for a new user, not every login.
- `store_created`: a new Store row was actually created for that owner.
- `first_product`: first persisted product for a store.
- `published`: first transition into published + active.
- `first_share`: merchant deliberately distributes/copies/opens a share action from VOLTA; not delivery and not sale.
- Missing cross-browser/session joins remain visible as lower join coverage instead of being guessed.

## Follow-up

Use real merchant sessions to collect enough activation data before changing Activation 2.x. The next product question is no longer “where do we think users drop?” but “where does the measured cohort actually drop, and why?”
