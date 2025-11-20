import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kullanıcılar</h1>
        <p className="text-slate-600 mt-1">
          Platform kullanıcılarını yönetin.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Kullanıcı yönetimi yakında burada olacak.</p>
        </CardContent>
      </Card>
    </div>
  )
}
