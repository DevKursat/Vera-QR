// import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import EditRestaurantForm from '@/components/admin/restaurants/edit-restaurant-form'
import { notFound } from 'next/navigation'

export default async function EditRestaurantPage({ params }: { params: { id: string } }) {
  // const supabase = createClient()

  // const { data: restaurant, error } = await supabase
  //   .from('restaurants')
  //   .select('*')
  //   .eq('id', params.id)
  //   .single()

  const restaurant = {
    id: params.id,
    name: 'Test Restaurant',
    slug: 'test-restaurant',
    status: 'active',
    subscription_tier: 'pro',
    description: 'A nice test restaurant',
    address: 'Istanbul, Turkey'
  }

  if (!restaurant) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/restaurants">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">İşletme Düzenle</h1>
          <p className="text-slate-600 mt-1">
            {restaurant.name}
          </p>
        </div>
      </div>

      <EditRestaurantForm restaurant={restaurant} />
    </div>
  )
}
