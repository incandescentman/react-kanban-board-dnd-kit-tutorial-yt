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

// One-time hydration from legacy/local keys if store is empty.
// This recovers user data (intentions and top priorities) after migrations.
try {
  const st = useAppStore.getState();
  // Recover top priorities
  if (!st.topPriorities || st.topPriorities.length === 0) {
    let tops: string[] = [];
    try {
      const rawTop = localStorage.getItem('kanban-top-priorities');
      const rawLegacy = localStorage.getItem('kanban-pinned-priorities');
      if (rawTop) tops = JSON.parse(rawTop);
      else if (rawLegacy) tops = JSON.parse(rawLegacy);
    } catch {}
    if (Array.isArray(tops) && tops.length) {
      useAppStore.setState({ topPriorities: tops });
    }
  }
  // Recover intentions
  if (!st.intentions || st.intentions.length === 0) {
    let ints: string[] = [];
    try {
      const rawInt = localStorage.getItem('kanban-intentions') || '';
      if (rawInt) {
        try {
          const parsed = JSON.parse(rawInt);
          if (Array.isArray(parsed)) ints = parsed.filter(Boolean);
        } catch {
          // Support legacy newline-separated string
          ints = rawInt.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        }
      }
    } catch {}
    if (Array.isArray(ints) && ints.length) {
      useAppStore.setState({ intentions: ints });
    }
  }
} catch {}

