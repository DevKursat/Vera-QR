import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'VERAQR | AI-Powered QR Menu System',
  description: 'White-label SaaS platform for restaurants with AI menu assistant',
  keywords: ['QR menu', 'restaurant', 'AI assistant', 'digital menu', 'SaaS'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
