import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type UIState = {
  compactPrioritiesHidden: boolean
}

type AppState = {
  notes: string
  intentions: string[]
  topPriorities: string[]
  ui: UIState
}

type AppActions = {
  setNotes: (s: string) => void
  setIntentions: (a: string[]) => void
  setTopPriorities: (a: string[]) => void
  setCompactPrioritiesHidden: (hidden: boolean) => void
}

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
      notes: '',
      intentions: [],
      topPriorities: [],
      ui: {
        compactPrioritiesHidden: false,
      },
      setNotes: (s) => set({ notes: s }),
      setIntentions: (a) => set({ intentions: a }),
      setTopPriorities: (a) => set({ topPriorities: a }),
      setCompactPrioritiesHidden: (hidden) => set((state) => ({ ui: { ...state.ui, compactPrioritiesHidden: hidden } })),
    }),
    {
      name: 'kanban-app',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notes: state.notes,
        intentions: state.intentions,
        topPriorities: state.topPriorities,
        ui: state.ui,
      }),
    },
  )
)

