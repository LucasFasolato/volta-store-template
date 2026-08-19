-- Restrict Storage listing to the authenticated owner while keeping the
-- bucket public for direct image delivery.
drop policy if exists store_assets_select_public on storage.objects;

create policy store_assets_select_own
on storage.objects
for select
to authenticated
using (
  bucket_id = 'store-assets'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Trigger-only SECURITY DEFINER function: do not expose it as a public RPC.
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
grant execute on function public.handle_new_user() to supabase_auth_admin;

-- Pin function search paths to avoid object-shadowing issues.
alter function public.handle_updated_at()
  set search_path = public, pg_temp;

alter function public.generate_slug(text)
  set search_path = public, extensions, pg_temp;
