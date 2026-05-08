'use client'

import { create } from 'zustand'
import type { Model } from '@/lib/types'

interface AppStore {
  selectedModel: Model
  setSelectedModel: (model: Model) => void
}

export const useAppStore = create<AppStore>((set) => ({
  selectedModel: 'claude',
  setSelectedModel: (model) => set({ selectedModel: model }),
}))
