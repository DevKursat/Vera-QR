import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AppProvider } from '@/lib/app-context'

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
    <html lang="tr" suppressHydrationWarning>
      <body className="font-sans antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <AppProvider>
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  )
}
