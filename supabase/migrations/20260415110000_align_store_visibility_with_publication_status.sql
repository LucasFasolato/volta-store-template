update public.stores
set is_active = case when status = 'published' then true else false end
where is_active is distinct from case when status = 'published' then true else false end;

drop policy if exists "stores_select_public" on public.stores;
create policy "stores_select_public"
  on public.stores for select
  using (status = 'published' or owner_id = auth.uid());

drop policy if exists "store_theme_select_public" on public.store_theme;
create policy "store_theme_select_public"
  on public.store_theme for select
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and (s.status = 'published' or s.owner_id = auth.uid())
    )
  );

drop policy if exists "store_layout_select_public" on public.store_layout;
create policy "store_layout_select_public"
  on public.store_layout for select
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and (s.status = 'published' or s.owner_id = auth.uid())
    )
  );

drop policy if exists "store_content_select_public" on public.store_content;
create policy "store_content_select_public"
  on public.store_content for select
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and (s.status = 'published' or s.owner_id = auth.uid())
    )
  );

drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public"
  on public.categories for select
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and (s.status = 'published' or s.owner_id = auth.uid())
    )
  );

drop policy if exists "products_select_public" on public.products;
create policy "products_select_public"
  on public.products for select
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and (s.status = 'published' or s.owner_id = auth.uid())
    )
    and (
      is_active = true
      or exists (
        select 1 from public.stores s
        where s.id = store_id and s.owner_id = auth.uid()
      )
    )
  );

drop policy if exists "product_images_select_public" on public.product_images;
create policy "product_images_select_public"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_id
        and (s.status = 'published' or s.owner_id = auth.uid())
        and (p.is_active = true or s.owner_id = auth.uid())
    )
  );

drop policy if exists "product_options_select_public" on public.product_options;
create policy "product_options_select_public"
  on public.product_options for select
  using (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_id
        and (s.status = 'published' or s.owner_id = auth.uid())
        and (p.is_active = true or s.owner_id = auth.uid())
    )
  );
