create index if not exists billing_access_overrides_updated_by_idx
  on public.billing_access_overrides (updated_by)
  where updated_by is not null;
