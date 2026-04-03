-- ============================================================
-- VOLTA STORE — Auto-profile on signup
-- ============================================================

-- Function: auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger on auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Helper function: generate unique slug from text
-- ============================================================
create or replace function public.generate_slug(input_text text)
returns text
language plpgsql
as $$
declare
  base_slug text;
  final_slug text;
  counter int := 0;
begin
  -- Basic slug: lowercase, replace spaces/special chars with hyphens
  base_slug := lower(regexp_replace(
    regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
  base_slug := trim(both '-' from base_slug);

  -- If empty, use a random string
  if base_slug = '' then
    base_slug := encode(gen_random_bytes(4), 'hex');
  end if;

  final_slug := base_slug;

  -- Ensure uniqueness
  loop
    if not exists (select 1 from public.stores where slug = final_slug) then
      return final_slug;
    end if;
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  end loop;
end;
$$;
