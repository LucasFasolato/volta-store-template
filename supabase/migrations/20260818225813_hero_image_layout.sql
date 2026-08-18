alter table public.store_content
  add column if not exists hero_image_layout text not null default 'side',
  add column if not exists hero_overlay_opacity integer not null default 55;

alter table public.store_content
  drop constraint if exists store_content_hero_image_layout_check,
  add constraint store_content_hero_image_layout_check
    check (hero_image_layout in ('side', 'background')),
  drop constraint if exists store_content_hero_overlay_opacity_check,
  add constraint store_content_hero_overlay_opacity_check
    check (hero_overlay_opacity between 20 and 80);
