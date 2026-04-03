alter table public.store_theme
  add column if not exists accent_color text not null default '#2563eb',
  add column if not exists surface_color text not null default '#ffffff',
  add column if not exists visual_mode text not null default 'light',
  add column if not exists font_preset text not null default 'modern',
  add column if not exists heading_font text not null default 'plus-jakarta',
  add column if not exists body_font text not null default 'geist',
  add column if not exists heading_weight text not null default 'semibold',
  add column if not exists ui_density text not null default 'comfortable',
  add column if not exists spacing_scale text not null default 'balanced',
  add column if not exists card_style text not null default 'soft',
  add column if not exists button_style text not null default 'rounded';
