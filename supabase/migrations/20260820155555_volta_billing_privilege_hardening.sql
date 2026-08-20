revoke all on public.billing_subscriptions from authenticated;
revoke all on public.billing_payments from authenticated;
grant select on public.billing_subscriptions to authenticated;
grant select on public.billing_payments to authenticated;

revoke all on public.billing_subscriptions from anon;
revoke all on public.billing_payments from anon;

grant all on public.billing_subscriptions to service_role;
grant all on public.billing_payments to service_role;
