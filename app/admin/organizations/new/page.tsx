import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import NewOrganizationForm from '@/components/admin/new-organization-form'

export default function NewOrganizationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/organizations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Yeni İşletme Ekle</h1>
          <p className="text-slate-600 mt-1">
            Platforma yeni bir restoran veya işletme ekleyin
          </p>
        </div>
      </div>

      <NewOrganizationForm />
    </div>
  )
}
