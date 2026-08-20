create index if not exists billing_payments_subscription_idx
  on public.billing_payments(billing_subscription_id);

create index if not exists billing_payments_store_created_idx
  on public.billing_payments(store_id, created_at desc);

drop index if exists public.billing_payments_store_paid_idx;
drop index if exists public.billing_subscriptions_provider_status_idx;

drop policy if exists "owners can read billing subscriptions" on public.billing_subscriptions;
create policy "owners can read billing subscriptions"
on public.billing_subscriptions for select
to authenticated
using (exists (
  select 1 from public.stores s
  where s.id = billing_subscriptions.store_id and s.owner_id = (select auth.uid())
));

drop policy if exists "owners can read billing payments" on public.billing_payments;
create policy "owners can read billing payments"
on public.billing_payments for select
to authenticated
using (exists (
  select 1 from public.stores s
  where s.id = billing_payments.store_id and s.owner_id = (select auth.uid())
));
