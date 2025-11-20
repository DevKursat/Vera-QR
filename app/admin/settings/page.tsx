import SettingsForm from '@/components/admin/settings-form'
import { createClient } from '@/lib/supabase/server'

export default async function AdminSettingsPage() {
  const supabase = createClient()

  const { data: settings } = await supabase
    .from('platform_settings')
    .select('*')
    .limit(1)
    .maybeSingle()

  // Default values if no settings found
  const initialData = settings || {
    site_name: 'Vera QR',
    support_email: 'support@veraqr.com',
    default_language: 'tr',
    maintenance_mode: false,
    security_2fa_required: false,
    session_timeout_minutes: 60,
    email_notifications_enabled: true,
    system_notifications_enabled: true
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ayarlar</h1>
        <p className="text-slate-600 mt-1">
          Platform genel yapılandırma ve yönetim ayarları.
        </p>
      </div>
      <SettingsForm initialData={initialData} />
    </div>
  )
}
