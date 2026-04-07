-- ============================================================
-- VOLTA STORE — Product Options
-- Allows products to have selectable attributes (size, color, etc.)
-- without breaking existing single-SKU products.
-- ============================================================

CREATE TABLE public.product_options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  values      TEXT[] NOT NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT product_options_name_length   CHECK (char_length(name) <= 40),
  CONSTRAINT product_options_values_nonempty CHECK (array_length(values, 1) >= 1)
);

CREATE INDEX product_options_product_id_idx ON public.product_options(product_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;

-- Public: read options of accessible products (same rules as product_images)
CREATE POLICY "product_options_select_public"
  ON public.product_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.stores s ON s.id = p.store_id
      WHERE p.id = product_id
        AND (s.is_active = true OR s.owner_id = auth.uid())
        AND (p.is_active = true OR s.owner_id = auth.uid())
    )
  );

-- Owner: insert
CREATE POLICY "product_options_insert_own"
  ON public.product_options FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.stores s ON s.id = p.store_id
      WHERE p.id = product_id AND s.owner_id = auth.uid()
    )
  );

-- Owner: update
CREATE POLICY "product_options_update_own"
  ON public.product_options FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.stores s ON s.id = p.store_id
      WHERE p.id = product_id AND s.owner_id = auth.uid()
    )
  );

-- Owner: delete
CREATE POLICY "product_options_delete_own"
  ON public.product_options FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.stores s ON s.id = p.store_id
      WHERE p.id = product_id AND s.owner_id = auth.uid()
    )
  );
