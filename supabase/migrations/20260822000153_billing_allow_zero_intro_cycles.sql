alter table public.billing_subscriptions drop constraint if exists billing_subscriptions_intro_cycles_total_check;
alter table public.billing_subscriptions
  add constraint billing_subscriptions_intro_cycles_total_check
  check (intro_cycles_total >= 0 and intro_cycles_total <= 12);
