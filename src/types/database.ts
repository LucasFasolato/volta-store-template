export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          id: string
          owner_id: string
          slug: string
          name: string
          whatsapp: string
          instagram: string | null
          address: string | null
          hours: string | null
          logo_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          slug: string
          name: string
          whatsapp: string
          instagram?: string | null
          address?: string | null
          hours?: string | null
          logo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          name?: string
          whatsapp?: string
          instagram?: string | null
          address?: string | null
          hours?: string | null
          logo_url?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      store_theme: {
        Row: {
          id: string
          store_id: string
          primary_color: string
          secondary_color: string
          background_color: string
          text_color: string
          border_radius: string
          container_width: string
          font_family: string
          heading_scale: string
          body_scale: string
          card_layout: string
          grid_columns: number
          image_ratio: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          primary_color?: string
          secondary_color?: string
          background_color?: string
          text_color?: string
          border_radius?: string
          container_width?: string
          font_family?: string
          heading_scale?: string
          body_scale?: string
          card_layout?: string
          grid_columns?: number
          image_ratio?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          primary_color?: string
          secondary_color?: string
          background_color?: string
          text_color?: string
          border_radius?: string
          container_width?: string
          font_family?: string
          heading_scale?: string
          body_scale?: string
          card_layout?: string
          grid_columns?: number
          image_ratio?: string
          updated_at?: string
        }
        Relationships: []
      }
      store_layout: {
        Row: {
          id: string
          store_id: string
          show_hero: boolean
          show_featured: boolean
          show_categories: boolean
          show_catalog: boolean
          show_footer: boolean
          sections_order: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          show_hero?: boolean
          show_featured?: boolean
          show_categories?: boolean
          show_catalog?: boolean
          show_footer?: boolean
          sections_order?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          show_hero?: boolean
          show_featured?: boolean
          show_categories?: boolean
          show_catalog?: boolean
          show_footer?: boolean
          sections_order?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      store_content: {
        Row: {
          id: string
          store_id: string
          hero_title: string
          hero_subtitle: string
          support_text: string
          hero_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          hero_title?: string
          hero_subtitle?: string
          support_text?: string
          hero_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          hero_title?: string
          hero_subtitle?: string
          support_text?: string
          hero_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          store_id: string
          name: string
          slug: string
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          slug: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          store_id: string
          category_id: string | null
          name: string
          slug: string
          short_description: string | null
          description: string | null
          price: number
          compare_price: number | null
          badge: string | null
          is_featured: boolean
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          category_id?: string | null
          name: string
          slug: string
          short_description?: string | null
          description?: string | null
          price: number
          compare_price?: number | null
          badge?: string | null
          is_featured?: boolean
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          name?: string
          slug?: string
          short_description?: string | null
          description?: string | null
          price?: number
          compare_price?: number | null
          badge?: string | null
          is_featured?: boolean
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          url?: string
          alt?: string | null
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
