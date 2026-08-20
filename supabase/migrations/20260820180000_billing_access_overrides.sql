create table if not exists public.billing_access_overrides (
  store_id uuid primary key references public.stores(id) on delete cascade,
  access_type text not null default 'complimentary' check (access_type in ('complimentary')),
  is_enabled boolean not null default true,
  expires_at timestamptz,
  internal_note text check (internal_note is null or char_length(internal_note) <= 500),
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.billing_access_overrides enable row level security;

revoke all on table public.billing_access_overrides from anon, authenticated;
grant all on table public.billing_access_overrides to service_role;

create index if not exists billing_access_overrides_active_idx
  on public.billing_access_overrides (is_enabled, expires_at)
  where is_enabled = true;

drop trigger if exists billing_access_overrides_updated_at on public.billing_access_overrides;
create trigger billing_access_overrides_updated_at
before update on public.billing_access_overrides
for each row execute function public.handle_updated_at();

comment on table public.billing_access_overrides is
  'Server-managed commercial access exceptions. Merchant clients have no direct privileges.';
