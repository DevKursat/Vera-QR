'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { updateRestaurant } from '@/app/admin/restaurants/actions'
import { useRouter } from 'next/navigation'

interface Restaurant {
  id: string
  name: string
  slug: string
  status: string
  subscription_tier: string
  description: string | null
  address: string | null
}

interface EditRestaurantFormProps {
  restaurant: Restaurant
}

export default function EditRestaurantForm({ restaurant }: EditRestaurantFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.currentTarget)

    const result = await updateRestaurant(restaurant.id, formData)

    setIsLoading(false)

    if (result.error) {
      toast({
        title: "Hata",
        description: result.error,
        variant: "destructive"
      })
    } else {
      toast({
        title: "Başarılı",
        description: "İşletme bilgileri güncellendi.",
      })
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Genel Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">İşletme Adı</Label>
              <Input id="name" name="name" defaultValue={restaurant.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input id="slug" name="slug" defaultValue={restaurant.slug} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Durum</Label>
              <select
                id="status"
                name="status"
                defaultValue={restaurant.status}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Aktif</option>
                <option value="suspended">Askıya Alındı</option>
                <option value="pending">Onay Bekliyor</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscription_tier">Abonelik Paketi</Label>
              <select
                id="subscription_tier"
                name="subscription_tier"
                defaultValue={restaurant.subscription_tier}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adres</Label>
            <Textarea id="address" name="address" defaultValue={restaurant.address || ''} rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea id="description" name="description" defaultValue={restaurant.description || ''} rows={3} />
          </div>

          <div className="flex justify-end">
             <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Değişiklikleri Kaydet
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
