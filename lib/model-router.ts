import { anthropic } from '@ai-sdk/anthropic'
import { openai, createOpenAI } from '@ai-sdk/openai'
import { xai } from '@ai-sdk/xai'
import type { Model } from '@/lib/types'

const deepseek = createOpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY,
})

export function getModelProvider(model: Model) {
  switch (model) {
    case 'gpt-4o':
      return openai('gpt-4o')
    case 'deepseek':
      return deepseek('deepseek-chat')
    case 'grok':
      return xai('grok-3')
    case 'claude':
    default:
      return anthropic('claude-sonnet-4-6')
  }
}
