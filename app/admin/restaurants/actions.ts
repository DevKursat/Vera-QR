'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Initialize admin client for auth management (Service Role)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createRestaurantWithAdmin(data: any) {
  const supabase = createClient()

  try {
    let userId: string

    // 1. Try to find existing profile (Scalable approach)
    // Since profiles are 1:1 with auth users, this helps us find the ID without listing all users
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('email', data.admin_email)
      .single()

    if (existingProfile) {
      userId = existingProfile.id
      console.log(`User profile already exists (${data.admin_email}), linking...`)

      // Update password if provided
      if (data.admin_password) {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: data.admin_password
        })
      }

      // Update role if needed (don't downgrade platform_admin)
      if (existingProfile.role !== 'platform_admin') {
        await supabaseAdmin
          .from('profiles')
          .update({ role: 'restaurant_admin' })
          .eq('id', userId)
      }

    } else {
      // No profile found, try to create user
      // If auth user exists but profile doesn't (rare edge case), createUser will fail
      try {
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: data.admin_email,
          password: data.admin_password,
          email_confirm: true,
          user_metadata: { full_name: data.name + ' Admin' }
        })

        if (authError) throw authError
        if (!authUser.user) throw new Error('Kullanıcı oluşturulamadı.')

        userId = authUser.user.id
      } catch (error: any) {
        // If error is "User already registered" but profile didn't exist
        if (error.message?.includes('already been registered') || error.status === 422) {
          console.log('User exists in Auth but not Profile. Attempting recovery...')
          // Fallback: We must find the ID. Since we can't query by email easily without listUsers
          // and we want to avoid listUsers, we're in a tight spot.
          // However, for this specific edge case, we can try to fetch the user by list (filtered)
          // Note: supabase-js admin.listUsers() does not support email filter.
          // We will assume this edge case is rare enough or manual intervention needed,
          // OR we accept the risk of listUsers just for this error catch block.

          const { data: users } = await supabaseAdmin.auth.admin.listUsers()
          const found = users?.users.find(u => u.email === data.admin_email)

          if (found) {
            userId = found.id
          } else {
             throw new Error('Kullanıcı zaten kayıtlı fakat profili bulunamadı ve erişilemiyor.')
          }
        } else {
          throw error
        }
      }

      // Ensure Profile Exists
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          email: data.admin_email,
          role: 'restaurant_admin',
          full_name: data.name + ' Yöneticisi',
          is_active: true
        })

      if (profileError) throw new Error(`Profil oluşturulamadı: ${profileError.message}`)
    }

    // 3. Create Restaurant
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description,
        address: data.address,
        primary_color: data.brand_color,
        working_hours: data.working_hours,
        logo_url: data.logo_url,
        status: 'active',
        subscription_tier: 'starter',
      })
      .select()
      .single()

    if (restaurantError) {
        // Cleanup user if restaurant fails? Ideally yes, but for MVP let's just error.
        // await supabaseAdmin.auth.admin.deleteUser(userId)
        throw new Error(`Restoran oluşturulamadı: ${restaurantError.message}`)
    }

    // 4. Link Admin to Restaurant
    const { error: linkError } = await supabase
      .from('restaurant_admins')
      .insert({
        profile_id: userId,
        restaurant_id: restaurant.id,
        permissions: ['all']
      })

    if (linkError) throw new Error(`Yönetici yetkisi verilemedi: ${linkError.message}`)

    // 5. Create AI Config
    await supabase.from('ai_configs').insert({
      restaurant_id: restaurant.id,
      personality: data.ai_personality,
      custom_prompt: `Sen ${data.name}'nin AI asistanısın. Müşterilere yardımcı ol, menü hakkında bilgi ver ve sipariş almalarına yardım et.`,
      language: 'tr',
      auto_translate: true,
      model: 'gpt-4',
    })

    // 6. Create Default Categories
    if (data.categories && data.categories.length > 0) {
        const categoryPromises = data.categories.map((name: string, index: number) =>
            supabase.from('categories').insert({
                restaurant_id: restaurant.id,
                name_tr: name,
                display_order: index,
                visible: true
            })
        )
        await Promise.all(categoryPromises)
    }

    // 7. Create Default QR Codes (10 tables)
    const crypto = require('crypto')
    const qrPromises = Array.from({ length: 10 }, (_, i) => {
        const tableNumber = `Masa ${i + 1}`
        const hash = crypto.randomBytes(16).toString('hex') // Generate here for safety
        return supabase.from('qr_codes').insert({
          restaurant_id: restaurant.id,
          table_number: tableNumber,
          qr_code_hash: hash,
          location_description: i < 5 ? 'Ana Salon' : 'Teras',
          status: 'active',
        })
    })
    await Promise.all(qrPromises)

    revalidatePath('/admin/restaurants')
    return { success: true, restaurantId: restaurant.id }

  } catch (error: any) {
    console.error('Create Restaurant Error:', error)
    return { error: error.message }
  }
}

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
    // Use maybeSingle to avoid error if multiple admins exist (just take the first one for now)
    // Ideally we should list all admins, but requirement implies "The" admin.
    const { data: adminRel, error: relError } = await supabase
        .from('restaurant_admins')
        .select('profile_id')
        .eq('restaurant_id', restaurantId)
        .limit(1)
        .maybeSingle()

    if (relError) {
        console.error("Error finding restaurant admin:", relError)
        return { error: 'Database error finding admin' }
    }

    if (!adminRel) {
        // If no relation found in restaurant_admins, try fallback:
        // Find ANY profile that has role 'restaurant_admin' created recently?
        // Or just return clearer error.
        // It's possible the migration didn't create the link for manually added tests.
        return { error: 'No admin account linked to this restaurant. Please create a new admin user manually.' }
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
