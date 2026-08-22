alter table public.billing_payments
  add column if not exists plan_code text not null default 'volta';

alter table public.billing_payments drop constraint if exists billing_payments_plan_code_check;
alter table public.billing_payments
  add constraint billing_payments_plan_code_check check (plan_code in ('volta', 'pro'));

update public.billing_payments bp
set plan_code = coalesce(bs.plan_code, 'volta')
from public.billing_subscriptions bs
where bs.id = bp.billing_subscription_id;
