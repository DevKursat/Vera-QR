import { getRestaurantAdminInfo } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import TableCallsManagement from '@/components/restaurant/table-calls-management'

export const dynamic = 'force-dynamic'

export default async function CallsPage() {
  const supabase = createClient()
  const adminInfo = await getRestaurantAdminInfo()

  const { data: calls } = await supabase
    .from('table_calls')
    .select('*, table:tables(table_number, location_description)')
    .eq('organization_id', adminInfo?.organization_id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Çağrı İstekleri</h1>
        <p className="text-slate-600 mt-1">
          Müşteri çağrı isteklerini yönetin
        </p>
      </div>

      <TableCallsManagement
        initialCalls={calls || []}
        organizationId={adminInfo!.organization_id}
      />
    </div>
  )
}
