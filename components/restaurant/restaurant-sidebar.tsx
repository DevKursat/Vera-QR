'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  QrCode,
  Users,
  Settings,
  Bell,
  BarChart3,
  Menu,
  X,
  Gift,
  Ticket,
  Star,
} from 'lucide-react'
import { useApp } from '@/lib/app-context'

interface Props {
  organization: any // Actually restaurant object now
}

export default function RestaurantSidebar({ organization }: Props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useApp()

  const navigation = [
    { name: t.sidebar.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { name: t.sidebar.menu, href: '/dashboard/menu', icon: UtensilsCrossed },
    { name: t.sidebar.orders, href: '/dashboard/orders', icon: ShoppingCart },
    { name: t.sidebar.tables, href: '/dashboard/tables', icon: QrCode },
    { name: t.sidebar.calls, href: '/dashboard/calls', icon: Bell },
    { name: t.sidebar.reviews, href: '/dashboard/reviews', icon: Star },
    { name: t.sidebar.loyalty, href: '/dashboard/loyalty', icon: Gift },
    { name: t.sidebar.coupons, href: '/dashboard/coupons', icon: Ticket },
    { name: t.sidebar.customers, href: '/dashboard/customers', icon: Users },
    { name: t.sidebar.analytics, href: '/dashboard/analytics', icon: BarChart3 },
    { name: t.sidebar.settings, href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white dark:bg-background shadow-md"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-background border-r border-slate-200 dark:border-border transform transition-transform duration-200 ease-in-out',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-200 dark:border-border">
            {organization?.logo_url ? (
              <img
                src={organization.logo_url}
                alt={organization.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: organization?.primary_color || '#3B82F6' }}
              >
                {organization?.name?.charAt(0) || 'R'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold truncate dark:text-white">{organization?.name}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Restoran Paneli</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-white'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                  style={
                    isActive
                      ? { backgroundColor: organization?.primary_color || '#3B82F6' }
                      : {}
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
