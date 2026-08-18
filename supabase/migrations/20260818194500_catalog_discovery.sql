-- Catalog discovery: brands, SKU, discovery controls and scale indexes.

create table if not exists public.brands (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references public.stores(id) on delete cascade,
  name       text not null,
  slug       text not null,
  is_active  boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, slug)
);

create unique index if not exists brands_store_name_unique_idx
  on public.brands (store_id, lower(btrim(name)));

create index if not exists brands_store_active_sort_idx
  on public.brands (store_id, is_active, sort_order);

alter table public.brands enable row level security;

drop policy if exists "brands_select_public" on public.brands;
create policy "brands_select_public"
  on public.brands for select
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id
        and (s.status = 'published' or s.owner_id = auth.uid())
    )
    and (
      is_active = true
      or exists (
        select 1 from public.stores s
        where s.id = store_id and s.owner_id = auth.uid()
      )
    )
  );

drop policy if exists "brands_insert_own" on public.brands;
create policy "brands_insert_own"
  on public.brands for insert
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "brands_update_own" on public.brands;
create policy "brands_update_own"
  on public.brands for update
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "brands_delete_own" on public.brands;
create policy "brands_delete_own"
  on public.brands for delete
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

drop trigger if exists set_brands_updated_at on public.brands;
create trigger set_brands_updated_at
  before update on public.brands
  for each row execute function public.handle_updated_at();

alter table public.products
  add column if not exists brand_id uuid references public.brands(id) on delete set null,
  add column if not exists sku text;

alter table public.store_layout
  add column if not exists show_catalog_search boolean not null default true,
  add column if not exists show_catalog_brands boolean not null default false;

create unique index if not exists products_store_sku_unique_idx
  on public.products (store_id, lower(btrim(sku)))
  where sku is not null and btrim(sku) <> '';

create index if not exists products_store_active_sort_idx
  on public.products (store_id, is_active, sort_order);

create index if not exists products_store_brand_sort_idx
  on public.products (store_id, brand_id, sort_order);

create index if not exists products_store_category_brand_active_idx
  on public.products (store_id, category_id, brand_id, is_active);

create or replace function public.validate_product_brand_store()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.brand_id is not null and not exists (
    select 1
    from public.brands b
    where b.id = new.brand_id and b.store_id = new.store_id
  ) then
    raise exception 'Product brand must belong to the same store';
  end if;

  return new;
end;
$$;

drop trigger if exists products_brand_same_store on public.products;
create trigger products_brand_same_store
  before insert or update of brand_id, store_id on public.products
  for each row execute function public.validate_product_brand_store();
