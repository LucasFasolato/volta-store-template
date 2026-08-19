alter table public.stores
  add column if not exists checkout_custom_fields jsonb not null default '[]'::jsonb;

alter table public.stores
  drop constraint if exists stores_checkout_custom_fields_array_check,
  add constraint stores_checkout_custom_fields_array_check
    check (
      jsonb_typeof(checkout_custom_fields) = 'array'
      and jsonb_array_length(checkout_custom_fields) <= 6
    );

alter table public.store_content
  add column if not exists hero_text_align text not null default 'left',
  add column if not exists hero_title_weight text not null default 'semibold';

alter table public.store_content
  drop constraint if exists store_content_hero_overlay_opacity_check,
  add constraint store_content_hero_overlay_opacity_check
    check (hero_overlay_opacity between 0 and 90),
  drop constraint if exists store_content_hero_text_align_check,
  add constraint store_content_hero_text_align_check
    check (hero_text_align in ('left', 'center')),
  drop constraint if exists store_content_hero_title_weight_check,
  add constraint store_content_hero_title_weight_check
    check (hero_title_weight in ('medium', 'semibold', 'bold'));
