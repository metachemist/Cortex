import { createClient } from '@/lib/supabase/server'
import type { MemoryItem } from '@/lib/types'

const MAX_CONTEXT_CHARS = 4000

export async function compileUserContext(userId: string): Promise<string> {
  const supabase = await createClient()

  const { data: memoryItems } = await supabase
    .from('memory_items')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('type')

  if (!memoryItems || memoryItems.length === 0) return ''

  const grouped = {
    prompt: memoryItems.filter((m: MemoryItem) => m.type === 'prompt'),
    skill: memoryItems.filter((m: MemoryItem) => m.type === 'skill'),
    preference: memoryItems.filter((m: MemoryItem) => m.type === 'preference'),
    workflow: memoryItems.filter((m: MemoryItem) => m.type === 'workflow'),
  }

  let systemPrompt =
    'You are a helpful AI assistant. The user has provided personal context to personalize your responses. Always use this context.\n\n'

  if (grouped.prompt.length > 0) {
    systemPrompt += '## Custom Instructions\n'
    grouped.prompt.forEach((p: MemoryItem) => (systemPrompt += `- ${p.content}\n`))
    systemPrompt += '\n'
  }

  if (grouped.skill.length > 0) {
    systemPrompt += "## User's Skills\n"
    grouped.skill.forEach((s: MemoryItem) => (systemPrompt += `- ${s.title}: ${s.content}\n`))
    systemPrompt += '\n'
  }

  if (grouped.preference.length > 0) {
    systemPrompt += "## User's Preferences\n"
    grouped.preference.forEach(
      (p: MemoryItem) => (systemPrompt += `- ${p.title}: ${p.content}\n`)
    )
    systemPrompt += '\n'
  }

  if (grouped.workflow.length > 0) {
    systemPrompt += "## User's Workflow Habits\n"
    grouped.workflow.forEach((w: MemoryItem) => (systemPrompt += `- ${w.title}: ${w.content}\n`))
    systemPrompt += '\n'
  }

  if (systemPrompt.length > MAX_CONTEXT_CHARS) {
    systemPrompt = systemPrompt.slice(0, MAX_CONTEXT_CHARS) + '\n[Memory truncated]'
  }

  return systemPrompt
}
