import { describe, it, expect } from 'vitest'
import { exportAllDataFromStorage, importAllDataToStorage, type ExportedData } from '@/lib/dataTransfer'

class FakeStorage implements Storage {
  private m = new Map<string, string>()
  get length() { return this.m.size }
  clear(): void { this.m.clear() }
  getItem(key: string): string | null { return this.m.has(key) ? this.m.get(key)! : null }
  key(index: number): string | null { return Array.from(this.m.keys())[index] ?? null }
  removeItem(key: string): void { this.m.delete(key) }
  setItem(key: string, value: string): void { this.m.set(key, value) }
  // Iterator support
  [key: string]: any
}

describe('dataTransfer', () => {
  it('exports all relevant data', () => {
    const store = new FakeStorage()
    // Seed
    store.setItem('kanban-board-state', JSON.stringify({ title: 'A', columns: [] }))
    store.setItem('kanban-board-state-work', JSON.stringify({ title: 'Work', columns: [] }))
    store.setItem('kanban-board-order', JSON.stringify(['kanban-board-state', 'kanban-board-state-work']))
    store.setItem('kanban-notes', 'hello')
    store.setItem('kanban-intentions', JSON.stringify(['Focus on impact']))
    store.setItem('kanban-top-priorities', JSON.stringify(['Do X']))
    store.setItem('kanban-compact-priorities-hidden', '1')

    const out = exportAllDataFromStorage(store)
    expect(out.version).toBe(1)
    expect(Object.keys(out.boards)).toContain('kanban-board-state')
    expect(out.boardOrder).toEqual(['kanban-board-state', 'kanban-board-state-work'])
    expect(out.notes).toBe('hello')
    expect(out.intentions).toEqual(['Focus on impact'])
    expect(out.topPriorities).toEqual(['Do X'])
    expect(out.compactPrioritiesHidden).toBe(true)
  })

  it('imports data and overwrites existing keys', () => {
    const store = new FakeStorage()
    // Pre-existing junk
    store.setItem('kanban-board-state-old', JSON.stringify({}))
    store.setItem('kanban-notes', 'old')

    const data: ExportedData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      boards: {
        'kanban-board-state': { title: 'A', columns: [] },
        'kanban-board-state-work': { title: 'Work', columns: [] },
      },
      boardOrder: ['kanban-board-state', 'kanban-board-state-work'],
      notes: 'hello',
      intentions: ['Focus on impact'],
      topPriorities: ['Do X'],
      compactPrioritiesHidden: false,
    }

    importAllDataToStorage(store, data)

    expect(store.getItem('kanban-board-order')).toBe(JSON.stringify(data.boardOrder))
    expect(store.getItem('kanban-notes')).toBe('hello')
    expect(store.getItem('kanban-intentions')).toBe(JSON.stringify(['Focus on impact']))
    expect(store.getItem('kanban-top-priorities')).toBe(JSON.stringify(['Do X']))
    expect(store.getItem('kanban-compact-priorities-hidden')).toBe('0')
    // Old board key should be gone
    expect(store.getItem('kanban-board-state-old')).toBeNull()
  })
})
