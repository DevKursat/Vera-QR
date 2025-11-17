import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Giriş Yap - VERA QR',
  description: 'VERA QR admin paneline giriş yapın',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md p-8">
        {children}
      </div>
    </div>
  )
}
