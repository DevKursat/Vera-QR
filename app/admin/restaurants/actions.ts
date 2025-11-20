'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateRestaurant(id: string, formData: FormData) {
  const supabase = createClient()

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const status = formData.get('status') as string
  const subscription_tier = formData.get('subscription_tier') as string
  const description = formData.get('description') as string
  const address = formData.get('address') as string

  const { error } = await supabase
    .from('restaurants')
    .update({
      name,
      slug,
      status,
      subscription_tier,
      description,
      address,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/restaurants')
  revalidatePath(`/admin/restaurants/${id}/edit`)
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
