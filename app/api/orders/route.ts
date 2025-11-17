import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateOrder } from '@/lib/validators'
import { generateOrderNumber } from '@/lib/utils'
import { triggerWebhooks } from '@/lib/webhook'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate order data
    const orderData = validateOrder(body)
    const { items, table_id, customer_name, customer_notes } = orderData

    const supabase = createClient()

    // Get table information
    let organizationId: string

    if (table_id) {
      const { data: table, error: tableError } = await supabase
        .from('tables')
        .select('organization_id')
        .eq('id', table_id)
        .single()

      if (tableError || !table) {
        return NextResponse.json(
          { error: 'Table not found' },
          { status: 404 }
        )
      }

      organizationId = table.organization_id
    } else {
      // If no table_id, get organization from request
      const orgId = body.organization_id
      if (!orgId) {
        return NextResponse.json(
          { error: 'Organization ID is required' },
          { status: 400 }
        )
      }
      organizationId = orgId
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Get session ID from request or generate new one
    const sessionId = body.session_id || `session_${Date.now()}`

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        organization_id: organizationId,
        table_id: table_id || null,
        order_number: orderNumber,
        items: items,
        total_amount: totalAmount,
        status: 'pending',
        customer_name: customer_name || null,
        customer_notes: customer_notes || null,
        session_id: sessionId,
      })
      .select()
      .single()

    if (orderError) {
      throw orderError
    }

    // Update table status if table exists
    if (table_id) {
      await supabase
        .from('tables')
        .update({ status: 'occupied' })
        .eq('id', table_id)
    }

    // Track analytics
    await supabase
      .from('analytics_events')
      .insert({
        organization_id: organizationId,
        event_type: 'order_created',
        event_data: {
          order_id: order.id,
          items_count: items.length,
          total_amount: totalAmount,
        },
        session_id: sessionId,
      })

    // Trigger webhooks for order.created event
    triggerWebhooks(
      supabase,
      organizationId,
      'order.created',
      order.id,
      order,
      {
        table_number: table_id ? order.table_id : undefined,
        customer_name: customer_name || undefined,
        items_count: items.length,
      }
    ).catch(err => {
      console.error('Webhook trigger error:', err)
      // Don't fail the request if webhook fails
    })

    return NextResponse.json({
      order,
      message: 'Order created successfully',
    }, { status: 201 })
  } catch (error: any) {
    console.error('Order Creation Error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')
    const organizationId = searchParams.get('organization_id')

    if (!sessionId && !organizationId) {
      return NextResponse.json(
        { error: 'session_id or organization_id is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    let query = supabase
      .from('orders')
      .select('*, table:tables(table_number, location_description)')
      .order('created_at', { ascending: false })

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data: orders, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ orders })
  } catch (error: any) {
    console.error('Orders Fetch Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
