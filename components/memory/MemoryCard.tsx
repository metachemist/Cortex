'use client'

import { Trash2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import type { MemoryItem, MemoryType } from '@/lib/types'
import { cn } from '@/lib/utils'

const TYPE_COLORS: Record<MemoryType, string> = {
  prompt: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  skill: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  preference: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  workflow: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
}

interface MemoryCardProps {
  item: MemoryItem
  onToggle: (id: string, is_active: boolean) => void
  onDelete: (id: string) => void
}

export default function MemoryCard({ item, onToggle, onDelete }: MemoryCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-white/[0.02] p-4 space-y-3 transition-all',
        item.is_active
          ? 'border-white/[0.08] hover:border-white/[0.12]'
          : 'border-white/[0.04] opacity-50'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Badge
            className={cn(
              'text-[10px] uppercase tracking-wider border shrink-0 rounded-md',
              TYPE_COLORS[item.type]
            )}
          >
            {item.type}
          </Badge>
          <h3 className="text-sm font-medium text-zinc-200 truncate">{item.title}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Switch
            checked={item.is_active}
            onCheckedChange={(checked) => onToggle(item.id, checked)}
            className="data-[state=checked]:bg-indigo-600 scale-75"
          />
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content preview */}
      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{item.content}</p>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-zinc-600 bg-white/[0.04] border border-white/[0.06] rounded-full px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
