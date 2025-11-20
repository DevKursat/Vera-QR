'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Initialize admin client for auth management (Service Role)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function updateRestaurant(id: string, data: any) {
  const supabase = createClient()

  // Update restaurant details
  const { error } = await supabase
    .from('restaurants')
    .update({
      name: data.name,
      slug: data.slug,
      status: data.status,
      subscription_tier: data.subscription_tier,
      description: data.description,
      address: data.address,
      primary_color: data.brand_color,
      working_hours: data.working_hours,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating restaurant:', error)
    return { error: error.message }
  }

  // Update AI Config
  if (data.ai_personality) {
    const { error: aiError } = await supabase
      .from('ai_configs')
      .update({
        personality: data.ai_personality,
        // Also update prompt if personality changes? Optional but good for consistency
      })
      .eq('restaurant_id', id)

    if (aiError) console.error('Error updating AI config:', aiError)
  }

  revalidatePath('/admin/restaurants')
  revalidatePath(`/admin/restaurants/${id}/edit`)
  return { success: true }
}

export async function updateRestaurantAdmin(restaurantId: string, email: string, password?: string) {
    // 1. Find the admin profile for this restaurant
    const supabase = createClient()

    // Get restaurant admin relation
    const { data: adminRel, error: relError } = await supabase
        .from('restaurant_admins')
        .select('profile_id')
        .eq('restaurant_id', restaurantId)
        .single()

    if (relError || !adminRel) {
        // If no admin exists, we might need to create one, but for "Update" logic
        // we assume one exists or we are updating the "Primary" admin.
        // For now, return error if not found.
        return { error: 'Restaurant admin not found' }
    }

    const profileId = adminRel.profile_id

    // 2. Update Email/Password via Admin API
    const updates: any = {}
    if (email) updates.email = email
    if (password) updates.password = password

    if (Object.keys(updates).length > 0) {
        const { data: user, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            profileId,
            updates
        )

        if (updateError) {
            return { error: updateError.message }
        }

        // Update profile email if changed
        if (email) {
            await supabase.from('profiles').update({ email }).eq('id', profileId)
        }
    }

    return { success: true }
}

export async function createQRCode(restaurantId: string, formData: FormData) {
  const supabase = createClient()

  const table_number = formData.get('table_number') as string
  const location_description = formData.get('location_description') as string

  // Generate random hash for QR code
  const crypto = require('crypto')
  const qr_code_hash = crypto.randomBytes(16).toString('hex')

  const { error } = await supabase
    .from('qr_codes')
    .insert({
      restaurant_id: restaurantId,
      table_number,
      location_description,
      qr_code_hash,
      status: 'active'
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/restaurants/${restaurantId}/qr`)
  return { success: true }
}
