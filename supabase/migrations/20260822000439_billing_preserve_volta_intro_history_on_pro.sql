alter table public.billing_subscriptions drop constraint if exists billing_subscriptions_check;
alter table public.billing_subscriptions add constraint billing_subscriptions_check check (
  intro_cycles_paid >= 0
  and intro_cycles_paid <= 12
  and (plan_code = 'pro' or intro_cycles_paid <= intro_cycles_total)
);
