import { getRestaurantAdminInfo } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, Download } from 'lucide-react'
import Link from 'next/link'
import TablesManagement from '@/components/restaurant/tables-management'

export default async function TablesPage() {
  const supabase = createClient()
  const adminInfo = await getRestaurantAdminInfo()

  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('restaurant_id', adminInfo?.restaurant_id)
    .order('table_number', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Masalar & QR Kodlar</h1>
          <p className="text-slate-600 mt-1">
            Masa ve QR kodlarını yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Tüm QR Kodları İndir
          </Button>
          <Link href="/dashboard/tables/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Masa
            </Button>
          </Link>
        </div>
      </div>

      <TablesManagement
        qrCodes={qrCodes || []}
        restaurant={adminInfo!.restaurant}
      />
    </div>
  )
}
