drop policy if exists "deny client access to billing overrides" on public.billing_access_overrides;
create policy "deny client access to billing overrides"
on public.billing_access_overrides
for all
to anon, authenticated
using (false)
with check (false);
