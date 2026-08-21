create table public.store_slug_history (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  slug text not null,
  created_at timestamptz not null default now(),
  constraint store_slug_history_slug_unique unique (slug),
  constraint store_slug_history_slug_length check (char_length(slug) between 3 and 48),
  constraint store_slug_history_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index store_slug_history_store_created_idx
  on public.store_slug_history(store_id, created_at desc);

alter table public.store_slug_history enable row level security;

grant select on public.store_slug_history to anon, authenticated;
grant select, insert, update, delete on public.store_slug_history to service_role;

create policy "Public can resolve published store slug history"
  on public.store_slug_history
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.stores
      where stores.id = store_slug_history.store_id
        and stores.status = 'published'
        and stores.is_active = true
    )
  );
