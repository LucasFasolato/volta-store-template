-- Reconciled from production on 2026-08-25.
-- Acquisition funnel events remain server-managed. Do not open direct client
-- inserts merely to make landing tracking easier.

drop policy if exists saas_funnel_events_deny_client_access
  on public.saas_funnel_events;

create policy saas_funnel_events_deny_client_access
  on public.saas_funnel_events
  for all
  to anon, authenticated
  using (false)
  with check (false);
