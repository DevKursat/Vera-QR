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
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          brand_color: string
          address: string | null
          location: unknown | null
          description: string | null
          api_key: string | null
          working_hours: Json
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
          brand_color?: string
          address?: string | null
          location?: unknown | null
          description?: string | null
          api_key?: string | null
          working_hours?: Json
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
          brand_color?: string
          address?: string | null
          location?: unknown | null
          description?: string | null
          api_key?: string | null
          working_hours?: Json
          status?: 'active' | 'suspended' | 'pending'
          subscription_tier?: 'starter' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
      }
      menu_categories: {
        Row: {
          id: string
          organization_id: string
          name: string
          name_translations: Json
          display_order: number
          visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          name_translations?: Json
          display_order?: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          name_translations?: Json
          display_order?: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          organization_id: string
          category_id: string | null
          name: string
          name_translations: Json
          description: string | null
          description_translations: Json
          price: number
          image_url: string | null
          allergens: string[]
          available: boolean
          stock_count: number | null
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          category_id?: string | null
          name: string
          name_translations?: Json
          description?: string | null
          description_translations?: Json
          price: number
          image_url?: string | null
          allergens?: string[]
          available?: boolean
          stock_count?: number | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          category_id?: string | null
          name?: string
          name_translations?: Json
          description?: string | null
          description_translations?: Json
          price?: number
          image_url?: string | null
          allergens?: string[]
          available?: boolean
          stock_count?: number | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      tables: {
        Row: {
          id: string
          organization_id: string
          table_number: string
          qr_code: string
          location_description: string | null
          status: 'available' | 'occupied' | 'reserved' | 'disabled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          table_number: string
          qr_code: string
          location_description?: string | null
          status?: 'available' | 'occupied' | 'reserved' | 'disabled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          table_number?: string
          qr_code?: string
          location_description?: string | null
          status?: 'available' | 'occupied' | 'reserved' | 'disabled'
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          organization_id: string
          table_id: string | null
          order_number: string
          items: Json
          total_amount: number
          status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'
          customer_name: string | null
          customer_notes: string | null
          session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          table_id?: string | null
          order_number: string
          items: Json
          total_amount: number
          status?: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'
          customer_name?: string | null
          customer_notes?: string | null
          session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          table_id?: string | null
          order_number?: string
          items?: Json
          total_amount?: number
          status?: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'
          customer_name?: string | null
          customer_notes?: string | null
          session_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_conversations: {
        Row: {
          id: string
          organization_id: string
          session_id: string
          messages: Json
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          session_id: string
          messages: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          session_id?: string
          messages?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          password_hash: string
          full_name: string | null
          role: 'platform_admin' | 'restaurant_admin' | 'staff'
          organization_id: string | null
          avatar_url: string | null
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          full_name?: string | null
          role?: 'platform_admin' | 'restaurant_admin' | 'staff'
          organization_id?: string | null
          avatar_url?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          full_name?: string | null
          role?: 'platform_admin' | 'restaurant_admin' | 'staff'
          organization_id?: string | null
          avatar_url?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          organization_id: string
          title: string
          description: string | null
          discount_percentage: number | null
          discount_amount: number | null
          active: boolean
          start_date: string | null
          end_date: string | null
          conditions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          title: string
          description?: string | null
          discount_percentage?: number | null
          discount_amount?: number | null
          active?: boolean
          start_date?: string | null
          end_date?: string | null
          conditions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          title?: string
          description?: string | null
          discount_percentage?: number | null
          discount_amount?: number | null
          active?: boolean
          start_date?: string | null
          end_date?: string | null
          conditions?: Json
          created_at?: string
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          organization_id: string
          event_type: string
          event_data: Json
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          event_type: string
          event_data?: Json
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          event_type?: string
          event_data?: Json
          session_id?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Helper types
export type Organization = Database['public']['Tables']['organizations']['Row']
export type MenuCategory = Database['public']['Tables']['menu_categories']['Row']
export type MenuItem = Database['public']['Tables']['menu_items']['Row']
export type Table = Database['public']['Tables']['tables']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type AIConversation = Database['public']['Tables']['ai_conversations']['Row']
export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row']

// Extended types with relations
export type MenuItemWithCategory = MenuItem & {
  category: MenuCategory | null
}

export type OrderWithDetails = Order & {
  table: Table | null
  organization: Organization
}

export type OrderItem = {
  id: string
  name: string
  price: number
  quantity: number
  notes?: string
}

export type WorkingHours = {
  [key: string]: {
    open: string
    close: string
    closed?: boolean
  }
}

export type AIMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}
