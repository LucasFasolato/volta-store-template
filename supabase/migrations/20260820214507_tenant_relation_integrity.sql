-- Keep optional product relations inside the product's tenant. Application
-- checks provide friendly errors; these constraints are the final invariant.

alter table public.categories
  add constraint categories_store_id_id_key unique (store_id, id);

alter table public.brands
  add constraint brands_store_id_id_key unique (store_id, id);

alter table public.products
  add constraint products_store_category_id_fkey
  foreign key (store_id, category_id)
  references public.categories (store_id, id)
  on delete set null (category_id)
  not valid;

alter table public.products
  validate constraint products_store_category_id_fkey;

alter table public.products
  add constraint products_store_brand_id_fkey
  foreign key (store_id, brand_id)
  references public.brands (store_id, id)
  on delete set null (brand_id)
  not valid;

alter table public.products
  validate constraint products_store_brand_id_fkey;

alter table public.products
  drop constraint products_category_id_fkey,
  drop constraint products_brand_id_fkey;
