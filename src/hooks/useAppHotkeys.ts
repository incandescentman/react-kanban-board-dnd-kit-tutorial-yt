import { useEffect } from 'react'
import type { Id } from '@/types'

type View = 'board' | 'implementation' | 'triggers'

export function useAppHotkeys(opts: {
  activeView: View
  setActiveView: (v: View) => void
  availableBoards: string[]
  currentBoardName: string
  switchToBoard: (k: string) => void
  setFocusedTaskId: (id: Id | null) => void
}) {
  const { activeView, setActiveView, availableBoards, currentBoardName, switchToBoard, setFocusedTaskId } = opts

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const order: View[] = ['board', 'implementation', 'triggers']
      const idx = order.indexOf(activeView as View)
      const goView = (delta: number) => {
        const next = order[(idx + delta + order.length) % order.length]
        setActiveView(next)
      }
      const isEditableTarget = () => {
        const t = e.target as HTMLElement | null
        if (!t) return false
        const tag = t.tagName
        return t.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
      }
      const goBoard = (delta: number) => {
        if (!availableBoards || availableBoards.length === 0) return
        const curIdx = availableBoards.indexOf(currentBoardName)
        const nextIdx = ((curIdx === -1 ? 0 : curIdx) + delta + availableBoards.length) % availableBoards.length
        const next = availableBoards[nextIdx]
        if (next && next !== currentBoardName) switchToBoard(next)
      }

      // Cmd/Ctrl+1/2/3 select tabs
      if (e.metaKey || e.ctrlKey) {
        if (e.key === '1') { e.preventDefault(); setActiveView('board'); return }
        if (e.key === '2') { e.preventDefault(); setActiveView('implementation'); return }
        if (e.key === '3') { e.preventDefault(); setActiveView('triggers'); return }
      }
      // Cmd/Ctrl+Alt+Arrows cycle tabs
      if ((e.metaKey || e.ctrlKey) && e.altKey) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); goView(-1); return }
        if (e.key === 'ArrowRight') { e.preventDefault(); goView(1); return }
      }
      // Alt+K/L cycle tabs (not while typing)
      if (e.altKey && !e.metaKey && !e.ctrlKey && !isEditableTarget()) {
        if (e.code === 'KeyK') { e.preventDefault(); goView(-1); return }
        if (e.code === 'KeyL') { e.preventDefault(); goView(1); return }
      }
      // Alt+Shift+K/L cycle boards
      if (e.altKey && e.shiftKey && !e.metaKey && !e.ctrlKey && !isEditableTarget()) {
        if (e.code === 'KeyK') { e.preventDefault(); goBoard(-1); return }
        if (e.code === 'KeyL') { e.preventDefault(); goBoard(1); return }
      }
      // Tab/Shift+Tab focus first/last task (Boards view only)
      if (activeView === 'board' && e.key === 'Tab' && !e.metaKey && !e.ctrlKey && !e.altKey && !isEditableTarget()) {
        if (e.shiftKey) {
          const cards = Array.from(document.querySelectorAll('[data-task-id]')) as HTMLElement[]
          const last = cards[cards.length - 1] || null
          if (last) {
            e.preventDefault();
            const id = last.getAttribute('data-task-id') as Id | null
            if (id) setFocusedTaskId(id)
            last.focus()
          }
        } else {
          const first = document.querySelector('[data-task-id]') as HTMLElement | null
          if (first) {
            e.preventDefault();
            const id = first.getAttribute('data-task-id') as Id | null
            if (id) setFocusedTaskId(id)
            first.focus()
          }
        }
      }
      // Escape clears card focus
      if (activeView === 'board' && e.key === 'Escape') {
        const ae = document.activeElement as HTMLElement | null
        const container = ae?.closest('[data-task-id]') as HTMLElement | null
        if (container) {
          e.preventDefault();
          setFocusedTaskId(null)
          ae?.blur()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeView, setActiveView, availableBoards, currentBoardName, switchToBoard, setFocusedTaskId])
}

