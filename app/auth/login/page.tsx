'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Giriş Başarısız',
          description: error.message,
        })
        return
      }

      if (data.user) {
        // Check user role and redirect accordingly
        const { data: platformAdmin, error: platformError } = await supabase
          .from('platform_admins')
          .select('id')
          .eq('auth_user_id', data.user.id)
          .maybeSingle()

        if (platformAdmin) {
          toast({
            title: 'Giriş Başarılı',
            description: 'Platform admin paneline yönlendiriliyorsunuz...',
          })
          router.push('/admin/dashboard')
          router.refresh()
          return
        }

        const { data: restaurantAdmin, error: restaurantError } = await supabase
          .from('admin_users')
          .select('id, organization_id')
          .eq('auth_user_id', data.user.id)
          .maybeSingle()

        if (restaurantAdmin) {
          toast({
            title: 'Giriş Başarılı',
            description: 'Restoran admin paneline yönlendiriliyorsunuz...',
          })
          router.push('/dashboard')
          router.refresh()
          return
        }

        // If no admin role found, sign out
        toast({
          variant: 'destructive',
          title: 'Yetkisiz Erişim',
          description: 'Bu hesapla giriş yapamazsınız. Lütfen admin hesabınızla giriş yapın.',
        })
        await supabase.auth.signOut()
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: error.message || 'Bir hata oluştu',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">VQ</span>
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
