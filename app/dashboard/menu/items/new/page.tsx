import { getRestaurantAdminInfo } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import MenuItemForm from '@/components/restaurant/menu-item-form'

export default async function NewMenuItemPage() {
  const adminInfo = await getRestaurantAdminInfo()
  const supabase = createClient()

  const { data: categories } = await supabase
    .from('menu_categories')
    .select('id, name')
    .eq('organization_id', adminInfo?.organization_id)
    .order('display_order', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/menu">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Yeni Ürün Ekle</h1>
          <p className="text-slate-600 mt-1">Menüye yeni ürün ekleyin</p>
        </div>
      </div>

      <MenuItemForm
        organizationId={adminInfo!.organization_id}
        categories={categories || []}
      />
    </div>
  )
}
