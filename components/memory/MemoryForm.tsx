'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MemoryType } from '@/lib/types'

interface MemoryFormProps {
  onSave: (data: { title: string; type: MemoryType; content: string; tags: string[] }) => void
  onCancel: () => void
  loading?: boolean
}

export default function MemoryForm({ onSave, onCancel, loading }: MemoryFormProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<MemoryType>('skill')
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onSave({ title: title.trim(), type, content: content.trim(), tags })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label className="text-zinc-400 text-xs uppercase tracking-wider">Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Prefers bullet points"
            required
            className="bg-white/[0.04] border-white/[0.08] text-zinc-100 placeholder:text-zinc-600"
          />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label className="text-zinc-400 text-xs uppercase tracking-wider">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as MemoryType)}>
            <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-zinc-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#131316] border-white/[0.08]">
              {(['prompt', 'skill', 'preference', 'workflow'] as MemoryType[]).map((t) => (
                <SelectItem key={t} value={t} className="text-zinc-300 capitalize">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-zinc-400 text-xs uppercase tracking-wider">Content</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe this memory in detail…"
          rows={4}
          required
          className="bg-white/[0.04] border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-zinc-400 text-xs uppercase tracking-wider">
          Tags{' '}
          <span className="text-zinc-600 normal-case tracking-normal">(comma-separated)</span>
        </Label>
        <Input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="coding, writing, work"
          className="bg-white/[0.04] border-white/[0.08] text-zinc-300 placeholder:text-zinc-600"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="border-white/[0.08] text-zinc-400 hover:text-zinc-200"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={loading || !title.trim() || !content.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white border-0"
        >
          {loading ? 'Saving…' : 'Save memory'}
        </Button>
      </div>
    </form>
  )
}
