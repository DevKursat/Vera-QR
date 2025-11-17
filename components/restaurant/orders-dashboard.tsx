'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Clock, CheckCircle, XCircle, ChefHat } from 'lucide-react'

interface Order {
  id: string
  order_number: string
  items: any[]
  total_amount: number
  status: string
  customer_name: string | null
  customer_notes: string | null
  table: { table_number: string; location_description: string } | null
  created_at: string
}

interface Props {
  initialOrders: Order[]
  organizationId: string
}

const STATUS_CONFIG = {
  pending: { label: 'Bekliyor', color: 'bg-yellow-500', icon: Clock },
  preparing: { label: 'Hazırlanıyor', color: 'bg-blue-500', icon: ChefHat },
  ready: { label: 'Hazır', color: 'bg-green-500', icon: CheckCircle },
  served: { label: 'Teslim Edildi', color: 'bg-slate-500', icon: CheckCircle },
  cancelled: { label: 'İptal', color: 'bg-red-500', icon: XCircle },
}

export default function OrdersDashboard({ initialOrders, organizationId }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [activeTab, setActiveTab] = useState('all')
  const supabase = createClient()

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `organization_id=eq.${organizationId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch full order with table info
            const { data } = await supabase
              .from('orders')
              .select('*, table:tables(table_number, location_description)')
              .eq('id', payload.new.id)
              .single()

            if (data) {
              setOrders((prev) => [data, ...prev])
              // Play notification sound
              new Audio('/notification.mp3').play().catch(() => {})
            }
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id
                  ? { ...order, ...payload.new }
                  : order
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [organizationId])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      console.error('Error updating order:', error)
      alert('Sipariş güncellenirken hata oluştu')
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return ['pending', 'preparing', 'ready'].includes(order.status)
    return order.status === activeTab
  })

  const activeOrdersCount = orders.filter((o) =>
    ['pending', 'preparing', 'ready'].includes(o.status)
  ).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Badge className="text-lg px-4 py-2">
          {activeOrdersCount} Aktif Sipariş
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tümü ({orders.length})</TabsTrigger>
          <TabsTrigger value="active">Aktif ({activeOrdersCount})</TabsTrigger>
          <TabsTrigger value="pending">Bekliyor</TabsTrigger>
          <TabsTrigger value="preparing">Hazırlanıyor</TabsTrigger>
          <TabsTrigger value="ready">Hazır</TabsTrigger>
          <TabsTrigger value="served">Teslim</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-500">Bu kategoride sipariş yok.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOrders.map((order) => {
                const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]
                const StatusIcon = statusConfig.icon

                return (
                  <Card key={order.id} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {order.order_number}
                          </CardTitle>
                          {order.table && (
                            <p className="text-sm text-slate-600 mt-1">
                              Masa {order.table.table_number}
                            </p>
                          )}
                        </div>
                        <Badge
                          className={`${statusConfig.color} text-white flex items-center gap-1`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {formatDistanceToNow(new Date(order.created_at), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Order Items */}
                      <div className="space-y-2">
                        {order.items.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm"
                          >
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-semibold">
                              ₺{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.customer_notes && (
                        <div className="p-2 bg-slate-50 rounded text-sm">
                          <strong>Not:</strong> {order.customer_notes}
                        </div>
                      )}

                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between font-bold">
                          <span>TOPLAM</span>
                          <span className="text-lg text-green-600">
                            ₺{order.total_amount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Status Actions */}
                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                              className="flex-1"
                            >
                              Hazırlanıyor
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            >
                              İptal
                            </Button>
                          </>
                        )}
                        {order.status === 'preparing' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="w-full"
                          >
                            Hazır
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'served')}
                            className="w-full"
                          >
                            Teslim Et
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
