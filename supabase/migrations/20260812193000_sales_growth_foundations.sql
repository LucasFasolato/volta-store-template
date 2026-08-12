-- Block B — sales, sharing and simple analytics

alter table public.stores
  add column if not exists checkout_ask_name boolean not null default true,
  add column if not exists checkout_ask_fulfillment boolean not null default true,
  add column if not exists checkout_allow_notes boolean not null default true;

create table if not exists public.store_events (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  event_type text not null check (
    event_type in ('store_view', 'product_view', 'add_to_cart', 'cart_open', 'whatsapp_checkout')
  ),
  product_id uuid references public.products(id) on delete set null,
  session_id text,
  created_at timestamptz not null default now(),
  constraint store_events_session_id_length check (session_id is null or char_length(session_id) <= 120)
);

create index if not exists store_events_store_created_idx
  on public.store_events(store_id, created_at desc);

create index if not exists store_events_store_type_created_idx
  on public.store_events(store_id, event_type, created_at desc);

create index if not exists store_events_product_created_idx
  on public.store_events(product_id, created_at desc)
  where product_id is not null;

alter table public.store_events enable row level security;

drop policy if exists "Public can create analytics for published stores" on public.store_events;
create policy "Public can create analytics for published stores"
  on public.store_events
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.stores
      where stores.id = store_events.store_id
        and stores.status = 'published'
        and stores.is_active = true
    )
  );

drop policy if exists "Owners can read store analytics" on public.store_events;
create policy "Owners can read store analytics"
  on public.store_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.stores
      where stores.id = store_events.store_id
        and stores.owner_id = auth.uid()
    )
  );

grant insert on public.store_events to anon, authenticated;
grant select on public.store_events to authenticated;
