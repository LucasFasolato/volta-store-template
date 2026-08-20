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

    if billing_row.status in ('creating', 'pending') and billing_row.checkout_url is not null then
      return query select false, billing_row.checkout_idempotency_key, billing_row.checkout_url, billing_row.status;
      return;
    end if;

    if billing_row.status in ('creating', 'pending')
       and billing_row.checkout_idempotency_key is not null
       and billing_row.updated_at > now() - interval '30 seconds' then
      return query select false, billing_row.checkout_idempotency_key, null::text, billing_row.status;
      return;
    end if;

    update public.billing_subscriptions
    set status = 'creating',
        payer_email = p_payer_email,
        provider_status = null,
        provider_subscription_id = null,
        checkout_url = null,
        checkout_idempotency_key = coalesce(billing_row.checkout_idempotency_key, gen_random_uuid()),
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
