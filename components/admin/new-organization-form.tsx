'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Upload, X } from 'lucide-react'
import { slugify } from '@/lib/utils'
import GooglePlacesAutocomplete from './google-places-autocomplete'

const BRAND_COLORS = [
  '#000000', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
  '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
]

const PERSONALITY_OPTIONS = [
  { value: 'friendly', label: 'Samimi', description: 'Dostane ve sıcak' },
  { value: 'professional', label: 'Profesyonel', description: 'Resmi ve bilgili' },
  { value: 'fun', label: 'Eğlenceli', description: 'Neşeli ve şakacı' },
  { value: 'formal', label: 'Resmi', description: 'Ciddi ve otoriter' },
  { value: 'casual', label: 'Rahat', description: 'Gevşek ve arkadaşça' },
]

export default function NewOrganizationForm() {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    address: '',
    brand_color: '#3B82F6',
    working_hours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false },
    },
    ai_personality: 'professional',
    openai_api_key: '',
    categories: ['Yemek', 'İçecek', 'Tatlı'],
  })

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: slugify(name),
    })
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadLogo = async (organizationId: string): Promise<string | null> => {
    if (!logoFile) return null

    const fileExt = logoFile.name.split('.').pop()
    const fileName = `${organizationId}-${Date.now()}.${fileExt}`
    const filePath = `logos/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('organizations')
      .upload(filePath, logoFile)

    if (uploadError) {
      console.error('Logo upload error:', uploadError)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('organizations')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Check if slug is available
      const { data: existing } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', formData.slug)
        .single()

      if (existing) {
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: 'Bu slug zaten kullanılıyor. Lütfen farklı bir isim deneyin.',
        })
        setIsLoading(false)
        return
      }

      // Create organization
      const { data: organization, error: orgError } = await (supabase
        .from('organizations')
        .insert({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          address: formData.address,
          brand_color: formData.brand_color,
          working_hours: formData.working_hours,
          status: 'active',
        } as any)
        .select()
        .single() as any)

      if (orgError) throw orgError

      // Upload logo if provided
      if (logoFile && organization) {
        const logoUrl = await uploadLogo((organization as any).id)
        if (logoUrl) {
          await (supabase
            .from('organizations') as any)
            .update({ logo_url: logoUrl })
            .eq('id', (organization as any).id)
        }
      }

      // Create organization settings
      await (supabase.from('organization_settings') as any).insert({
        organization_id: (organization as any).id,
        ai_personality: formData.ai_personality,
        openai_api_key: formData.openai_api_key || null,
        ai_auto_translate: true,
        enable_table_call: true,
        enable_reviews: true,
      })

      // Create default categories
      const categoryPromises = formData.categories.map((categoryName, index) =>
        (supabase.from('menu_categories') as any).insert({
          organization_id: (organization as any).id,
          name: categoryName,
          display_order: index,
        })
      )
      await Promise.all(categoryPromises)

      toast({
        title: 'Başarılı!',
        description: `${formData.name} başarıyla oluşturuldu.`,
      })

      router.push('/admin/organizations')
      router.refresh()
    } catch (error: any) {
      console.error('Error creating organization:', error)
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: error.message || 'İşletme oluşturulurken bir hata oluştu.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Temel Bilgiler</CardTitle>
          <CardDescription>
            İşletmenin temel bilgilerini girin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">İşletme Adı *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Örn: Bella Italia Restaurant"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">veraqr.com/</span>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                placeholder="bella-italia"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Kısa Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Örn: 3. Dalga Kahve ve Tatlı Evi"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adres</Label>
            <GooglePlacesAutocomplete
              value={formData.address}
              onChange={(address) => setFormData({ ...formData, address })}
              placeholder="Adres ara veya manuel girin..."
            />
            <p className="text-xs text-muted-foreground">
              Google Maps ile ara veya manuel olarak girin
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Marka & Görsel</CardTitle>
          <CardDescription>
            Logo ve marka rengini ayarlayın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative w-24 h-24 rounded-lg border-2 border-slate-200 overflow-hidden">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null)
                      setLogoPreview(null)
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-slate-400 transition-colors">
                  <Upload className="h-8 w-8 text-slate-400" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              )}
              <div className="text-sm text-slate-500">
                <p>PNG, JPG veya SVG (maks. 2MB)</p>
                <p>Önerilen: 512x512px</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Marka Rengi</Label>
            <div className="flex items-center gap-2">
              {BRAND_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, brand_color: color })}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    formData.brand_color === color
                      ? 'ring-2 ring-offset-2 ring-blue-600 scale-110'
                      : ''
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={isLoading}
                />
              ))}
              <Input
                type="color"
                value={formData.brand_color}
                onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                className="w-20 h-10"
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <CardTitle>AI Asistan Ayarları</CardTitle>
          <CardDescription>
            Müşterilerle konuşacak AI asistanın kişiliğini seçin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PERSONALITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, ai_personality: option.value })}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  formData.ai_personality === option.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                disabled={isLoading}
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-sm text-slate-600 mt-1">{option.description}</div>
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="openai_api_key">
              OpenAI API Key (Opsiyonel)
              <span className="text-xs text-muted-foreground ml-2">
                Boş bırakırsanız platform varsayılanı kullanılır
              </span>
            </Label>
            <Input
              id="openai_api_key"
              type="password"
              value={formData.openai_api_key || ''}
              onChange={(e) => setFormData({ ...formData, openai_api_key: e.target.value })}
              placeholder="sk-..."
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Her restoran kendi OpenAI API key&apos;ini kullanabilir. 
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                API key almak için tıklayın
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          İptal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Oluşturuluyor...
            </>
          ) : (
            'İşletme Oluştur'
          )}
        </Button>
      </div>
    </form>
  )
}
