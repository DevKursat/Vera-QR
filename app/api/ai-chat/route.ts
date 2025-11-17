import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendChatMessage, generateSystemPrompt, type ChatMessage, type MenuContext } from '@/lib/openai'
import { validateAIChatMessage } from '@/lib/validators'

// Use Node.js runtime for OpenAI SDK
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request
    const { message, session_id, organization_id } = validateAIChatMessage(body)

    // Get Supabase client
    const supabase = createClient()

    // Fetch organization with settings
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organization_id)
      .eq('status', 'active')
      .single()

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Fetch organization settings for AI personality and OpenAI API key
    const { data: settings } = await supabase
      .from('organization_settings')
      .select('ai_personality, openai_api_key')
      .eq('organization_id', organization_id)
      .single()

    const aiPersonality = settings?.ai_personality || 'friendly'
    const customApiKey = settings?.openai_api_key || undefined

    // Fetch menu items
    const { data: menuItems, error: itemsError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('organization_id', organization_id)
      .eq('available', true)

    if (itemsError) {
      throw itemsError
    }

    // Fetch categories
    const { data: categories, error: categoriesError } = await supabase
      .from('menu_categories')
      .select('id, name')
      .eq('organization_id', organization_id)
      .eq('visible', true)

    if (categoriesError) {
      throw categoriesError
    }

    // Get conversation history
    const { data: conversation } = await supabase
      .from('ai_conversations')
      .select('messages')
      .eq('session_id', session_id)
      .eq('organization_id', organization_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const previousMessages: ChatMessage[] = conversation?.messages as ChatMessage[] || []

    // Add new user message
    const messages: ChatMessage[] = [
      ...previousMessages,
      { role: 'user', content: message },
    ]

    // Prepare context
    const context: MenuContext = {
      organization,
      menuItems: menuItems || [],
      categories: categories || [],
      aiPersonality,
    }

    // Get AI response (using organization's API key if available, otherwise platform default)
    const aiResponse = await sendChatMessage(messages, context, customApiKey)

    // Update messages with AI response
    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: 'assistant', content: aiResponse },
    ]

    // Save conversation to database
    await supabase
      .from('ai_conversations')
      .upsert({
        session_id,
        organization_id,
        messages: updatedMessages,
        updated_at: new Date().toISOString(),
      })

    // Track analytics
    await supabase
      .from('analytics_events')
      .insert({
        organization_id,
        event_type: 'ai_chat_message',
        event_data: { session_id, message_length: message.length },
        session_id,
      })

    return NextResponse.json({
      response: aiResponse,
      session_id,
    })
  } catch (error: any) {
    console.error('AI Chat Error:', error)
    
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
