import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// POST /api/table-calls - Create a new table call request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organization_id, table_id, call_type = 'service', customer_note } = body

    if (!organization_id || !table_id) {
      return NextResponse.json(
        { error: 'organization_id and table_id are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Create table call
    const { data: call, error } = await supabase
      .from('table_calls')
      .insert({
        organization_id,
        table_id,
        call_type,
        customer_note,
        status: 'pending',
      })
      .select('*, table:tables(table_number, location_description)')
      .maybeSingle()

    if (error || !call) {
      return NextResponse.json(
        { error: error?.message || 'Failed to create table call' },
        { status: error ? 500 : 400 }
      )
    }

    // Track analytics
    await supabase.from('analytics_events').insert({
      organization_id,
      event_type: 'table_call_requested',
      event_data: {
        table_id,
        call_type,
      },
    })

    return NextResponse.json(
      {
        call,
        message: 'Table call request created successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Table Call Creation Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

// GET /api/table-calls - Get table calls for organization
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organization_id')
    const status = searchParams.get('status')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    let query = supabase
      .from('table_calls')
      .select('*, table:tables(table_number, location_description)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: calls, error } = await query

    if (error) throw error

    return NextResponse.json({ calls })
  } catch (error: any) {
    console.error('Table Calls Fetch Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
