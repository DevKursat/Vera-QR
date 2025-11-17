import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './types'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie setting errors
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie removal errors
          }
        },
      },
    }
  )
}

export async function createAdminClient() {
  const cookieStore = cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie setting errors
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie removal errors
          }
        },
      },
    }
  )

  return supabase
}

// Get current authenticated user
export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

// Check if user is platform admin
export async function isPlatformAdmin() {
  const user = await getCurrentUser()
  console.log('🔍 isPlatformAdmin - Current user:', user?.id, user?.email)
  
  if (!user) {
    console.log('❌ isPlatformAdmin - No user found')
    return false
  }
  
  const supabase = createClient()
  const { data, error } = await supabase
    .from('platform_admins')
    .select('id, is_super_admin')
    .eq('user_id', user.id)
    .maybeSingle()
  
  console.log('🔍 isPlatformAdmin - Query result:', { data, error })
  
  return !!data
}

// Check if user is super admin
export async function isSuperAdmin() {
  const user = await getCurrentUser()
  if (!user) return false
  
  const supabase = createClient()
  const { data } = await supabase
    .from('platform_admins')
    .select('is_super_admin')
    .eq('user_id', user.id)
    .maybeSingle()
  
  return data?.is_super_admin === true
}

// Get user's restaurant admin info
export async function getRestaurantAdminInfo() {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = createClient()
  const { data } = await supabase
    .from('admin_users')
    .select('*, organization:organizations(*)')
    .eq('user_id', user.id)
    .maybeSingle()
  
  return data
}

// Check if user has access to organization
export async function hasOrganizationAccess(organizationId: string) {
  const user = await getCurrentUser()
  if (!user) return false
  
  // Check if platform admin
  if (await isPlatformAdmin()) return true
  
  // Check if restaurant admin for this org
  const supabase = createClient()
  const { data } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .eq('organization_id', organizationId)
    .maybeSingle()
  
  return !!data
}

// Get user role for organization
export async function getUserRole(organizationId: string): Promise<'owner' | 'admin' | 'staff' | null> {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = createClient()
  const { data } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', organizationId)
    .maybeSingle()
  
  return data?.role as any || null
}
