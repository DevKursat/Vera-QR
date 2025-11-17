import { getRestaurantAdminInfo } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import CouponManagement from '@/components/restaurant/coupon-management'

export default async function CouponsPage() {
  const adminInfo = await getRestaurantAdminInfo()
  
  if (!adminInfo) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kupon Yönetimi</h1>
        <p className="text-muted-foreground mt-2">
          İndirim kuponları oluşturun ve yönetin
        </p>
      </div>

      <CouponManagement organizationId={adminInfo.organization_id} />
    </div>
  )
}
