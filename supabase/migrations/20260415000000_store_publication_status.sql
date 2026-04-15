alter table public.stores
  add column status text;

update public.stores
set status = 'published'
where status is null;

alter table public.stores
  alter column status set default 'draft',
  alter column status set not null;

alter table public.stores
  add constraint stores_status_check
  check (status in ('draft', 'published'));

create index stores_status_idx on public.stores(status);
