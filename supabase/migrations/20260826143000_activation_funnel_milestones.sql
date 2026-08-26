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

-- Product creation is already a tenant-checked server mutation. Capture the real
-- first product at the database boundary so imports/future write paths cannot
-- silently bypass activation measurement. A transaction-scoped advisory lock on
-- the store id serializes concurrent first inserts without fighting the FK row lock.
create or replace function public.record_first_product_saas_milestone()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id_value uuid;
  product_count bigint;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.store_id::text, 91004));

  select owner_id
    into owner_id_value
    from public.stores
   where id = new.store_id;

  select count(*)
    into product_count
    from public.products
   where store_id = new.store_id;

  if product_count = 1 and owner_id_value is not null then
    insert into public.saas_funnel_events (
      event_type,
      session_id,
      user_id,
      store_id,
      path
    ) values (
      'first_product',
      'auth-' || owner_id_value::text,
      owner_id_value,
      new.store_id,
      '/db/products'
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.record_first_product_saas_milestone() from public, anon, authenticated;

drop trigger if exists products_record_first_product_saas_milestone on public.products;
create trigger products_record_first_product_saas_milestone
after insert on public.products
for each row execute function public.record_first_product_saas_milestone();

-- Publication is a durable store state transition. Record only transitions into
-- the published+active state; the partial unique index makes later republish
-- cycles no-ops for activation measurement.
create or replace function public.record_published_saas_milestone()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published'
     and new.is_active = true
     and (old.status is distinct from 'published' or old.is_active is distinct from true)
  then
    insert into public.saas_funnel_events (
      event_type,
      session_id,
      user_id,
      store_id,
      path
    ) values (
      'published',
      'auth-' || new.owner_id::text,
      new.owner_id,
      new.id,
      '/db/stores/publish'
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.record_published_saas_milestone() from public, anon, authenticated;

drop trigger if exists stores_record_published_saas_milestone on public.stores;
create trigger stores_record_published_saas_milestone
after update of status, is_active on public.stores
for each row execute function public.record_published_saas_milestone();
