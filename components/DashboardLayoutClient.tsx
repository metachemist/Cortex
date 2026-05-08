'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/lib/types'
import { Brain, MessageSquare, Settings, Plus, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserEmail(user?.email ?? null))
    fetchConversations()
  }, [])

  async function fetchConversations() {
    const res = await fetch('/api/conversations')
    if (res.ok) setConversations(await res.json())
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleNewChat() {
    router.push('/chat')
  }

  return (
    <div className="flex h-screen bg-[#09090b] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] shrink-0 flex flex-col border-r border-white/[0.06] bg-[#0d0d10]">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2" style={{ fontFamily: 'var(--font-syne)' }}>
            <div className="w-7 h-7 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-zinc-100">Cortex</span>
          </div>
        </div>

        {/* New Chat */}
        <div className="px-3 py-3">
          <Button
            onClick={handleNewChat}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-300 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New chat
          </Button>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1 px-2">
          <div className="pb-2 space-y-0.5">
            {conversations.length === 0 ? (
              <p className="text-xs text-zinc-600 px-2 py-2">No conversations yet</p>
            ) : (
              conversations.map((c) => (
                <Link
                  key={c.id}
                  href={`/chat/${c.id}`}
                  className={cn(
                    'flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] transition-all truncate',
                    pathname === `/chat/${c.id}` &&
                      'bg-white/[0.06] text-zinc-200 border border-white/[0.06]'
                  )}
                >
                  <MessageSquare className="w-3 h-3 shrink-0 text-zinc-600" />
                  <span className="truncate">{c.title ?? 'New conversation'}</span>
                </Link>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Bottom nav */}
        <div className="border-t border-white/[0.06] p-2 space-y-0.5">
          <Link
            href="/memory"
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] transition-all',
              pathname.startsWith('/memory') && 'bg-white/[0.06] text-zinc-200'
            )}
          >
            <Brain className="w-3.5 h-3.5" />
            Memory
          </Link>
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] transition-all',
              pathname.startsWith('/settings') && 'bg-white/[0.06] text-zinc-200'
            )}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </Link>

          <div className="pt-1 mt-1 border-t border-white/[0.04] flex items-center justify-between px-2">
            <span className="text-[10px] text-zinc-600 truncate max-w-[140px]">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06] transition-all"
              title="Sign out"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
