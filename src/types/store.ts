import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Store = Database['public']['Tables']['stores']['Row']
export type StoreTheme = Database['public']['Tables']['store_theme']['Row']
export type StoreLayout = Database['public']['Tables']['store_layout']['Row']
export type StoreContent = Database['public']['Tables']['store_content']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']

export type ProductWithImages = Product & {
  images: ProductImage[]
  category: Category | null
}

export type StorePublicData = {
  store: Store
  theme: StoreTheme
  layout: StoreLayout
  content: StoreContent
  categories: Category[]
  products: ProductWithImages[]
}

export type AdminStoreData = {
  store: Store
  theme: StoreTheme
  layout: StoreLayout
  content: StoreContent
}

export type CardLayout = 'grid' | 'list'
export type ImageRatio = '1:1' | '4:5' | '3:4' | '16:9'
export type FontFamily = 'inter' | 'manrope' | 'geist' | 'dm-sans'
export type HeadingScale = 'compact' | 'default' | 'large'
export type BodyScale = 'sm' | 'base' | 'lg'
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'full'
export type ContainerWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full'
