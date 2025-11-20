'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ShoppingCart, MessageCircle, MapPin, Clock, Phone, X, Plus, Minus, Bell, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency, generateSessionId, getStatusColor } from '@/lib/utils'
import type { Database } from '@/lib/supabase/types'
import AIAssistantChat from './ai-assistant-chat'

type Restaurant = Database['public']['Tables']['restaurants']['Row']
type Product = Database['public']['Tables']['products']['Row']
type Category = Database['public']['Tables']['categories']['Row']

// Define Campaign type if it's not in the database schema yet, or fetch it from DB if it exists.
// Based on provided schema, there is no 'campaigns' table. Assuming it might be passed as any or defined locally.
interface Campaign {
    id: string
    title: string
    description: string | null
    discount_percentage: number | null
}

interface CategoryWithItems extends Category {
  items: ProductWithDetails[]
  // Add these properties as they are used in the component but might be missing in strict DB type or added via join
  name: string
}

interface ProductWithDetails extends Product {
    name: string
    description: string | null
    allergens: string[]
}

interface Props {
  organization: Restaurant
  categories: CategoryWithItems[]
  campaigns: Campaign[]
  tableInfo: any
}

interface CartItem extends ProductWithDetails {
  quantity: number
  notes?: string
}

const LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
]

export default function RestaurantMenu({ organization, categories, campaigns, tableInfo }: Props) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ProductWithDetails | null>(null)
  const [sessionId] = useState(() => generateSessionId())
  const [customerName, setCustomerName] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('tr')
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [translatedCategories, setTranslatedCategories] = useState<CategoryWithItems[]>(categories)
  const [isTranslating, setIsTranslating] = useState(false)
  const { toast } = useToast()

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Translation function
  const translateMenu = async (targetLang: string) => {
    if (targetLang === 'tr') {
      setTranslatedCategories(categories)
      return
    }

    setIsTranslating(true)
    try {
      const translated = await Promise.all(
        categories.map(async (category) => {
          const translatedItems = await Promise.all(
            category.items.map(async (item) => {
              const nameResponse = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: item.name,
                  target_language: targetLang,
                  organization_id: organization.id,
                  context: 'menu',
                }),
              })
              const nameData = await nameResponse.json()

              const descResponse = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: item.description || '',
                  target_language: targetLang,
                  organization_id: organization.id,
                  context: 'menu',
                }),
              })
              const descData = await descResponse.json()

              return {
                ...item,
                name: nameData.translated || item.name,
                description: descData.translated || item.description,
              }
            })
          )

          const catResponse = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: category.name,
              target_language: targetLang,
              organization_id: organization.id,
              context: 'menu',
            }),
          })
          const catData = await catResponse.json()

          return {
            ...category,
            name: catData.translated || category.name,
            items: translatedItems,
          }
        })
      )

      setTranslatedCategories(translated)
      toast({
        title: 'Çeviri Tamamlandı',
        description: `Menü ${LANGUAGES.find(l => l.code === targetLang)?.name} diline çevrildi`,
      })
    } catch (error) {
      toast({
        title: 'Çeviri Hatası',
        description: 'Menü çevrilemedi. Lütfen tekrar deneyin.',
        variant: 'destructive',
      })
    } finally {
      setIsTranslating(false)
    }
  }

  const addToCart = (item: ProductWithDetails, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      return [...prev, { ...item, quantity }]
    })
    toast({
      title: 'Sepete Eklendi',
      description: `${item.name} sepete eklendi`,
    })
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity + delta)
          return { ...item, quantity: newQuantity }
        }
        return item
      }).filter(item => item.quantity > 0)
      return updated
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId))
  }

  const submitOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Sepet Boş',
        description: 'Lütfen sipariş vermek için ürün ekleyin',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: organization.id,
          table_id: tableInfo?.id,
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            notes: item.notes,
          })),
          customer_name: customerName,
          customer_notes: customerNotes,
          session_id: sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Order submission failed')
      }

      const data = await response.json()

      toast({
        title: 'Sipariş Alındı!',
        description: `Sipariş numaranız: ${data.order.order_number}`,
      })

      setCart([])
      setShowCart(false)
      setCustomerName('')
      setCustomerNotes('')
    } catch (error) {
      console.error('Order error:', error)
      toast({
        title: 'Hata',
        description: 'Sipariş gönderilemedi. Lütfen tekrar deneyin.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background" style={{ '--brand-color': organization.primary_color } as any}>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            {organization.logo_url && (
              <Image
                src={organization.logo_url}
                alt={organization.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <h1 className="font-bold text-lg">{organization.name}</h1>
              {tableInfo && (
                <p className="text-xs text-muted-foreground">Masa: {tableInfo.table_number}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                disabled={isTranslating}
                className="relative"
              >
                <Languages className="h-5 w-5" />
              </Button>
              
              {showLanguageMenu && (
                <div className="absolute right-0 top-12 w-48 bg-background border rounded-lg shadow-lg p-2 z-50">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code)
                        translateMenu(lang.code)
                        setShowLanguageMenu(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-accent flex items-center gap-2 ${
                        selectedLanguage === lang.code ? 'bg-accent' : ''
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {tableInfo && (
              <Button
                variant="outline"
                size="icon"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/table-calls', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        organization_id: organization.id,
                        table_id: tableInfo.id,
                        call_type: 'service',
                      }),
                    })
                    if (response.ok) {
                      toast({
                        title: 'Garson Çağrıldı',
                        description: 'Garsonunuz en kısa sürede gelecektir.',
                      })
                    }
                  } catch (error) {
                    toast({
                      title: 'Hata',
                      description: 'Çağrı gönderilemedi',
                      variant: 'destructive',
                    })
                  }
                }}
                className="relative"
              >
                <Bell className="h-5 w-5" />
              </Button>
            )}
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowAI(true)}
              className="relative"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowCart(true)}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Info Section */}
        {organization.description && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{organization.description}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {organization.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{organization.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaigns */}
        {campaigns.length > 0 && (
          <div className="mb-6 space-y-2">
            {campaigns.map(campaign => (
              <Card key={campaign.id} className="bg-primary/5 border-primary/20">
                <CardContent className="py-4">
                  <h3 className="font-semibold">{campaign.title}</h3>
                  {campaign.description && (
                    <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
                  )}
                  {campaign.discount_percentage && (
                    <span className="inline-block mt-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded">
                      %{campaign.discount_percentage} İndirim
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Menu Categories */}
        <div className="space-y-8">
          {translatedCategories.map(category => (
            <section key={category.id}>
              <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.items.map(item => (
                  <Card key={item.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition">
                    <div onClick={() => setSelectedItem(item)}>
                      {item.image_url && (
                        <div className="relative h-48 w-full">
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        {item.description && (
                          <CardDescription className="line-clamp-2">
                            {item.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold">{formatCurrency(item.price)}</span>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              addToCart(item)
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Ekle
                          </Button>
                        </div>
                        {item.allergens.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Alerjen: {item.allergens.join(', ')}
                          </p>
                        )}
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sepetim</DialogTitle>
            <DialogDescription>
              {itemCount} ürün - Toplam: {formatCurrency(totalAmount)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Sepetiniz boş</p>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 pb-3 border-b">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="customer-name">İsim (Opsiyonel)</Label>
                    <Input
                      id="customer-name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Adınız"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-notes">Not (Opsiyonel)</Label>
                    <Textarea
                      id="customer-notes"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="Sipariş notunuz..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="font-bold">Toplam:</span>
                  <span className="text-2xl font-bold">{formatCurrency(totalAmount)}</span>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={submitOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Siparişi Gönder'}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Assistant */}
      {showAI && (
        <AIAssistantChat
          organization={organization}
          sessionId={sessionId}
          onClose={() => setShowAI(false)}
          onAddToCart={addToCart}
        />
      )}

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          {selectedItem && (
            <>
              {selectedItem.image_url && (
                <div className="relative h-64 w-full -mx-6 -mt-6 mb-4">
                  <Image
                    src={selectedItem.image_url}
                    alt={selectedItem.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <DialogHeader>
                <DialogTitle>{selectedItem.name}</DialogTitle>
                <DialogDescription>{selectedItem.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{formatCurrency(selectedItem.price)}</span>
                </div>
                {selectedItem.allergens.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Alerjenler:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.allergens.map(allergen => (
                        <span key={allergen} className="px-2 py-1 bg-secondary text-xs rounded">
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <Button
                  className="w-full"
                  onClick={() => {
                    addToCart(selectedItem)
                    setSelectedItem(null)
                  }}
                >
                  Sepete Ekle
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
