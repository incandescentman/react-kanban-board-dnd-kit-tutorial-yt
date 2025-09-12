import { useAppStore } from '@/state/store'

export type ExportedData = {
  version: number
  exportedAt: string
  boards: Record<string, any>
  boardOrder: string[]
  notes: string
  intentions: string[]
  topPriorities: string[]
  compactPrioritiesHidden: boolean
}

const BOARD_KEY_PREFIX = 'kanban-board-state'

export function exportAllDataFromStorage(store: Storage): ExportedData {
  // Prefer Zustand store (single source of truth)
  const st = useAppStore.getState()
  const fromStore: { notes: string; intentions: string[]; topPriorities: string[]; ui?: { compactPrioritiesHidden: boolean } } | null = st

  const data: ExportedData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    boards: {},
    boardOrder: [],
    notes: fromStore?.notes ?? '',
    intentions: fromStore?.intentions ?? [],
    topPriorities: fromStore?.topPriorities ?? [],
    compactPrioritiesHidden: fromStore?.ui?.compactPrioritiesHidden ?? false,
  }

  const boardKeys: string[] = []
  for (let i = 0; i < store.length; i++) {
    const k = store.key(i)
    if (k && k.startsWith(BOARD_KEY_PREFIX)) boardKeys.push(k)
  }
  for (const key of boardKeys) {
    try {
      const val = store.getItem(key)
      if (val) data.boards[key] = JSON.parse(val)
    } catch {
      // ignore bad JSON
    }
  }

  try {
    data.boardOrder = JSON.parse(store.getItem('kanban-board-order') || '[]')
  } catch {
    data.boardOrder = []
  }
  if (!fromStore || (fromStore.intentions.length === 0 && fromStore.topPriorities.length === 0)) {
    data.notes = store.getItem('kanban-notes') || ''
    try { data.intentions = JSON.parse(store.getItem('kanban-intentions') || '[]') } catch {}
    try {
      const top = store.getItem('kanban-top-priorities')
      const legacy = store.getItem('kanban-pinned-priorities')
      data.topPriorities = JSON.parse(top || legacy || '[]')
    } catch {}
    data.compactPrioritiesHidden = store.getItem('kanban-compact-priorities-hidden') === '1'
  }
  return data
}

export function importAllDataToStorage(store: Storage, data: ExportedData) {
  if (!data || typeof data !== 'object') throw new Error('Invalid data')
  if (!('boards' in data) || !('boardOrder' in data)) throw new Error('Invalid data format')

  // Normalize snapshot: coerce IDs and map legacy status->completed
  const snap = JSON.parse(JSON.stringify(data)) as ExportedData
  try {
    Object.keys(snap.boards || {}).forEach((k) => {
      const b = (snap.boards as any)[k]
      if (!b || !Array.isArray(b.columns)) return
      b.columns.forEach((col: any) => {
        // normalize id to string
        if (col && col.id != null) col.id = String(col.id)
        // tasks at column level
        if (Array.isArray(col.tasks)) {
          col.tasks.forEach((t: any) => {
            if (t && t.id != null) t.id = String(t.id)
            if (typeof t.completed === 'undefined' && typeof t.status === 'string') {
              const s = (t.status || '').toString().toLowerCase()
              t.completed = s === 'done' || s === 'completed'
            }
          })
        }
        // tasks inside groups
        if (Array.isArray(col.groups)) {
          col.groups.forEach((g: any) => {
            if (g && g.id != null) g.id = String(g.id)
            if (Array.isArray(g.tasks)) {
              g.tasks.forEach((t: any) => {
                if (t && t.id != null) t.id = String(t.id)
                if (typeof t.completed === 'undefined' && typeof t.status === 'string') {
                  const s = (t.status || '').toString().toLowerCase()
                  t.completed = s === 'done' || s === 'completed'
                }
              })
            }
          })
        }
      })
    })
  } catch {}

  // Clear existing relevant keys
  const toRemove: string[] = []
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i)
    if (!key) continue
    if (
      key.startsWith(BOARD_KEY_PREFIX) ||
      key === 'kanban-board-order' ||
      key === 'kanban-notes' ||
      key === 'kanban-intentions' ||
      key === 'kanban-pinned-priorities' ||
      key === 'kanban-top-priorities' ||
      key === 'kanban-compact-priorities-hidden'
    ) {
      toRemove.push(key)
    }
  }
  toRemove.forEach((k) => store.removeItem(k))

  // Write new data
  for (const boardKey of Object.keys(snap.boards || {})) {
    store.setItem(boardKey, JSON.stringify((snap.boards as any)[boardKey]))
  }
  store.setItem('kanban-board-order', JSON.stringify(snap.boardOrder || []))
  if (snap.notes) store.setItem('kanban-notes', snap.notes)
  if (snap.intentions) store.setItem('kanban-intentions', JSON.stringify(snap.intentions))
  // Accept both topPriorities and legacy pinnedPriorities
  const incomingTop = (snap as any).topPriorities as any
  const incomingPinned = (snap as any).pinnedPriorities as any
  const finalTop = Array.isArray(incomingTop) ? incomingTop : (Array.isArray(incomingPinned) ? incomingPinned : [])
  // Write to new canonical key
  store.setItem('kanban-top-priorities', JSON.stringify(finalTop))
  // Also write legacy key for backward compatibility
  store.setItem('kanban-pinned-priorities', JSON.stringify(finalTop))
  store.setItem('kanban-compact-priorities-hidden', snap.compactPrioritiesHidden ? '1' : '0')
  // Hydrate Zustand store (no reload)
  const st = useAppStore.getState()
  st.setNotes?.(snap.notes || '')
  st.setIntentions?.(Array.isArray(snap.intentions) ? snap.intentions : [])
  {
    const incomingTop = (snap as any).topPriorities as any
    const incomingPinned = (snap as any).pinnedPriorities as any
    const finalTop = Array.isArray(incomingTop) ? incomingTop : (Array.isArray(incomingPinned) ? incomingPinned : [])
    st.setTopPriorities?.(finalTop)
  }
  st.setCompactPrioritiesHidden?.(!!snap.compactPrioritiesHidden)
}
