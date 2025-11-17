import { getRestaurantAdminInfo } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import LoyaltyManagement from '@/components/restaurant/loyalty-management'

export default async function LoyaltyPage() {
  const adminInfo = await getRestaurantAdminInfo()
  
  if (!adminInfo) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sadakat Programı</h1>
        <p className="text-muted-foreground mt-2">
          Müşteri sadakat puanlarını yönetin
        </p>
      </div>

      <LoyaltyManagement organizationId={adminInfo.organization_id} />
    </div>
  )
}
