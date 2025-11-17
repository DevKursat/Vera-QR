import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RestaurantMenu from '@/components/customer/restaurant-menu'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
  searchParams: { table?: string; qr?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  
  const { data: organization } = await supabase
    .from('organizations')
    .select('name, description')
    .eq('slug', params.slug)
    .eq('status', 'active')
    .single()

  if (!organization) {
    return {
      title: 'Restaurant Not Found',
    }
  }

  return {
    title: `${organization.name} - Digital Menu`,
    description: organization.description || `View the menu at ${organization.name}`,
  }
}

export default async function RestaurantPage({ params, searchParams }: Props) {
  const supabase = createClient()

  // Fetch organization
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'active')
    .single()

  if (orgError || !organization) {
    notFound()
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('organization_id', organization.id)
    .eq('visible', true)
    .order('display_order', { ascending: true })

  // Fetch menu items
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('organization_id', organization.id)
    .eq('available', true)
    .order('display_order', { ascending: true })

  // Fetch active campaigns
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('organization_id', organization.id)
    .eq('active', true)
    .lte('start_date', new Date().toISOString())
    .gte('end_date', new Date().toISOString())

  // Get table info if provided
  let tableInfo = null
  if (searchParams.table && searchParams.qr) {
    const { data: table } = await supabase
      .from('tables')
      .select('*')
      .eq('id', searchParams.table)
      .eq('qr_code', searchParams.qr)
      .single()

    tableInfo = table
  }

  // Organize menu by categories
  const menuByCategory = categories?.map(category => ({
    ...category,
    items: menuItems?.filter(item => item.category_id === category.id) || [],
  })) || []

  return (
    <RestaurantMenu
      organization={organization}
      categories={menuByCategory}
      campaigns={campaigns || []}
      tableInfo={tableInfo}
    />
  )
}
