'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import MemoryCard from '@/components/memory/MemoryCard'
import MemoryForm from '@/components/memory/MemoryForm'
import type { MemoryItem, MemoryType } from '@/lib/types'

type Filter = 'all' | MemoryType

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Prompts', value: 'prompt' },
  { label: 'Skills', value: 'skill' },
  { label: 'Preferences', value: 'preference' },
  { label: 'Workflows', value: 'workflow' },
]

export default function MemoryPage() {
  const [items, setItems] = useState<MemoryItem[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/memory')
      .then((r) => r.json())
      .then(setItems)
  }, [])

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter)

  async function handleSave(data: {
    title: string
    type: MemoryType
    content: string
    tags: string[]
  }) {
    setSaving(true)
    const res = await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const newItem = await res.json()
      setItems((prev) => [newItem, ...prev])
      setOpen(false)
    }
    setSaving(false)
  }

  async function handleToggle(id: string, is_active: boolean) {
    const res = await fetch('/api/memory', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active }),
    })
    if (res.ok) {
      const updated = await res.json()
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)))
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch('/api/memory', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok || res.status === 204) {
      setItems((prev) => prev.filter((i) => i.id !== id))
    }
  }

  return (
    <div className="h-full bg-[#09090b] overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-xl font-bold text-zinc-100"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Memory
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {items.filter((i) => i.is_active).length} active ·{' '}
              {items.filter((i) => !i.is_active).length} inactive
            </p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            size="sm"
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white border-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add memory
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06] w-fit">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                filter === f.value
                  ? 'bg-white/[0.08] text-zinc-100 font-medium'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
              <Plus className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-500">No memories yet.</p>
            <p className="text-xs text-zinc-600 mt-1">
              Add memories to personalize your AI conversations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((item) => (
              <MemoryCard
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add memory dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#131316] border-white/[0.08] text-zinc-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 text-sm font-semibold">
              New memory
            </DialogTitle>
          </DialogHeader>
          <MemoryForm onSave={handleSave} onCancel={() => setOpen(false)} loading={saving} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
