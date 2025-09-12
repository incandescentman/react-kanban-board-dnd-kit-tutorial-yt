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
  const data: ExportedData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    boards: {},
    boardOrder: [],
    notes: '',
    intentions: [],
    topPriorities: [],
    compactPrioritiesHidden: false,
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
  data.notes = store.getItem('kanban-notes') || ''
  try {
    data.intentions = JSON.parse(store.getItem('kanban-intentions') || '[]')
  } catch { data.intentions = [] }
  try {
    // Prefer new canonical key; fallback to legacy pinned key
    const top = store.getItem('kanban-top-priorities')
    const legacy = store.getItem('kanban-pinned-priorities')
    data.topPriorities = JSON.parse(top || legacy || '[]')
  } catch { data.topPriorities = [] }
  data.compactPrioritiesHidden = store.getItem('kanban-compact-priorities-hidden') === '1'
  return data
}

export function importAllDataToStorage(store: Storage, data: ExportedData) {
  if (!data || typeof data !== 'object') throw new Error('Invalid data')
  if (!('boards' in data) || !('boardOrder' in data)) throw new Error('Invalid data format')

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
  for (const boardKey of Object.keys(data.boards || {})) {
    store.setItem(boardKey, JSON.stringify((data.boards as any)[boardKey]))
  }
  store.setItem('kanban-board-order', JSON.stringify(data.boardOrder || []))
  if (data.notes) store.setItem('kanban-notes', data.notes)
  if (data.intentions) store.setItem('kanban-intentions', JSON.stringify(data.intentions))
  // Accept both topPriorities and legacy pinnedPriorities
  const incomingTop = (data as any).topPriorities as any
  const incomingPinned = (data as any).pinnedPriorities as any
  const finalTop = Array.isArray(incomingTop) ? incomingTop : (Array.isArray(incomingPinned) ? incomingPinned : [])
  store.setItem('kanban-top-priorities', JSON.stringify(finalTop))
  store.setItem('kanban-compact-priorities-hidden', data.compactPrioritiesHidden ? '1' : '0')
}
