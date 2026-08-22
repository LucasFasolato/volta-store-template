-- All stores that already had VOLTA at rollout remain grandfathered, including
-- merchants that happened to have a paid access_until from the real billing test.
-- Stores created after this migration keep the default plan_grandfathered=false.
update public.stores
set plan_grandfathered = true
where plan_code = 'volta';
