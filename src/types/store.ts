import type { Database } from './database'

export type CheckoutCustomField = {
  id: string
  label: string
  field_type: 'short' | 'long'
  placeholder: string | null
  is_required: boolean
  is_enabled: boolean
}

export type PaymentMethod = 'transfer' | 'cash' | 'mercado_pago' | 'arrange'
export type FulfillmentMethod = 'pickup' | 'delivery'

export type SalesSettings = {
  paymentMethods: PaymentMethod[]
  fulfillmentMethods: FulfillmentMethod[]
  deliveryArea: string | null
  minimumOrderAmount: number | null
  deliveryNotes: string | null
}

export type RepeatableProduct = {
  id: string
  name: string
  price: number
  imageUrl: string | null
  options: Array<{ name: string; values: string[] }>
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Store = Database['public']['Tables']['stores']['Row'] & {
  checkout_custom_fields?: CheckoutCustomField[]
  payment_methods?: PaymentMethod[]
  fulfillment_methods?: FulfillmentMethod[]
  delivery_area?: string | null
  minimum_order_amount?: number | null
  delivery_notes?: string | null
}
export type StoreTheme = Database['public']['Tables']['store_theme']['Row']
export type StoreLayout = Database['public']['Tables']['store_layout']['Row'] & {
  catalog_mode?: 'all' | 'sections' | 'navigation'
  show_catalog_search?: boolean
  show_catalog_brands?: boolean
}
export type HeroImageLayout = 'side' | 'background'
export type HeroTitleFont = 'inherit' | 'geist' | 'plus-jakarta' | 'playfair'
export type HeroTitleScale = 'subtle' | 'balanced' | 'impact'
export type HeroTextAlign = 'left' | 'center'
export type HeroTitleWeight = 'medium' | 'semibold' | 'bold'
export type StoreContent = Database['public']['Tables']['store_content']['Row'] & {
  hero_image_layout?: HeroImageLayout
  hero_overlay_opacity?: number
  hero_title_font?: HeroTitleFont
  hero_title_scale?: HeroTitleScale
  hero_text_align?: HeroTextAlign
  hero_title_weight?: HeroTitleWeight
}
export type Category = Database['public']['Tables']['categories']['Row']
export type Brand = {
  id: string
  store_id: string
  name: string
  slug: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}
export type ProductAvailability = 'available' | 'sold_out'
export type Product = Database['public']['Tables']['products']['Row'] & {
  brand_id: string | null
  sku: string | null
  category_sort_order: number
  availability_status: ProductAvailability
}
export type ProductImage = Database['public']['Tables']['product_images']['Row']

export type ProductOption = {
  id: string
  product_id: string
  name: string
  values: string[]
  unavailable_values: string[]
  sort_order: number
  created_at: string
}

export type ProductWithImages = Product & {
  images: ProductImage[]
  category: Category | null
  brand: Brand | null
  options: ProductOption[]
}

export type StorePublicData = {
  store: Store
  theme: StoreTheme
  layout: StoreLayout
  content: StoreContent
  categories: Category[]
  brands: Brand[]
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
