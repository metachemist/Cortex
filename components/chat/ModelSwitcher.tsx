'use client'

import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { Model } from '@/lib/types'
import { MODEL_LABELS } from '@/lib/types'

interface ModelSwitcherProps {
  value: Model
  onChange: (model: Model) => void
}

const MODEL_ICONS: Record<Model, string> = {
  claude: '◆',
  'gpt-4o': '⬡',
  deepseek: '◉',
  grok: '⊕',
}

export default function ModelSwitcher({ value, onChange }: ModelSwitcherProps) {
  const models: Model[] = ['claude', 'gpt-4o', 'deepseek', 'grok']

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:text-zinc-100 text-xs h-8"
        >
          <span className="text-indigo-400">{MODEL_ICONS[value]}</span>
          {MODEL_LABELS[value]}
          <ChevronDown className="w-3 h-3 text-zinc-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="bg-[#131316] border-white/[0.08] text-zinc-300 min-w-[140px]"
      >
        {models.map((m) => (
          <DropdownMenuItem
            key={m}
            onClick={() => onChange(m)}
            className={`flex items-center gap-2 text-xs cursor-pointer hover:bg-white/[0.06] hover:text-zinc-100 ${
              m === value ? 'text-indigo-300 bg-indigo-500/10' : ''
            }`}
          >
            <span className="text-indigo-400">{MODEL_ICONS[m]}</span>
            {MODEL_LABELS[m]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
