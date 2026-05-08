'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUp } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import ModelSwitcher from '@/components/chat/ModelSwitcher'
import type { Model } from '@/lib/types'

const SUGGESTIONS = [
  'Explain a concept I should know about',
  'Help me debug a problem',
  'Write a first draft of something',
  'Give me honest feedback on an idea',
]

export default function ChatPage() {
  const router = useRouter()
  const { selectedModel, setSelectedModel } = useAppStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return
    setLoading(true)
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: selectedModel }),
    })
    if (res.ok) {
      const conv = await res.json()
      // Pass initial message via query so the chat page can auto-send it
      router.push(`/chat/${conv.id}?q=${encodeURIComponent(input.trim())}`)
    } else {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <ModelSwitcher value={selectedModel} onChange={(m: Model) => setSelectedModel(m)} />
      </div>

      {/* Centered empty state */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-xl space-y-6">
          <div className="text-center space-y-1">
            <h1
              className="text-2xl font-bold text-zinc-100"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              What&apos;s on your mind?
            </h1>
            <p className="text-sm text-zinc-500">
              Your memory is loaded. Every model already knows you.
            </p>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Message…"
              rows={3}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 pr-12 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-indigo-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-500 transition-all"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </form>

          {/* Suggestion chips */}
          <div className="flex flex-wrap gap-2 justify-center">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="text-xs text-zinc-500 border border-white/[0.06] rounded-full px-3 py-1.5 hover:border-indigo-500/30 hover:text-indigo-300 hover:bg-indigo-500/5 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
