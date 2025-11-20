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
import { ThemeToggle, LanguageToggle } from '@/components/shared/theme-language-toggle'
import { useApp } from '@/lib/app-context'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useApp()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate inputs
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: 'Please fill in email and password fields.',
      })
      return
    }

    setIsLoading(true)

    try {
      console.log('🔐 Login başlatılıyor...', { email })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('🔐 Auth yanıtı:', { data, error })

      if (error) {
        console.error('❌ Auth hatası:', error)
        
        toast({
          variant: 'destructive',
          title: t.auth.loginError,
          description: t.auth.invalidCredentials,
        })
        setIsLoading(false)
        return
      }

      if (!data.user) {
        console.error('❌ Kullanıcı bulunamadı')
        toast({
          variant: 'destructive',
          title: t.common.error,
          description: 'User information could not be retrieved',
        })
        setIsLoading(false)
        return
      }

      console.log('✅ Kullanıcı giriş yaptı:', data.user.id, data.user.email)

      // Check user profile and role
      console.log('🔍 Kullanıcı profili kontrol ediliyor...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle()

      console.log('🔍 Profil sonucu:', { profile, profileError })

      if (profileError) {
        console.error('❌ Profil sorgu hatası:', profileError)
      }

      if (!profile) {
        console.error('❌ Profil bulunamadı!')
        toast({
          variant: 'destructive',
          title: 'Yetkisiz Erişim',
          description: 'Bu hesapla giriş yapamazsınız. Lütfen admin hesabınızla giriş yapın.',
        })
        await supabase.auth.signOut()
        setIsLoading(false)
        return
      }

      // Check if platform admin
      if ((profile as any).role === 'platform_admin') {
        console.log('✅ Platform admin! Redirecting to /admin...')
        toast({
          title: t.auth.loginSuccess,
          description: 'Redirecting to platform admin panel...',
        })
        window.location.href = '/admin'
        return
      }

      // Check if restaurant admin
      const { data: restaurantAdmin, error: restaurantError } = await supabase
        .from('restaurant_admins')
        .select('id, restaurant_id')
        .eq('profile_id', data.user.id)
        .maybeSingle()

      console.log('🔍 Restaurant admin sonucu:', { restaurantAdmin, restaurantError })

      if (restaurantError) {
        console.error('❌ Restaurant admin sorgu hatası:', restaurantError)
      }

      if (restaurantAdmin) {
        console.log('✅ Restaurant admin! Redirecting to /restaurant/dashboard...')
        toast({
          title: t.auth.loginSuccess,
          description: 'Redirecting to restaurant admin panel...',
        })
        window.location.href = '/restaurant/dashboard'
        return
      }

      // No admin role found
      console.error('❌ Hiçbir admin rolü bulunamadı!')
      toast({
        variant: 'destructive',
        title: t.auth.unauthorized,
        description: t.auth.unauthorizedMessage,
      })
      await supabase.auth.signOut()
      setIsLoading(false)
    } catch (error: any) {
      console.error('❌ Beklenmeyen hata:', error)
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: error.message || 'An error occurred',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="absolute top-4 right-4 flex gap-2">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <QrCode className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center dark:text-white">VERA QR</CardTitle>
          <CardDescription className="text-center dark:text-gray-300">
            {t.auth.loginTitle}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-200">{t.auth.email}</Label>
              <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="dark:text-gray-200">{t.auth.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                {t.auth.loggingIn}
              </>
            ) : (
              t.common.login
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
    </div>
  )
}
