do $$
declare
  duplicate_owners text;
begin
  select string_agg(
    format('%s (%s stores)', owner_id, store_count),
    ', ' order by owner_id
  )
  into duplicate_owners
  from (
    select owner_id::text as owner_id, count(*)::int as store_count
    from public.stores
    group by owner_id
    having count(*) > 1
  ) duplicates;

  if duplicate_owners is not null then
    raise exception using
      errcode = '23505',
      message = 'Cannot enforce one-store-per-owner invariant: duplicate stores already exist.',
      detail = duplicate_owners,
      hint = 'Resolve duplicate rows in public.stores manually, then rerun this migration.';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.stores'::regclass
      and conname = 'stores_owner_id_unique'
  ) then
    alter table public.stores
      add constraint stores_owner_id_unique unique (owner_id);
  end if;
end
$$;

drop index if exists public.stores_owner_id_idx;
