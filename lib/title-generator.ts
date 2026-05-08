import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function generateConversationTitle(
  supabase: SupabaseClient,
  conversationId: string,
  firstMessage: string
): Promise<void> {
  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5-20251001'),
    prompt: `Summarize this message in 5 words or less as a conversation title. Only output the title, nothing else.\n\nMessage: ${firstMessage.slice(0, 500)}`,
  })

  await supabase
    .from('conversations')
    .update({ title: text.trim() })
    .eq('id', conversationId)
}
