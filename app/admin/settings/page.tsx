import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ayarlar</h1>
        <p className="text-slate-600 mt-1">
          Platform genel ayarları.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Genel Ayarlar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Ayarlar paneli yakında burada olacak.</p>
        </CardContent>
      </Card>
    </div>
  )
}
