create index if not exists products_brand_id_idx on public.products (brand_id);

drop policy if exists "brands_select_public" on public.brands;
create policy "brands_select_public"
  on public.brands for select
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id
        and (s.status = 'published' or s.owner_id = (select auth.uid()))
    )
    and (
      is_active = true
      or exists (
        select 1 from public.stores s
        where s.id = store_id and s.owner_id = (select auth.uid())
      )
    )
  );

drop policy if exists "brands_insert_own" on public.brands;
create policy "brands_insert_own"
  on public.brands for insert
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = (select auth.uid())
    )
  );

drop policy if exists "brands_update_own" on public.brands;
create policy "brands_update_own"
  on public.brands for update
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = (select auth.uid())
    )
  );

drop policy if exists "brands_delete_own" on public.brands;
create policy "brands_delete_own"
  on public.brands for delete
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = (select auth.uid())
    )
  );
