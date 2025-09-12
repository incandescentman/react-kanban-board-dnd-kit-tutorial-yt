import { describe, it, expect } from 'vitest'
import { generatePublicationHtml, generateAllPublicationHtml } from '@/lib/publish'
import type { Board } from '@/types'

const sampleBoard: Board = {
  title: 'Test Board',
  columns: [
    { id: 'c1', title: 'Todo', tasks: [{ id: 't1', content: 'Task #alpha', completed: false, tags: [] }], groups: [] },
  ],
  dataVersion: 2,
}

describe('publish', () => {
  it('generatePublicationHtml includes board title and content', () => {
    const html = generatePublicationHtml(sampleBoard, '/*css*/', { notes: 'Hello', intentions: ['Do x'], priorities: ['P1'] })
    expect(html).toContain('Test Board')
    expect(html).toContain('Hello')
    expect(html).toContain('P1')
  })

  it('generateAllPublicationHtml includes multiple boards and extras', () => {
    const html = generateAllPublicationHtml([sampleBoard, { ...sampleBoard, title: 'Board 2' }], '/*css*/', { notes: 'N', intentions: ['I'], priorities: ['P'] })
    expect(html).toContain('Test Board')
    expect(html).toContain('Board 2')
    expect(html).toContain('N')
  })
})

