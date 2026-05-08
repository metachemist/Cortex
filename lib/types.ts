export type MemoryType = 'prompt' | 'skill' | 'preference' | 'workflow'

export interface MemoryItem {
  id: string
  user_id: string
  type: MemoryType
  title: string
  content: string
  tags: string[] | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user_id: string
  model: string
  title: string | null
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export interface UserSettings {
  user_id: string
  default_model: string
  memory_injection_mode: 'auto' | 'manual' | 'off'
  api_keys: Record<string, string> | null
}

export type Model = 'claude' | 'gpt-4o' | 'deepseek' | 'grok'

export const MODEL_LABELS: Record<Model, string> = {
  claude: 'Claude',
  'gpt-4o': 'GPT-4o',
  deepseek: 'DeepSeek',
  grok: 'Grok',
}
