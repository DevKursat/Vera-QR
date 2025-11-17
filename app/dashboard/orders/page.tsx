import { getRestaurantAdminInfo } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import OrdersDashboard from '@/components/restaurant/orders-dashboard'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const adminInfo = await getRestaurantAdminInfo()
  const supabase = createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, table:tables(table_number, location_description)')
    .eq('organization_id', adminInfo?.organization_id)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Siparişler</h1>
        <p className="text-slate-600 mt-1">
          Tüm siparişleri görüntüleyin ve yönetin
        </p>
      </div>

      <OrdersDashboard 
        initialOrders={orders || []} 
        organizationId={adminInfo!.organization_id}
      />
    </div>
  )
}
