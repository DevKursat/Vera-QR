export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'platform_admin' | 'restaurant_admin' | 'staff'
          phone: string | null
          last_login_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role: 'platform_admin' | 'restaurant_admin' | 'staff'
          phone?: string | null
          last_login_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'platform_admin' | 'restaurant_admin' | 'staff'
          phone?: string | null
          last_login_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      restaurants: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          primary_color: string | null
          address: string | null
          wifi_ssid: string | null
          wifi_password: string | null
          webhook_url: string | null
          api_key: string | null
          description: string | null
          working_hours: Json | null
          status: 'active' | 'suspended' | 'pending'
          subscription_tier: 'starter' | 'pro' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          primary_color?: string | null
          address?: string | null
          wifi_ssid?: string | null
          wifi_password?: string | null
          webhook_url?: string | null
          api_key?: string | null
          description?: string | null
          working_hours?: Json | null
          status?: 'active' | 'suspended' | 'pending'
          subscription_tier?: 'starter' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          primary_color?: string | null
          address?: string | null
          wifi_ssid?: string | null
          wifi_password?: string | null
          webhook_url?: string | null
          api_key?: string | null
          description?: string | null
          working_hours?: Json | null
          status?: 'active' | 'suspended' | 'pending'
          subscription_tier?: 'starter' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
      }
      restaurant_admins: {
        Row: {
          id: string
          profile_id: string
          restaurant_id: string
          permissions: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          restaurant_id: string
          permissions?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          restaurant_id?: string
          permissions?: Json | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          restaurant_id: string
          name_tr: string
          name_en: string | null
          description: string | null
          display_order: number | null
          visible: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name_tr: string
          name_en?: string | null
          description?: string | null
          display_order?: number | null
          visible?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name_tr?: string
          name_en?: string | null
          description?: string | null
          display_order?: number | null
          visible?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          restaurant_id: string
          category_id: string | null
          name_tr: string
          name_en: string | null
          description_tr: string | null
          description_en: string | null
          price: number
          image_url: string | null
          allergens: string[] | null
          ai_tags: string[] | null
          is_available: boolean | null
          stock_count: number | null
          display_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          category_id?: string | null
          name_tr: string
          name_en?: string | null
          description_tr?: string | null
          description_en?: string | null
          price: number
          image_url?: string | null
          allergens?: string[] | null
          ai_tags?: string[] | null
          is_available?: boolean | null
          stock_count?: number | null
          display_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          category_id?: string | null
          name_tr?: string
          name_en?: string | null
          description_tr?: string | null
          description_en?: string | null
          price?: number
          image_url?: string | null
          allergens?: string[] | null
          ai_tags?: string[] | null
          is_available?: boolean | null
          stock_count?: number | null
          display_order?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          restaurant_id: string
          qr_code_id: string | null
          order_number: string
          customer_name: string | null
          customer_phone: string | null
          customer_notes: string | null
          session_id: string | null
          status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'paid'
          subtotal: number
          tax_amount: number | null
          service_charge: number | null
          discount_amount: number | null
          total_amount: number
          payment_method: string | null
          payment_status: 'unpaid' | 'paid' | 'refunded'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          qr_code_id?: string | null
          order_number: string
          customer_name?: string | null
          customer_phone?: string | null
          customer_notes?: string | null
          session_id?: string | null
          status?: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'paid'
          subtotal: number
          tax_amount?: number | null
          service_charge?: number | null
          discount_amount?: number | null
          total_amount: number
          payment_method?: string | null
          payment_status?: 'unpaid' | 'paid' | 'refunded'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          qr_code_id?: string | null
          order_number?: string
          customer_name?: string | null
          customer_phone?: string | null
          customer_notes?: string | null
          session_id?: string | null
          status?: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'paid'
          subtotal?: number
          tax_amount?: number | null
          service_charge?: number | null
          discount_amount?: number | null
          total_amount?: number
          payment_method?: string | null
          payment_status?: 'unpaid' | 'paid' | 'refunded'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_: string]: never
    }
    Functions: {
      [_: string]: never
    }
    Enums: {
      [_: string]: never
    }
    CompositeTypes: {
      [_: string]: never
    }
  }
}
