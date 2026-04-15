import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Store = Database['public']['Tables']['stores']['Row']
export type StoreTheme = Database['public']['Tables']['store_theme']['Row']
export type StoreLayout = Database['public']['Tables']['store_layout']['Row']
export type StoreContent = Database['public']['Tables']['store_content']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']

// Selectable attribute group for a product (e.g., name="Talle", values=["S","M","L","XL"])
export type ProductOption = {
  id: string
  product_id: string
  name: string
  values: string[]
  sort_order: number
  created_at: string
}

export type ProductWithImages = Product & {
  images: ProductImage[]
  category: Category | null
  options: ProductOption[]
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

export type StoreStatus = Store['status']
export type FontFamily = 'geist' | 'plus-jakarta' | 'playfair'
export type FontPreset = 'elegant' | 'modern' | 'minimal' | 'bold' | 'editorial' | 'tech'
export type HeadingScale = 'compact' | 'default' | 'large'
export type HeadingWeight = 'medium' | 'semibold' | 'bold'
export type BodyScale = 'sm' | 'base' | 'lg'
export type VisualMode = 'light' | 'dark' | 'auto'
export type UIDensity = 'compact' | 'comfortable' | 'spacious'
export type SpacingScale = 'tight' | 'balanced' | 'airy'
export type CardStyle = 'soft' | 'sharp' | 'glass'
export type ButtonStyle = 'rounded' | 'square' | 'pill'
export type CardLayout = 'grid' | 'list' | 'classic' | 'visual' | 'compact'
export type ImageRatio = '1:1' | '4:5' | '3:4' | '16:9'
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'full'
export type ContainerWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full'
export type BannerMode = 'static' | 'animated'
export type BannerSpeed = 'slow' | 'normal' | 'fast'
