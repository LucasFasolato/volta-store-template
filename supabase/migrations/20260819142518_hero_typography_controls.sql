alter table public.store_content
  add column if not exists hero_title_font text not null default 'inherit',
  add column if not exists hero_title_scale text not null default 'balanced';

alter table public.store_content
  drop constraint if exists store_content_hero_title_font_check,
  add constraint store_content_hero_title_font_check
    check (hero_title_font in ('inherit', 'geist', 'plus-jakarta', 'playfair')),
  drop constraint if exists store_content_hero_title_scale_check,
  add constraint store_content_hero_title_scale_check
    check (hero_title_scale in ('subtle', 'balanced', 'impact'));
