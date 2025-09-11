import React, { useEffect, useMemo, useState } from 'react';
import { Board } from "../types";
import { extractTags } from "../utils/tags";

function cleanLine(s: string) {
  return s
    .trim()
    .replace(/^\s*(?:[\u25A9\u2022\u2023\u25E6\u2043\u2219\-\u2013\u2014\*]+|\d+[.)])\s+/, '')
    .replace(/^[-•\s]+/, '');
}

interface Props {
  board?: Board;
  onOpenPriorities?: () => void;
}

export default function CompactPriorities({ board, onOpenPriorities }: Props) {
  const [hidden, setHidden] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kanban-compact-priorities-hidden') === '1';
    } catch {
      return false;
    }
  });
  const [pinned, setPinned] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('kanban-pinned-priorities');
      const list = raw ? (JSON.parse(raw) as string[]) : [];
      setPinned(list);
    } catch {
      setPinned([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('kanban-compact-priorities-hidden', hidden ? '1' : '0');
    } catch {}
  }, [hidden]);

  const tagDerived = useMemo(() => {
    if (!board) return [] as string[];
    const tops = new Set(["#top", "#priority", "#prio", "#p1"]);
    const lines: string[] = [];
    for (const col of board.columns || []) {
      for (const t of col.tasks || []) {
        const tags = new Set(extractTags(t.content));
        if ([...tags].some(tg => tops.has(tg))) {
          lines.push(t.content.replace(/#[a-zA-Z0-9_]+/g, '').trim());
        }
      }
      for (const g of col.groups || []) {
        for (const t of g.tasks || []) {
          const tags = new Set(extractTags(t.content));
          if ([...tags].some(tg => tops.has(tg))) {
            lines.push(t.content.replace(/#[a-zA-Z0-9_]+/g, '').trim());
          }
        }
      }
    }
    return lines.filter(Boolean);
  }, [board]);

  const items = useMemo(() => {
    const pinnedClean = pinned.map(cleanLine).filter(Boolean);
    if (pinnedClean.length > 0) return pinnedClean.slice(0, 6);
    return tagDerived.slice(0, 6);
  }, [pinned, tagDerived]);

  if (hidden && items.length > 0) {
    return (
      <div className="w-64">
        <div className="w-64 bg-gradient-to-br from-violet-50 to-fuchsia-100 border-2 border-violet-200 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-violet-900">Top Priorities</h3>
            <button
              className="text-xs px-2 py-1 rounded-md border border-violet-300 bg-white hover:bg-gray-50"
              onClick={() => setHidden(false)}
            >
              Show
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (hidden || items.length === 0) return null;

  return (
    <div className="w-64">
      <div className="w-64 bg-gradient-to-br from-violet-50 to-fuchsia-100 border-2 border-violet-200 rounded-2xl p-4 shadow-lg">
        <div className="flex-1">
          <div className="text-sm font-bold text-violet-900 mb-2">Top Priorities</div>
          <ul className="list-disc pl-5 space-y-1 text-violet-900/90">
            {items.map((line, i) => (
              <li key={i} className="text-sm text-gray-800 leading-6">{line}</li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {onOpenPriorities && (
            <button
              onClick={onOpenPriorities}
              className="px-3 py-1.5 text-xs rounded-md border border-violet-300 bg-white hover:bg-gray-50 shadow-sm"
            >
              Open
            </button>
          )}
          <button
            onClick={() => setHidden(true)}
            className="px-3 py-1.5 text-xs rounded-md border border-violet-300 bg-white hover:bg-gray-50 shadow-sm"
          >
            Hide
          </button>
        </div>
      </div>
    </div>
  );
}
