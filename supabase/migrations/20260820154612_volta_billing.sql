create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null unique references public.stores(id) on delete cascade,
  provider text not null default 'mercado_pago' check (provider = 'mercado_pago'),
  provider_subscription_id text unique,
  provider_status text,
  status text not null default 'not_started' check (status in ('not_started','creating','pending','active','paused','canceled','error')),
  payer_email text,
  currency text not null default 'ARS' check (currency = 'ARS'),
  intro_price numeric(12,2) not null default 15000 check (intro_price > 0),
  standard_price numeric(12,2) not null default 30000 check (standard_price > 0),
  intro_cycles_total smallint not null default 3 check (intro_cycles_total between 1 and 12),
  intro_cycles_paid smallint not null default 0 check (intro_cycles_paid between 0 and intro_cycles_total),
  current_amount numeric(12,2) not null default 15000 check (current_amount > 0),
  next_payment_date timestamptz,
  checkout_url text,
  checkout_idempotency_key uuid,
  price_upgraded_at timestamptz,
  canceled_at timestamptz,
  last_error text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_payments (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  billing_subscription_id uuid not null references public.billing_subscriptions(id) on delete cascade,
  provider_invoice_id text not null unique,
  provider_payment_id text,
  provider_subscription_id text not null,
  payment_status text not null,
  payment_status_detail text,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'ARS',
  debit_date timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists billing_payments_provider_payment_id_uidx
  on public.billing_payments(provider_payment_id)
  where provider_payment_id is not null;
create index if not exists billing_payments_store_paid_idx
  on public.billing_payments(store_id, paid_at desc nulls last, created_at desc);
create index if not exists billing_subscriptions_provider_status_idx
  on public.billing_subscriptions(provider_status);

alter table public.billing_subscriptions enable row level security;
alter table public.billing_payments enable row level security;

drop policy if exists "owners can read billing subscriptions" on public.billing_subscriptions;
create policy "owners can read billing subscriptions"
on public.billing_subscriptions for select
to authenticated
using (exists (
  select 1 from public.stores s
  where s.id = billing_subscriptions.store_id and s.owner_id = auth.uid()
));

drop policy if exists "owners can read billing payments" on public.billing_payments;
create policy "owners can read billing payments"
on public.billing_payments for select
to authenticated
using (exists (
  select 1 from public.stores s
  where s.id = billing_payments.store_id and s.owner_id = auth.uid()
));

revoke all on public.billing_subscriptions from anon;
revoke all on public.billing_payments from anon;
revoke insert, update, delete on public.billing_subscriptions from authenticated;
revoke insert, update, delete on public.billing_payments from authenticated;
grant select on public.billing_subscriptions to authenticated;
grant select on public.billing_payments to authenticated;
grant all on public.billing_subscriptions to service_role;
grant all on public.billing_payments to service_role;

drop trigger if exists set_billing_subscriptions_updated_at on public.billing_subscriptions;
create trigger set_billing_subscriptions_updated_at
before update on public.billing_subscriptions
for each row execute function public.handle_updated_at();

drop trigger if exists set_billing_payments_updated_at on public.billing_payments;
create trigger set_billing_payments_updated_at
before update on public.billing_payments
for each row execute function public.handle_updated_at();

create or replace function public.billing_claim_checkout(p_store_id uuid, p_payer_email text)
returns table (
  should_create boolean,
  idempotency_key uuid,
  existing_checkout_url text,
  current_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  billing_row public.billing_subscriptions%rowtype;
begin
  select * into billing_row
  from public.billing_subscriptions
  where store_id = p_store_id
  for update;

  if found then
    if billing_row.status in ('active', 'paused') then
      return query select false, billing_row.checkout_idempotency_key, billing_row.checkout_url, billing_row.status;
      return;
    end if;

    if billing_row.status in ('creating', 'pending') and billing_row.checkout_idempotency_key is not null then
      return query select false, billing_row.checkout_idempotency_key, billing_row.checkout_url, billing_row.status;
      return;
    end if;

    update public.billing_subscriptions
    set status = 'creating',
        payer_email = p_payer_email,
        provider_status = null,
        provider_subscription_id = null,
        checkout_url = null,
        checkout_idempotency_key = gen_random_uuid(),
        current_amount = intro_price,
        intro_cycles_paid = 0,
        price_upgraded_at = null,
        canceled_at = null,
        next_payment_date = null,
        last_error = null,
        last_synced_at = null
    where id = billing_row.id
    returning * into billing_row;

    return query select true, billing_row.checkout_idempotency_key, null::text, billing_row.status;
    return;
  end if;

  insert into public.billing_subscriptions (store_id, status, payer_email, checkout_idempotency_key)
  values (p_store_id, 'creating', p_payer_email, gen_random_uuid())
  returning * into billing_row;

  return query select true, billing_row.checkout_idempotency_key, null::text, billing_row.status;
end;
$$;

revoke all on function public.billing_claim_checkout(uuid, text) from public, anon, authenticated;
grant execute on function public.billing_claim_checkout(uuid, text) to service_role;
