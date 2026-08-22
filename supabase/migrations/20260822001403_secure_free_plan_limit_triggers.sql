-- Keep plan-limit enforcement independent from tenant RLS. These trigger
-- functions need to inspect internal complimentary overrides, but they are kept
-- in a non-exposed schema and are not directly executable by client roles.

create schema if not exists private;

create or replace function private.enforce_free_product_limit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_plan text;
  access_until timestamptz;
  grandfathered boolean;
  product_count integer;
  complimentary boolean;
begin
  select s.plan_code, s.plan_access_until, s.plan_grandfathered
    into current_plan, access_until, grandfathered
  from public.stores s
  where s.id = new.store_id;

  select exists (
    select 1
    from public.billing_access_overrides o
    where o.store_id = new.store_id
      and o.access_type = 'complimentary'
      and o.is_enabled = true
      and (o.expires_at is null or o.expires_at > now())
  ) into complimentary;

  if complimentary then return new; end if;
  if current_plan <> 'free' and access_until is not null and access_until <= now() then
    current_plan := case when grandfathered then 'volta' else 'free' end;
  end if;

  if current_plan = 'free' then
    select count(*) into product_count from public.products where store_id = new.store_id;
    if product_count >= 10 then
      raise exception 'Tu plan Gratis permite hasta 10 productos. Pasá a VOLTA para seguir creciendo.';
    end if;
  end if;

  return new;
end;
$$;

create or replace function private.enforce_free_product_image_limit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_store_id uuid;
  current_plan text;
  access_until timestamptz;
  grandfathered boolean;
  image_count integer;
  complimentary boolean;
begin
  select p.store_id into target_store_id from public.products p where p.id = new.product_id;
  if target_store_id is null then return new; end if;

  select s.plan_code, s.plan_access_until, s.plan_grandfathered
    into current_plan, access_until, grandfathered
  from public.stores s
  where s.id = target_store_id;

  select exists (
    select 1
    from public.billing_access_overrides o
    where o.store_id = target_store_id
      and o.access_type = 'complimentary'
      and o.is_enabled = true
      and (o.expires_at is null or o.expires_at > now())
  ) into complimentary;

  if complimentary then return new; end if;
  if current_plan <> 'free' and access_until is not null and access_until <= now() then
    current_plan := case when grandfathered then 'volta' else 'free' end;
  end if;

  if current_plan = 'free' then
    select count(*) into image_count from public.product_images where product_id = new.product_id;
    if image_count >= 1 then
      raise exception 'El plan Gratis incluye 1 imagen por producto. Pasá a VOLTA para sumar más fotos.';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_free_product_limit() from public, anon, authenticated, service_role;
revoke all on function private.enforce_free_product_image_limit() from public, anon, authenticated, service_role;

drop trigger if exists products_enforce_free_limit on public.products;
create trigger products_enforce_free_limit
before insert on public.products
for each row execute function private.enforce_free_product_limit();

drop trigger if exists product_images_enforce_free_limit on public.product_images;
create trigger product_images_enforce_free_limit
before insert on public.product_images
for each row execute function private.enforce_free_product_image_limit();

drop function if exists public.enforce_free_product_limit();
drop function if exists public.enforce_free_product_image_limit();
