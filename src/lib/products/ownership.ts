type RelationResult = {
  data: { id: string } | null
  error: { message: string } | null
}

type RelationQuery = {
  select: (columns: 'id') => RelationQuery
  eq: (column: 'id' | 'store_id', value: string) => RelationQuery
  maybeSingle: () => Promise<RelationResult>
}

type RelationDatabase = {
  from: (table: 'categories' | 'brands') => RelationQuery
}

export async function validateOwnedProductRelations(
  db: RelationDatabase,
  storeId: string,
  categoryId: string | null | undefined,
  brandId: string | null | undefined,
) {
  const [categoryResult, brandResult] = await Promise.all([
    categoryId
      ? db.from('categories').select('id').eq('id', categoryId).eq('store_id', storeId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    brandId
      ? db.from('brands').select('id').eq('id', brandId).eq('store_id', storeId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])

  if (categoryResult.error) return categoryResult.error.message
  if (brandResult.error) return brandResult.error.message
  if (categoryId && !categoryResult.data) return 'La categoría ya no existe.'
  if (brandId && !brandResult.data) return 'La marca ya no existe.'
  return null
}
