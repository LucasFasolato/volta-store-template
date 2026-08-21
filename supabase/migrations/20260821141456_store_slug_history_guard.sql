alter table public.store_slug_history
  alter column store_id drop not null;

alter table public.store_slug_history
  drop constraint store_slug_history_store_id_fkey;

alter table public.store_slug_history
  add constraint store_slug_history_store_id_fkey
  foreign key (store_id) references public.stores(id) on delete set null;

create schema if not exists private;

create or replace function private.protect_store_slug_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  reserved_store_id uuid;
begin
  if tg_op = 'UPDATE' and new.slug is not distinct from old.slug then
    return new;
  end if;

  select history.store_id
    into reserved_store_id
  from public.store_slug_history as history
  where history.slug = new.slug
  limit 1;

  if found and (
    tg_op = 'INSERT'
    or reserved_store_id is null
    or reserved_store_id is distinct from old.id
  ) then
    raise exception using
      errcode = '23505',
      message = 'store_slug_reserved';
  end if;

  if tg_op = 'UPDATE' then
    insert into public.store_slug_history (store_id, slug)
    values (old.id, old.slug)
    on conflict (slug) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function private.protect_store_slug_history() from public, anon, authenticated;

drop trigger if exists protect_store_slug_history on public.stores;
create trigger protect_store_slug_history
before insert or update of slug on public.stores
for each row
execute function private.protect_store_slug_history();
