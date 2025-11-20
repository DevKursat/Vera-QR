import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function EditRestaurantPage({ params }: { params: { id: string } }) {
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
            ID: {params.id}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Düzenleme Formu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Düzenleme formu burada olacak.</p>
        </CardContent>
      </Card>
    </div>
  )
}
