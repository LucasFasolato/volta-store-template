-- Commercial plans v1: new stores start on Gratis; stores that existed before
-- this rollout keep VOLTA access. Paid access can remain valid until the end of
-- an already-paid period after renewal is canceled.

alter table public.stores
  add column if not exists plan_code text not null default 'free',
  add column if not exists plan_access_until timestamptz;

alter table public.stores drop constraint if exists stores_plan_code_check;
alter table public.stores
  add constraint stores_plan_code_check check (plan_code in ('free', 'volta', 'pro'));

-- Grandfather all stores present at rollout time into VOLTA.
update public.stores set plan_code = 'volta' where plan_code = 'free';

alter table public.billing_subscriptions
  add column if not exists plan_code text not null default 'volta';

alter table public.billing_subscriptions drop constraint if exists billing_subscriptions_plan_code_check;
alter table public.billing_subscriptions
  add constraint billing_subscriptions_plan_code_check check (plan_code in ('volta', 'pro'));

alter table public.billing_payments
  add column if not exists net_received_amount numeric,
  add column if not exists processor_deductions_amount numeric;

alter table public.billing_payments drop constraint if exists billing_payments_net_nonnegative;
alter table public.billing_payments
  add constraint billing_payments_net_nonnegative check (net_received_amount is null or net_received_amount >= 0);

alter table public.billing_payments drop constraint if exists billing_payments_deductions_nonnegative;
alter table public.billing_payments
  add constraint billing_payments_deductions_nonnegative check (processor_deductions_amount is null or processor_deductions_amount >= 0);

-- Mercado Pago has returned both spellings in production. Normalize old rows so
-- cancellation is not presented as an application error.
update public.billing_subscriptions
set status = 'canceled',
    canceled_at = coalesce(canceled_at, updated_at)
where lower(coalesce(provider_status, '')) in ('canceled', 'cancelled')
  and status <> 'canceled';

-- Preserve the period that was already paid when a subscription is canceled.
update public.stores s
set plan_code = coalesce(bs.plan_code, 'volta'),
    plan_access_until = bs.next_payment_date
from public.billing_subscriptions bs
where bs.store_id = s.id
  and bs.status = 'canceled'
  and bs.next_payment_date is not null
  and exists (
    select 1 from public.billing_payments bp
    where bp.billing_subscription_id = bs.id
      and bp.payment_status = 'approved'
  );

