-- ============================================================
-- VOLTA STORE — Storage Setup
-- ============================================================

-- Create store-assets bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'store-assets',
  'store-assets',
  true,
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Public read access for store-assets
create policy "store_assets_select_public"
  on storage.objects for select
  using (bucket_id = 'store-assets');

-- Authenticated users can upload to their own folder
create policy "store_assets_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'store-assets'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owners can update their own files
create policy "store_assets_update_own"
  on storage.objects for update
  using (
    bucket_id = 'store-assets'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owners can delete their own files
create policy "store_assets_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'store-assets'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
