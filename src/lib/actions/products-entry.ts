'use server'

import {
  createCategory as createCategoryCore,
  createProduct as createProductCore,
  deleteCategory as deleteCategoryCore,
  deleteProduct as deleteProductCore,
  deleteProductImage as deleteProductImageCore,
  updateCategory as updateCategoryCore,
  updateProduct as updateProductCore,
} from './products'
import { uploadProductImageForPlan } from './product-images'
import type { CategoryInput, ProductInput } from '@/lib/validations/product'

export async function createProduct(input: ProductInput) {
  return createProductCore(input)
}

export async function updateProduct(productId: string, input: ProductInput) {
  return updateProductCore(productId, input)
}

export async function deleteProduct(productId: string) {
  return deleteProductCore(productId)
}

export async function uploadProductImage(productId: string, formData: FormData) {
  return uploadProductImageForPlan(productId, formData)
}

export async function deleteProductImage(imageId: string, productId: string) {
  return deleteProductImageCore(imageId, productId)
}

export async function createCategory(input: CategoryInput) {
  return createCategoryCore(input)
}

export async function updateCategory(categoryId: string, input: CategoryInput) {
  return updateCategoryCore(categoryId, input)
}

export async function deleteCategory(categoryId: string) {
  return deleteCategoryCore(categoryId)
}
