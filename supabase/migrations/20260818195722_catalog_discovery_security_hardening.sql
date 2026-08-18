-- Keep the production migration history explicit and make the trigger function safe
-- even when this migration is replayed independently.
alter function public.validate_product_brand_store() set search_path = '';
