-- ============================================================
-- VOLTA STORE — Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.store_theme enable row level security;
alter table public.store_layout enable row level security;
alter table public.store_content enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

-- ============================================================
-- PROFILES
-- ============================================================
-- Users can view their own profile
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can insert their own profile (onboarding)
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- STORES
-- ============================================================
-- Public: anyone can read active stores (for landing pages)
create policy "stores_select_public"
  on public.stores for select
  using (is_active = true or owner_id = auth.uid());

-- Owners can insert their own store
create policy "stores_insert_own"
  on public.stores for insert
  with check (owner_id = auth.uid());

-- Owners can update their own store
create policy "stores_update_own"
  on public.stores for update
  using (owner_id = auth.uid());

-- ============================================================
-- STORE THEME
-- ============================================================
-- Public: read theme of active stores (needed for landing)
create policy "store_theme_select_public"
  on public.store_theme for select
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and (s.is_active = true or s.owner_id = auth.uid())
    )
  );

create policy "store_theme_insert_own"
  on public.store_theme for insert
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

create policy "store_theme_update_own"
  on public.store_theme for update
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

-- ============================================================
-- STORE LAYOUT
-- ============================================================
create policy "store_layout_select_public"
  on public.store_layout for select
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and (s.is_active = true or s.owner_id = auth.uid())
    )
  );

create policy "store_layout_insert_own"
  on public.store_layout for insert
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

create policy "store_layout_update_own"
  on public.store_layout for update
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

-- ============================================================
-- STORE CONTENT
-- ============================================================
create policy "store_content_select_public"
  on public.store_content for select
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and (s.is_active = true or s.owner_id = auth.uid())
    )
  );

create policy "store_content_insert_own"
  on public.store_content for insert
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

create policy "store_content_update_own"
  on public.store_content for update
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

-- ============================================================
-- CATEGORIES
-- ============================================================
-- Public: read categories of active stores
create policy "categories_select_public"
  on public.categories for select
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and (s.is_active = true or s.owner_id = auth.uid())
    )
  );

create policy "categories_insert_own"
  on public.categories for insert
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

create policy "categories_update_own"
  on public.categories for update
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

create policy "categories_delete_own"
  on public.categories for delete
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

-- ============================================================
-- PRODUCTS
-- ============================================================
-- Public: read active products of active stores
create policy "products_select_public"
  on public.products for select
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and (s.is_active = true or s.owner_id = auth.uid())
    )
    and (is_active = true or exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    ))
  );

create policy "products_insert_own"
  on public.products for insert
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

create policy "products_update_own"
  on public.products for update
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

create policy "products_delete_own"
  on public.products for delete
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
-- Public: read images of accessible products
create policy "product_images_select_public"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_id
        and (s.is_active = true or s.owner_id = auth.uid())
        and (p.is_active = true or s.owner_id = auth.uid())
    )
  );

create policy "product_images_insert_own"
  on public.product_images for insert
  with check (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_id and s.owner_id = auth.uid()
    )
  );

create policy "product_images_update_own"
  on public.product_images for update
  using (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_id and s.owner_id = auth.uid()
    )
  );

create policy "product_images_delete_own"
  on public.product_images for delete
  using (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_id and s.owner_id = auth.uid()
    )
  );
