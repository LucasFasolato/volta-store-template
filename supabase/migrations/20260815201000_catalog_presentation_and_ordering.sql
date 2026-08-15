alter table public.store_layout
  add column if not exists catalog_mode text not null default 'all';

alter table public.store_layout
  drop constraint if exists store_layout_catalog_mode_check;

alter table public.store_layout
  add constraint store_layout_catalog_mode_check
  check (catalog_mode in ('all', 'sections', 'navigation'));

alter table public.products
  add column if not exists category_sort_order integer not null default 0;

with ranked as (
  select id,
         row_number() over (partition by store_id, category_id order by sort_order, created_at, id) - 1 as next_order
  from public.products
)
update public.products p
set category_sort_order = ranked.next_order
from ranked
where ranked.id = p.id;

create index if not exists products_store_category_sort_idx
  on public.products (store_id, category_id, category_sort_order);
