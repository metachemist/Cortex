'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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

interface SaveToMemoryButtonProps {
  content: string
}

export default function SaveToMemoryButton({ content }: SaveToMemoryButtonProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<MemoryType>('skill')
  const [editedContent, setEditedContent] = useState(content)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    const res = await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), type, content: editedContent }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => {
        setOpen(false)
        setSaved(false)
        setTitle('')
        setType('skill')
      }, 800)
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setEditedContent(content)
          setOpen(true)
        }}
        className="p-1.5 rounded-md text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
        title="Save to Memory"
      >
        <Bookmark className="w-3.5 h-3.5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#131316] border-white/[0.08] text-zinc-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 text-sm font-semibold">
              Save to Memory
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Prefers concise answers"
                className="bg-white/[0.04] border-white/[0.08] text-zinc-100 placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Content</Label>
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={4}
                className="bg-white/[0.04] border-white/[0.08] text-zinc-300 text-sm resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="border-white/[0.08] text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white border-0"
            >
              {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
