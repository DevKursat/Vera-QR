import { redirect } from 'next/navigation'
import { getRestaurantAdminInfo } from '@/lib/supabase/auth'
import { Toaster } from '@/components/ui/toaster'
import RestaurantSidebar from '@/components/restaurant/restaurant-sidebar'
import RestaurantHeader from '@/components/restaurant/restaurant-header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminInfo = await getRestaurantAdminInfo()
  
  if (!adminInfo) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <RestaurantSidebar organization={adminInfo.organization} />
      <div className="lg:pl-64">
        <RestaurantHeader admin={adminInfo} />
        <main className="p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}
