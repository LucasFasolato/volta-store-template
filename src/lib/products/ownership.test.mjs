import assert from 'node:assert/strict'
import test from 'node:test'
import { validateOwnedProductRelations } from './ownership.ts'

function relationDatabase(input) {
  return {
    from(table) {
      const filters = new Map()
      const query = {
        select() {
          return query
        },
        eq(column, value) {
          filters.set(column, value)
          return query
        },
        async maybeSingle() {
          if (input.errorTable === table) {
            return { data: null, error: { message: `failed ${table}` } }
          }

          const data = (input[table] ?? []).find(
            (row) => row.id === filters.get('id') && row.store_id === filters.get('store_id'),
          )
          return { data: data ? { id: data.id } : null, error: null }
        },
      }
      return query
    },
  }
}

test('accepts category and brand owned by the current store', async () => {
  const db = relationDatabase({
    categories: [{ id: 'category-a', store_id: 'store-a' }],
    brands: [{ id: 'brand-a', store_id: 'store-a' }],
  })

  assert.equal(
    await validateOwnedProductRelations(db, 'store-a', 'category-a', 'brand-a'),
    null,
  )
})

test('rejects a category that belongs to another store', async () => {
  const db = relationDatabase({
    categories: [{ id: 'category-b', store_id: 'store-b' }],
  })

  assert.equal(
    await validateOwnedProductRelations(db, 'store-a', 'category-b', null),
    'La categoría ya no existe.',
  )
})

test('rejects a brand that belongs to another store', async () => {
  const db = relationDatabase({
    brands: [{ id: 'brand-b', store_id: 'store-b' }],
  })

  assert.equal(
    await validateOwnedProductRelations(db, 'store-a', null, 'brand-b'),
    'La marca ya no existe.',
  )
})

test('surfaces relation lookup failures without authorizing the write', async () => {
  const db = relationDatabase({ errorTable: 'categories' })

  assert.equal(
    await validateOwnedProductRelations(db, 'store-a', 'category-a', null),
    'failed categories',
  )
})
