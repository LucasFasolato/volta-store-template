-- ============================================================
-- VOLTA STORE — Database Schema
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- STORES
-- ============================================================
create table public.stores (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles(id) on delete cascade,
  slug       text not null unique,
  name       text not null,
  whatsapp   text not null,
  instagram  text,
  address    text,
  hours      text,
  logo_url   text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index stores_owner_id_idx on public.stores(owner_id);
create index stores_slug_idx on public.stores(slug);

-- ============================================================
-- STORE THEME
-- ============================================================
create table public.store_theme (
  id               uuid primary key default gen_random_uuid(),
  store_id         uuid not null unique references public.stores(id) on delete cascade,
  primary_color    text not null default '#1a1a1a',
  secondary_color  text not null default '#4ade80',
  background_color text not null default '#ffffff',
  text_color       text not null default '#1a1a1a',
  border_radius    text not null default 'md',
  container_width  text not null default 'lg',
  font_family      text not null default 'inter',
  heading_scale    text not null default 'default',
  body_scale       text not null default 'base',
  card_layout      text not null default 'grid',
  grid_columns     smallint not null default 2,
  image_ratio      text not null default '4:5',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ============================================================
-- STORE LAYOUT
-- ============================================================
create table public.store_layout (
  id                uuid primary key default gen_random_uuid(),
  store_id          uuid not null unique references public.stores(id) on delete cascade,
  show_hero         boolean not null default true,
  show_featured     boolean not null default true,
  show_categories   boolean not null default true,
  show_catalog      boolean not null default true,
  show_footer       boolean not null default true,
  sections_order    text[] not null default array['hero','featured','categories','catalog'],
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ============================================================
-- STORE CONTENT
-- ============================================================
create table public.store_content (
  id              uuid primary key default gen_random_uuid(),
  store_id        uuid not null unique references public.stores(id) on delete cascade,
  hero_title      text not null default 'Bienvenidos a nuestra tienda',
  hero_subtitle   text not null default 'Encontrá los mejores productos con la mejor calidad y atención personalizada.',
  support_text    text not null default 'Pedidos por WhatsApp · Envíos disponibles',
  hero_image_url  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references public.stores(id) on delete cascade,
  name       text not null,
  slug       text not null,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, slug)
);

create index categories_store_id_idx on public.categories(store_id);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table public.products (
  id                uuid primary key default gen_random_uuid(),
  store_id          uuid not null references public.stores(id) on delete cascade,
  category_id       uuid references public.categories(id) on delete set null,
  name              text not null,
  slug              text not null,
  short_description text,
  description       text,
  price             numeric(12, 2) not null check (price >= 0),
  compare_price     numeric(12, 2) check (compare_price is null or compare_price >= 0),
  badge             text,
  is_featured       boolean not null default false,
  is_active         boolean not null default true,
  sort_order        smallint not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (store_id, slug)
);

create index products_store_id_idx on public.products(store_id);
create index products_category_id_idx on public.products(category_id);
create index products_is_active_idx on public.products(is_active);
create index products_is_featured_idx on public.products(is_featured);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  url         text not null,
  alt         text,
  sort_order  smallint not null default 0,
  created_at  timestamptz not null default now()
);

create index product_images_product_id_idx on public.product_images(product_id);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_stores_updated_at
  before update on public.stores
  for each row execute function public.handle_updated_at();

create trigger set_store_theme_updated_at
  before update on public.store_theme
  for each row execute function public.handle_updated_at();

create trigger set_store_layout_updated_at
  before update on public.store_layout
  for each row execute function public.handle_updated_at();

create trigger set_store_content_updated_at
  before update on public.store_content
  for each row execute function public.handle_updated_at();

create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.handle_updated_at();

create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();
