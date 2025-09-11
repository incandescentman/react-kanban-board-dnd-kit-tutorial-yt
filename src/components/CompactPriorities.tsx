import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Minus, Plus } from 'lucide-react';
import { IconPointFilled } from '@tabler/icons-react';
import { Board } from "../types";
import { extractTags } from "../utils/tags";

function cleanLine(s: string) {
  const base = s
    .trim()
    .replace(/^\s*(?:[\u25A9\u2022\u2023\u25E6\u2043\u2219\-\u2013\u2014\*]+|\d+[.)])\s+/, '')
    .replace(/^[-•\s]+/, '');
  return base.length ? base[0].toUpperCase() + base.slice(1) : base;
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
        <div className="relative w-64 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl p-3 shadow-sm">
          <div className="text-[12px] font-semibold text-blue-900/90">Top Priorities</div>
          <button
            className="absolute top-2 right-2 inline-flex items-center justify-center h-5 w-5 rounded hover:bg-blue-100/70"
            onClick={() => setHidden(false)}
            aria-label="Show priorities"
            title="Show"
          >
            <Plus className="h-3 w-3 text-blue-700" />
          </button>
        </div>
      </div>
    );
  }

  if (hidden || items.length === 0) return null;

  return (
    <div className="w-64">
      <div className="relative w-64 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl p-4 shadow-lg">
        <div className="flex-1 pr-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⭐️</span>
            <h3 className="text-base font-bold text-blue-900">Top Priorities</h3>
          </div>
          <div className="space-y-1.5">
            {items.map((line, i) => (
              <div
                key={i}
                className="bg-white/70 backdrop-blur-sm border border-blue-200 rounded-lg p-2.5 hover:bg-white/90 transition-colors flex items-start gap-2"
                title={line}
              >
                <IconPointFilled size={14} className="mt-0.5 text-blue-700" aria-hidden="true" />
                <span className="text-sm text-blue-900">{line}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Tiny minimal symbols at the top-right */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          {onOpenPriorities && (
            <button
              onClick={onOpenPriorities}
              className="inline-flex items-center justify-center h-5 w-5 rounded hover:bg-blue-100/70"
              aria-label="Open priorities view"
              title="Open"
            >
              <ArrowUpRight className="h-3.5 w-3.5 text-blue-700" />
            </button>
          )}
          <button
            onClick={() => setHidden(true)}
            className="inline-flex items-center justify-center h-5 w-5 rounded hover:bg-blue-100/70"
            aria-label="Hide priorities"
            title="Hide"
          >
            <Minus className="h-3.5 w-3.5 text-blue-700" />
          </button>
        </div>
      </div>
    </div>
  );
}
