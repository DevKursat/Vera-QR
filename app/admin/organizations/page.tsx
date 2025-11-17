import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import OrganizationsList from '@/components/admin/organizations-list'

export default async function OrganizationsPage() {
  const supabase = createClient()
  const { data: organizations, error } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">İşletmeler</h1>
          <p className="text-slate-600 mt-1">
            Platformdaki tüm restoranları ve işletmeleri yönetin
          </p>
        </div>
        <Link href="/admin/organizations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni İşletme Ekle
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm İşletmeler ({organizations?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <OrganizationsList organizations={organizations || []} />
        </CardContent>
      </Card>
    </div>
  )
}
