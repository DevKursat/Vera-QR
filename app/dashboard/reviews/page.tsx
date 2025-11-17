import { getRestaurantAdminInfo } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import ReviewsManagement from '@/components/restaurant/reviews-management'

export default async function ReviewsPage() {
  const adminInfo = await getRestaurantAdminInfo()
  
  if (!adminInfo) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Müşteri Yorumları</h1>
        <p className="text-muted-foreground mt-2">
          Müşteri yorumlarını görüntüleyin ve yanıtlayın
        </p>
      </div>

      <ReviewsManagement organizationId={adminInfo.organization_id} />
    </div>
  )
}
