alter table public.store_theme
  add column if not exists background_color_2 text,
  add column if not exists background_direction text not null default 'diagonal';
