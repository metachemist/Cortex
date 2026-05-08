import { streamText, convertToModelMessages } from 'ai'
import type { UIMessage } from 'ai'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createClient } from '@/lib/supabase/server'
import { compileUserContext } from '@/lib/context-compiler'
import { getModelProvider } from '@/lib/model-router'
import { generateConversationTitle } from '@/lib/title-generator'
import type { Model } from '@/lib/types'

function getRatelimit() {
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: false,
  })
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return new Response('Unauthorized', { status: 401 })

    const { success } = await getRatelimit().limit(user.id)
    if (!success) return new Response('Too many requests', { status: 429 })

    const {
      messages,
      model,
      conversationId,
    }: { messages: UIMessage[]; model: string; conversationId: string } = await req.json()

    const systemPrompt = await compileUserContext(user.id)
    const modelProvider = getModelProvider(model as Model)

    // Extract text content from last user UIMessage for title/saving
    const lastUserMsg = messages.findLast((m) => m.role === 'user')
    const lastUserText = lastUserMsg?.parts
      .filter((p) => p.type === 'text')
      .map((p) => (p as { type: 'text'; text: string }).text)
      .join('') ?? ''

    // Auto-generate title after first user message
    if (messages.filter((m) => m.role === 'user').length === 1 && conversationId && lastUserText) {
      generateConversationTitle(supabase, conversationId, lastUserText).catch(() => {})
    }

    const result = streamText({
      model: modelProvider,
      system: systemPrompt || undefined,
      messages: await convertToModelMessages(messages),
      onFinish: async ({ text }) => {
        if (!conversationId || !lastUserText) return
        await supabase.from('messages').insert([
          { conversation_id: conversationId, role: 'user', content: lastUserText },
          { conversation_id: conversationId, role: 'assistant', content: text },
        ])
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (err) {
    console.error('[chat/route]', err)
    return new Response('LLM request failed', { status: 502 })
  }
}
