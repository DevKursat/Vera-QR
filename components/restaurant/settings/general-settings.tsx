'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Save } from 'lucide-react'
import GooglePlacesAutocomplete from '@/components/admin/google-places-autocomplete'

interface Props {
  restaurantId: string
}

export default function GeneralSettings({ restaurantId }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    wifi_ssid: '',
    wifi_password: '',
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchRestaurant = async () => {
      const { data } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single()

      if (data) {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          address: data.address || '',
          phone: (data as any).phone || '', // Assuming phone column exists or adding loosely
          email: (data as any).email || '',
          wifi_ssid: data.wifi_ssid || '',
          wifi_password: data.wifi_password || '',
        })
      }
    }
    fetchRestaurant()
  }, [restaurantId])

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          name: formData.name,
          description: formData.description,
          address: formData.address,
          wifi_ssid: formData.wifi_ssid,
          wifi_password: formData.wifi_password,
          // Add other fields if schema supports them
        })
        .eq('id', restaurantId)

      if (error) throw error

      toast({
        title: 'Başarılı',
        description: 'Ayarlar güncellendi',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Temel Bilgiler</CardTitle>
          <CardDescription>İşletmenizin temel bilgilerini düzenleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>İşletme Adı</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Açıklama</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Adres</Label>
            <GooglePlacesAutocomplete
              value={formData.address}
              onChange={(val) => setFormData({...formData, address: val})}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wi-Fi Bilgileri</CardTitle>
          <CardDescription>Müşterileriniz için QR menüde gösterilecek Wi-Fi bilgileri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Wi-Fi Adı (SSID)</Label>
              <Input
                value={formData.wifi_ssid}
                onChange={(e) => setFormData({...formData, wifi_ssid: e.target.value})}
                placeholder="Misafir Agi"
              />
            </div>
            <div className="space-y-2">
              <Label>Wi-Fi Şifresi</Label>
              <Input
                value={formData.wifi_password}
                onChange={(e) => setFormData({...formData, wifi_password: e.target.value})}
                type="text"
                placeholder="sifre123"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Değişiklikleri Kaydet
        </Button>
      </div>
    </div>
  )
}
