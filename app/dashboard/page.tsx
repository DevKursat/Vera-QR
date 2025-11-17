import { createClient } from '@/lib/supabase/server'
import { getRestaurantAdminInfo } from '@/lib/supabase/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, DollarSign, Users, TrendingUp, UtensilsCrossed } from 'lucide-react'

export default async function RestaurantDashboard() {
  const supabase = createClient()
  const adminInfo = await getRestaurantAdminInfo()

  // Fetch today's statistics
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    { count: todayOrders },
    { data: todayRevenue },
    { count: pendingOrders },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', adminInfo?.organization_id)
      .gte('created_at', today.toISOString()),
    supabase
      .from('orders')
      .select('total_amount')
      .eq('organization_id', adminInfo?.organization_id)
      .gte('created_at', today.toISOString()),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', adminInfo?.organization_id)
      .in('status', ['pending', 'preparing']),
  ])

  const totalRevenue = todayRevenue?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0

  const stats = [
    {
      title: 'Bugünkü Siparişler',
      value: todayOrders || 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Bugünkü Ciro',
      value: `₺${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Bekleyen Siparişler',
      value: pendingOrders || 0,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Ort. Sipariş',
      value: todayOrders && todayOrders > 0 ? `₺${(totalRevenue / todayOrders).toFixed(2)}` : '₺0',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          {adminInfo?.organization?.name} - Anlık İstatistikler
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/dashboard/menu"
              className="p-4 rounded-lg border-2 border-slate-200 hover:border-blue-500 transition-colors text-center"
            >
              <UtensilsCrossed className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              <div className="text-sm font-medium">Menü Düzenle</div>
            </a>
            <a
              href="/dashboard/orders"
              className="p-4 rounded-lg border-2 border-slate-200 hover:border-blue-500 transition-colors text-center"
            >
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              <div className="text-sm font-medium">Siparişler</div>
            </a>
            <a
              href="/dashboard/tables"
              className="p-4 rounded-lg border-2 border-slate-200 hover:border-blue-500 transition-colors text-center"
            >
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              <div className="text-sm font-medium">QR Kodlar</div>
            </a>
            <a
              href="/dashboard/analytics"
              className="p-4 rounded-lg border-2 border-slate-200 hover:border-blue-500 transition-colors text-center"
            >
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              <div className="text-sm font-medium">Analitik</div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
