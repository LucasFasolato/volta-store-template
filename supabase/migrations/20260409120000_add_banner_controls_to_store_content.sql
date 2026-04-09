alter table public.store_content
  add column if not exists banner_mode text not null default 'static',
  add column if not exists banner_speed text not null default 'normal';

update public.store_content
set
  banner_mode = coalesce(nullif(banner_mode, ''), 'static'),
  banner_speed = coalesce(nullif(banner_speed, ''), 'normal');
