-- VOLTA STORE — Commerce UX reliability
-- Keep option-level availability simple: one array on the existing option row.

alter table public.product_options
  add column if not exists unavailable_values text[] not null default '{}'::text[];

alter table public.product_options
  drop constraint if exists product_options_unavailable_values_subset_check,
  add constraint product_options_unavailable_values_subset_check
    check (unavailable_values <@ values);

comment on column public.product_options.unavailable_values is
  'Option values that are temporarily unavailable (for example one sold-out flavor or size).';
