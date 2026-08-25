-- Reconciled from the production Supabase migration history on 2026-08-25.
-- This schema exists in production; this file restores Git as the complete
-- migration source for new environments.

create table public.saas_funnel_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (
    event_type = any (
      array[
        'landing_view'::text,
        'landing_primary_cta_click'::text,
        'landing_real_store_click'::text,
        'landing_pricing_view'::text,
        'landing_free_cta_click'::text,
        'landing_volta_cta_click'::text,
        'landing_pro_cta_click'::text,
        'signup_started'::text
      ]
    )
  ),
  session_id text not null,
  traffic_source text,
  campaign text,
  device text,
  viewport_width integer,
  viewport_height integer,
  cta_location text,
  plan text,
  path text,
  created_at timestamptz not null default now()
);

comment on table public.saas_funnel_events is
  'Server-managed acquisition funnel events for VOLTA Store. No direct merchant/client privileges.';

create index saas_funnel_events_event_created_idx
  on public.saas_funnel_events(event_type, created_at desc);

create index saas_funnel_events_session_created_idx
  on public.saas_funnel_events(session_id, created_at);

alter table public.saas_funnel_events enable row level security;

revoke all on table public.saas_funnel_events from public, anon, authenticated;