create or replace function public.billing_claim_plan_checkout(
  p_store_id uuid,
  p_payer_email text,
  p_plan_code text,
  p_intro_price numeric,
  p_standard_price numeric,
  p_intro_cycles_total smallint
)
returns table(should_create boolean, idempotency_key uuid, existing_checkout_url text, current_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  billing_row public.billing_subscriptions%rowtype;
  same_plan boolean;
  next_amount numeric;
begin
  if p_plan_code not in ('volta', 'pro') then
    raise exception 'Plan inválido.';
  end if;
  if p_intro_price <= 0 or p_standard_price <= 0 or p_intro_cycles_total < 0 then
    raise exception 'Configuración de precio inválida.';
  end if;

  select * into billing_row
  from public.billing_subscriptions
  where store_id = p_store_id
  for update;

  if found then
    same_plan := billing_row.plan_code = p_plan_code;

    if billing_row.status in ('active', 'paused') then
      return query select false, billing_row.checkout_idempotency_key, billing_row.checkout_url, billing_row.status;
      return;
    end if;

    if same_plan and billing_row.status in ('creating', 'pending') and billing_row.checkout_url is not null then
      return query select false, billing_row.checkout_idempotency_key, billing_row.checkout_url, billing_row.status;
      return;
    end if;

    if p_intro_cycles_total = 0 or billing_row.intro_cycles_paid >= p_intro_cycles_total then
      next_amount := p_standard_price;
    else
      next_amount := p_intro_price;
    end if;

    update public.billing_subscriptions
    set status = 'creating',
        plan_code = p_plan_code,
        payer_email = p_payer_email,
        provider_status = null,
        provider_subscription_id = null,
        checkout_url = null,
        checkout_idempotency_key = case
          when same_plan
            and billing_row.status in ('creating', 'pending')
            and billing_row.checkout_idempotency_key is not null
            and billing_row.updated_at > now() - interval '30 seconds'
          then billing_row.checkout_idempotency_key
          else gen_random_uuid()
        end,
        intro_price = p_intro_price,
        standard_price = p_standard_price,
        intro_cycles_total = p_intro_cycles_total,
        current_amount = next_amount,
        canceled_at = null,
        next_payment_date = null,
        last_error = null,
        last_synced_at = null
    where id = billing_row.id
    returning * into billing_row;

    return query select true, billing_row.checkout_idempotency_key, null::text, billing_row.status;
    return;
  end if;

  insert into public.billing_subscriptions (
    store_id, status, plan_code, payer_email, checkout_idempotency_key,
    intro_price, standard_price, intro_cycles_total, current_amount
  ) values (
    p_store_id, 'creating', p_plan_code, p_payer_email, gen_random_uuid(),
    p_intro_price, p_standard_price, p_intro_cycles_total,
    case when p_intro_cycles_total = 0 then p_standard_price else p_intro_price end
  )
  returning * into billing_row;

  return query select true, billing_row.checkout_idempotency_key, null::text, billing_row.status;
end;
$$;

revoke all on function public.billing_claim_plan_checkout(uuid, text, text, numeric, numeric, smallint) from public, anon, authenticated;
grant execute on function public.billing_claim_plan_checkout(uuid, text, text, numeric, numeric, smallint) to service_role;

create or replace function public.enforce_free_product_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  current_plan text;
  access_until timestamptz;
  product_count integer;
  complimentary boolean;
begin
  select s.plan_code, s.plan_access_until into current_plan, access_until
  from public.stores s where s.id = new.store_id;

  select exists (
    select 1 from public.billing_access_overrides o
    where o.store_id = new.store_id
      and o.access_type = 'complimentary'
      and o.is_enabled = true
      and (o.expires_at is null or o.expires_at > now())
  ) into complimentary;

  if complimentary then return new; end if;
  if current_plan <> 'free' and access_until is not null and access_until <= now() then current_plan := 'free'; end if;

  if current_plan = 'free' then
    select count(*) into product_count from public.products where store_id = new.store_id;
    if product_count >= 10 then
      raise exception 'Tu plan Gratis permite hasta 10 productos. Pasá a VOLTA para seguir creciendo.';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.enforce_free_product_image_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_store_id uuid;
  current_plan text;
  access_until timestamptz;
  image_count integer;
  complimentary boolean;
begin
  select p.store_id into target_store_id from public.products p where p.id = new.product_id;
  if target_store_id is null then return new; end if;

  select s.plan_code, s.plan_access_until into current_plan, access_until
  from public.stores s where s.id = target_store_id;

  select exists (
    select 1 from public.billing_access_overrides o
    where o.store_id = target_store_id
      and o.access_type = 'complimentary'
      and o.is_enabled = true
      and (o.expires_at is null or o.expires_at > now())
  ) into complimentary;

  if complimentary then return new; end if;
  if current_plan <> 'free' and access_until is not null and access_until <= now() then current_plan := 'free'; end if;

  if current_plan = 'free' then
    select count(*) into image_count from public.product_images where product_id = new.product_id;
    if image_count >= 1 then
      raise exception 'El plan Gratis incluye 1 imagen por producto. Pasá a VOLTA para sumar más fotos.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists products_enforce_free_limit on public.products;
create trigger products_enforce_free_limit
before insert on public.products
for each row execute function public.enforce_free_product_limit();

drop trigger if exists product_images_enforce_free_limit on public.product_images;
create trigger product_images_enforce_free_limit
before insert on public.product_images
for each row execute function public.enforce_free_product_image_limit();

revoke all on function public.enforce_free_product_limit() from public, anon, authenticated;
revoke all on function public.enforce_free_product_image_limit() from public, anon, authenticated;
grant execute on function public.enforce_free_product_limit() to service_role;
grant execute on function public.enforce_free_product_image_limit() to service_role;
