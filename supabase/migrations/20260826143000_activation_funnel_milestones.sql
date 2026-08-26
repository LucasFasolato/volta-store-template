-- STORE-INIT-004: correlate anonymous acquisition sessions with authenticated activation.
-- The table remains server-managed; anon/authenticated still have no direct privileges.

alter table public.saas_funnel_events
  add column user_id uuid references public.profiles(id) on delete set null,
  add column store_id uuid references public.stores(id) on delete set null;

alter table public.saas_funnel_events
  drop constraint if exists saas_funnel_events_event_type_check;

alter table public.saas_funnel_events
  add constraint saas_funnel_events_event_type_check
  check (
    event_type = any (
      array[
        'landing_view'::text,
        'landing_primary_cta_click'::text,
        'landing_real_store_click'::text,
        'landing_pricing_view'::text,
        'landing_free_cta_click'::text,
        'landing_volta_cta_click'::text,
        'landing_pro_cta_click'::text,
        'signup_started'::text,
        'signup_completed'::text,
        'store_created'::text,
        'first_product'::text,
        'published'::text,
        'first_share'::text
      ]
    )
  );

create index saas_funnel_events_user_created_idx
  on public.saas_funnel_events(user_id, created_at)
  where user_id is not null;

create index saas_funnel_events_store_created_idx
  on public.saas_funnel_events(store_id, created_at)
  where store_id is not null;

-- Milestones describe first occurrence, so retries/races must not inflate the funnel.
create unique index saas_funnel_events_signup_completed_once_idx
  on public.saas_funnel_events(user_id, event_type)
  where user_id is not null and event_type = 'signup_completed';

create unique index saas_funnel_events_store_milestone_once_idx
  on public.saas_funnel_events(store_id, event_type)
  where store_id is not null
    and event_type = any (
      array[
        'store_created'::text,
        'first_product'::text,
        'published'::text,
        'first_share'::text
      ]
    );

comment on column public.saas_funnel_events.user_id is
  'Authenticated VOLTA user derived server-side for activation milestones; never trusted from the browser.';

comment on column public.saas_funnel_events.store_id is
  'Merchant store derived server-side for activation milestones; never trusted from the browser.';
