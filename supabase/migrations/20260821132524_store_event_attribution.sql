alter table public.store_events
  add column if not exists traffic_source text,
  add column if not exists campaign text;

alter table public.store_events
  drop constraint if exists store_events_traffic_source_format,
  drop constraint if exists store_events_campaign_format;

alter table public.store_events
  add constraint store_events_traffic_source_format
    check (traffic_source is null or traffic_source ~ '^[a-z0-9][a-z0-9_-]{0,63}$'),
  add constraint store_events_campaign_format
    check (campaign is null or campaign ~ '^[a-z0-9][a-z0-9_-]{0,79}$');

create index if not exists store_events_store_source_created_idx
  on public.store_events(store_id, traffic_source, created_at desc)
  where traffic_source is not null;
