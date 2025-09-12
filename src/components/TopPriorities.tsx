import React, { useEffect, useRef, useState } from "react";
import { IconPointFilled, IconTarget } from '@tabler/icons-react';
import { Board, Id } from "../types";

interface Props {
  board: Board;
  onSelectTask: (id: Id) => void;
  onImportPinnedToBoard?: (boardTitle: string) => void;
  preferredBoardTitle?: string;
}

// Simplified priorities view: only pinned priorities are shown.

export default function TopPriorities({ board, onSelectTask, onImportPinnedToBoard, preferredBoardTitle }: Props) {
  const [pinned, setPinned] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('kanban-pinned-priorities');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>("");
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('kanban-pinned-priorities', JSON.stringify(pinned));
    } catch {}
  }, [pinned]);

  const cleanLine = (s: string) =>
    s
      .trim()
      // remove common leading bullets/hyphens/numeric markers
      .replace(/^\s*(?:[\u25A9\u2022\u2023\u25E6\u2043\u2219\-\u2013\u2014\*]+|\d+[.)])\s+/, '')
      .replace(/^[-•\s]+/, '')
      .replace(/^(.)/, (_, c: string) => c.toUpperCase());

  const startEdit = () => {
    setDraft(pinned.join("\n"));
    setEditing(true);
  };
  const saveEdit = () => {
    const next = draft
      .split(/\r?\n/)
      .map(cleanLine)
      .filter(Boolean);
    setPinned(next);
    setEditing(false);
  };
  const cancelEdit = () => {
    setEditing(false);
    setDraft("");
  };

  // Save when clicking outside the pinned card while editing
  useEffect(() => {
    if (!editing) return;
    function onDocMouseDown(e: MouseEvent) {
      if (!cardRef.current) return;
      if (!cardRef.current.contains(e.target as Node)) {
        saveEdit();
      }
    }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [editing, draft, pinned]);

  // Tag-derived cards are intentionally not rendered here to keep it minimal.

  return (
    <div className="w-full max-w-6xl mx-auto py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center shadow-sm">
            <IconTarget size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Top Priorities</h2>
            <p className="text-sm text-gray-500 mt-0.5">Pinned first, then cards tagged with <span className="font-medium">#top</span> or <span className="font-medium">#priority</span></p>
          </div>
        </div>
        {/* No counts for simplicity */}
      </div>

      {/* Pinned priorities (manual) */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Pinned</h3>
          <div className="flex items-center gap-2">
          {onImportPinnedToBoard && !editing && pinned.length > 0 && (
            <button
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 shadow-sm inline-flex items-center gap-2"
              onClick={() => onImportPinnedToBoard(preferredBoardTitle || board.title)}
              title={`Create #top cards in \"${preferredBoardTitle || board.title}\"`}
            >
              <IconTarget size={16} className="text-amber-500" />
              Add as #top cards{preferredBoardTitle ? ` in \"${preferredBoardTitle}\"` : ''}
            </button>
          )}
          </div>
        </div>
        <div
          ref={cardRef}
          onDoubleClick={startEdit}
          className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm p-5 max-w-xl mx-auto cursor-text"
          title={editing ? 'Click outside to save • Esc to cancel' : 'Double‑click to edit • Click outside to save'}
        >
          {editing ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="One priority per line"
              className="w-full min-h-[180px] text-base border border-gray-300 rounded-md p-4 shadow-inner focus:outline-none focus:ring-2 focus:ring-gray-300 leading-7"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  cancelEdit();
                }
              }}
            />
          ) : pinned.length === 0 ? (
            <div className="text-sm text-gray-500">
              No pinned priorities yet. Double‑click to paste your list (one per line).
            </div>
          ) : (
            <div className="space-y-2">
              {pinned.map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <IconPointFilled size={16} className="mt-1 text-blue-700" aria-hidden="true" />
                  <div className="text-lg text-gray-900 leading-7">{cleanLine(p)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Removed tag-derived cards for a simple Priorities view */}
    </div>
  );
}
