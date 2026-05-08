'use client'

import { useEffect, useRef, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { UIMessage } from 'ai'
import { ArrowUp, Brain } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import ModelSwitcher from '@/components/chat/ModelSwitcher'
import SaveToMemoryButton from '@/components/chat/SaveToMemoryButton'
import type { Message as DBMessage, Model } from '@/lib/types'
import { cn } from '@/lib/utils'

function getMessageText(m: UIMessage): string {
  return m.parts
    .filter((p) => p.type === 'text')
    .map((p) => (p as { type: 'text'; text: string }).text)
    .join('')
}

export default function ConversationPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const conversationId = params.conversationId as string
  const { selectedModel, setSelectedModel } = useAppStore()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [initialized, setInitialized] = useState(false)
  const modelRef = useRef(selectedModel)

  useEffect(() => {
    modelRef.current = selectedModel
  }, [selectedModel])

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: () => ({ model: modelRef.current, conversationId }),
      }),
    [conversationId]
  )

  const { messages, sendMessage, status, setMessages } = useChat({ transport })

  // Load existing messages from DB
  useEffect(() => {
    async function loadMessages() {
      const res = await fetch(`/api/conversations/${conversationId}/messages`)
      if (res.ok) {
        const dbMessages: DBMessage[] = await res.json()
        if (dbMessages.length > 0) {
          setMessages(
            dbMessages
              .filter((m) => m.role !== 'system')
              .map((m) => ({
                id: m.id,
                role: m.role as 'user' | 'assistant',
                parts: [{ type: 'text' as const, text: m.content }],
                metadata: undefined,
              }))
          )
        }
      }
      setInitialized(true)
    }
    loadMessages()
  }, [conversationId])

  // Auto-send if query param exists (from new chat page)
  useEffect(() => {
    if (!initialized) return
    const q = searchParams.get('q')
    if (q && messages.length === 0) {
      sendMessage({ text: q })
    }
  }, [initialized])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isLoading = status === 'submitted' || status === 'streaming'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
        <ModelSwitcher value={selectedModel} onChange={(m: Model) => setSelectedModel(m)} />
        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
          <Brain className="w-3 h-3" />
          <span>Memory active</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
            Send a message to start
          </div>
        )}
        {messages.map((m) => {
          const text = getMessageText(m)
          if (!text && m.role !== 'user') return null
          return (
            <div
              key={m.id}
              className={cn('flex gap-3', m.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                </div>
              )}
              <div
                className={cn(
                  'group relative max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'bg-indigo-600/20 border border-indigo-500/20 text-zinc-100 rounded-br-sm'
                    : 'bg-white/[0.04] border border-white/[0.06] text-zinc-200 rounded-bl-sm'
                )}
              >
                <p className="whitespace-pre-wrap">{text}</p>
                {m.role === 'assistant' && text && (
                  <div className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <SaveToMemoryButton content={text} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            </div>
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-4 border-t border-white/[0.06]">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as unknown as React.FormEvent)
              }
            }}
            placeholder="Reply…"
            rows={1}
            className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 pr-12 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all min-h-[48px] max-h-[200px]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-indigo-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-500 transition-all"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
