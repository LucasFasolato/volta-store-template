alter table public.stores
  add column if not exists payment_methods text[] not null default array['arrange']::text[],
  add column if not exists fulfillment_methods text[] not null default array['pickup', 'delivery']::text[],
  add column if not exists delivery_area text default 'Envíos a coordinar',
  add column if not exists minimum_order_amount numeric(12,2),
  add column if not exists delivery_notes text;

alter table public.stores
  drop constraint if exists stores_payment_methods_check,
  add constraint stores_payment_methods_check
    check (
      cardinality(payment_methods) between 1 and 4
      and payment_methods <@ array['transfer', 'cash', 'mercado_pago', 'arrange']::text[]
    ),
  drop constraint if exists stores_fulfillment_methods_check,
  add constraint stores_fulfillment_methods_check
    check (
      cardinality(fulfillment_methods) between 1 and 2
      and fulfillment_methods <@ array['pickup', 'delivery']::text[]
    ),
  drop constraint if exists stores_delivery_area_length_check,
  add constraint stores_delivery_area_length_check
    check (delivery_area is null or char_length(delivery_area) <= 100),
  drop constraint if exists stores_minimum_order_amount_check,
  add constraint stores_minimum_order_amount_check
    check (minimum_order_amount is null or minimum_order_amount >= 0),
  drop constraint if exists stores_delivery_notes_length_check,
  add constraint stores_delivery_notes_length_check
    check (delivery_notes is null or char_length(delivery_notes) <= 160);
