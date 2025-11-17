import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { triggerWebhooks } from '@/lib/webhook'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!status || !['pending', 'preparing', 'ready', 'served', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Update order status
    const { data: order, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error || !order) {
      return NextResponse.json(
        { error: error?.message || 'Order not found' },
        { status: error ? 500 : 404 }
      )
    }

    // If order is served or cancelled, update table status
    if ((status === 'served' || status === 'cancelled') && order.table_id) {
      await supabase
        .from('tables')
        .update({ status: 'available' })
        .eq('id', order.table_id)
    }

    // Track analytics
    await supabase
      .from('analytics_events')
      .insert({
        organization_id: order.organization_id,
        event_type: 'order_status_updated',
        event_data: {
          order_id: order.id,
          new_status: status,
        },
        session_id: order.session_id,
      })

    // Trigger webhooks for order status change
    const webhookEvent = status === 'served' ? 'order.completed' : 'order.updated'
    triggerWebhooks(
      supabase,
      order.organization_id,
      webhookEvent,
      order.id,
      order,
      {
        previous_status: order.status,
        new_status: status,
        table_number: order.table_id || undefined,
      }
    ).catch(err => {
      console.error('Webhook trigger error:', err)
      // Don't fail the request if webhook fails
    })

    return NextResponse.json({
      order,
      message: 'Order status updated successfully',
    })
  } catch (error: any) {
    console.error('Order Update Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const supabase = createClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, table:tables(table_number, location_description), organization:organizations(name, logo_url)')
      .eq('id', id)
      .maybeSingle()

    if (error || !order) {
      return NextResponse.json(
        { error: error?.message || 'Order not found' },
        { status: error ? 500 : 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error: any) {
    console.error('Order Fetch Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
