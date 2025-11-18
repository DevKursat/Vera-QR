'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, QrCode } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate inputs
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Eksik Bilgi',
        description: 'Lütfen e-posta ve şifre alanlarını doldurun.',
      })
      return
    }

    setIsLoading(true)

    try {
      console.log('🔐 Login başlatılıyor...', { email })
      console.log('📧 Email:', email)
      console.log('🔑 Password length:', password.length)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('🔐 Auth yanıtı:', { data, error })

      if (error) {
        console.error('❌ Auth hatası:', error)
        console.error('❌ Error code:', error.status)
        console.error('❌ Error message:', error.message)
        
        let errorMessage = error.message
        
        // Türkçe hata mesajları
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'E-posta adresiniz doğrulanmamış. Lütfen e-postanızı kontrol edin.'
        } else if (error.message.includes('User not found')) {
          errorMessage = 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.'
        }
        
        toast({
          variant: 'destructive',
          title: 'Giriş Başarısız',
          description: errorMessage,
        })
        setIsLoading(false)
        return
      }

      if (!data.user) {
        console.error('❌ Kullanıcı bulunamadı')
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: 'Kullanıcı bilgileri alınamadı',
        })
        setIsLoading(false)
        return
      }

      console.log('✅ Kullanıcı giriş yaptı:', data.user.id, data.user.email)

      // Check platform admin
      console.log('🔍 Platform admin kontrol ediliyor...')
      const { data: platformAdmin, error: platformError } = await supabase
        .from('platform_admins')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle()

      console.log('🔍 Platform admin sonucu:', { platformAdmin, platformError })

      if (platformError) {
        console.error('❌ Platform admin sorgu hatası:', platformError)
      }

    if (platformAdmin) {
      console.log('✅ Platform admin bulundu! Dashboard\'a yönlendiriliyor...')
      console.log('📍 Redirect URL:', window.location.origin + '/admin/dashboard')
      toast({
        title: 'Giriş Başarılı',
        description: 'Platform admin paneline yönlendiriliyorsunuz...',
      })
      // Keep loading state true during redirect
      // Direct navigation - middleware will handle the redirect
      console.log('🚀 window.location.href çağrılıyor...')
      window.location.href = '/admin/dashboard'
      console.log('✅ Redirect komutu verildi')
      return
    }
    
    // Check restaurant admin
      console.log('🔍 Restaurant admin kontrol ediliyor...')
      const { data: restaurantAdmin, error: restaurantError } = await supabase
        .from('admin_users')
        .select('id, organization_id')
        .eq('user_id', data.user.id)
        .maybeSingle()

      console.log('🔍 Restaurant admin sonucu:', { restaurantAdmin, restaurantError })

      if (restaurantError) {
        console.error('❌ Restaurant admin sorgu hatası:', restaurantError)
      }

      if (restaurantAdmin) {
        console.log('✅ Restaurant admin bulundu! Dashboard\'a yönlendiriliyor...')
        toast({
          title: 'Giriş Başarılı',
          description: 'Restoran admin paneline yönlendiriliyorsunuz...',
        })
        // Direct navigation for restaurant admin
        window.location.href = '/dashboard'
        return
      }

      // No admin role found
      console.error('❌ Hiçbir admin rolü bulunamadı!')
      toast({
        variant: 'destructive',
        title: 'Yetkisiz Erişim',
        description: 'Bu hesapla giriş yapamazsınız. Lütfen admin hesabınızla giriş yapın.',
      })
      await supabase.auth.signOut()
      setIsLoading(false)
    } catch (error: any) {
      console.error('❌ Beklenmeyen hata:', error)
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: error.message || 'Bir hata oluştu',
      })
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <QrCode className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">VERA QR</CardTitle>
        <CardDescription className="text-center">
          Admin paneline giriş yapın
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Giriş yapılıyor...
              </>
            ) : (
              'Giriş Yap'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
