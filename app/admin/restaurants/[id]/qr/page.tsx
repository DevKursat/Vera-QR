import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function RestaurantQRPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Link href="/admin/restaurants">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">QR Kod Yönetimi</h1>
          <p className="text-slate-600 mt-1">
            ID: {params.id}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QR Kodlar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">QR kod listesi burada olacak.</p>
        </CardContent>
      </Card>
    </div>
  )
}
