'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Model } from '@/lib/types'
import { MODEL_LABELS } from '@/lib/types'

type InjectionMode = 'auto' | 'manual' | 'off'

export default function SettingsPage() {
  const [defaultModel, setDefaultModel] = useState<Model>('claude')
  const [injectionMode, setInjectionMode] = useState<InjectionMode>('auto')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/user-settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setDefaultModel(data.default_model ?? 'claude')
          setInjectionMode(data.memory_injection_mode ?? 'auto')
        }
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const res = await fetch('/api/user-settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ default_model: defaultModel, memory_injection_mode: injectionMode }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div className="h-full bg-[#09090b] overflow-y-auto">
      <div className="max-w-xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1
            className="text-xl font-bold text-zinc-100"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            Settings
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Configure your Cortex preferences.</p>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] divide-y divide-white/[0.06]">
          {/* Default model */}
          <div className="p-5 space-y-3">
            <div>
              <Label className="text-sm font-medium text-zinc-200">Default model</Label>
              <p className="text-xs text-zinc-500 mt-0.5">
                Which AI model to use when starting a new conversation.
              </p>
            </div>
            <Select value={defaultModel} onValueChange={(v) => setDefaultModel(v as Model)}>
              <SelectTrigger className="w-48 bg-white/[0.04] border-white/[0.08] text-zinc-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#131316] border-white/[0.08]">
                {(Object.entries(MODEL_LABELS) as [Model, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-zinc-300">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Memory injection mode */}
          <div className="p-5 space-y-3">
            <div>
              <Label className="text-sm font-medium text-zinc-200">Memory injection</Label>
              <p className="text-xs text-zinc-500 mt-0.5">
                How your memory is injected into conversations.
              </p>
            </div>
            <Select value={injectionMode} onValueChange={(v) => setInjectionMode(v as InjectionMode)}>
              <SelectTrigger className="w-48 bg-white/[0.04] border-white/[0.08] text-zinc-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#131316] border-white/[0.08]">
                <SelectItem value="auto" className="text-zinc-300">
                  Auto — always inject
                </SelectItem>
                <SelectItem value="manual" className="text-zinc-300">
                  Manual — ask each time
                </SelectItem>
                <SelectItem value="off" className="text-zinc-300">
                  Off — never inject
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-500 text-white border-0"
        >
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save settings'}
        </Button>
      </div>
    </div>
  )
}
