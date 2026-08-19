alter table public.products
  add column if not exists availability_status text not null default 'available';

alter table public.products
  drop constraint if exists products_availability_status_check;

alter table public.products
  add constraint products_availability_status_check
  check (availability_status in ('available', 'sold_out'));
