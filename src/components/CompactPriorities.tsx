import React, { useEffect, useMemo, useState } from 'react';

function cleanLine(s: string) {
  return s
    .trim()
    .replace(/^\s*(?:[\u25A9\u2022\u2023\u25E6\u2043\u2219\-\u2013\u2014\*]+|\d+[.)])\s+/, '')
    .replace(/^[-•\s]+/, '');
}

interface Props {
  onOpenPriorities?: () => void;
}

export default function CompactPriorities({ onOpenPriorities }: Props) {
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

  const items = useMemo(() => pinned.map(cleanLine).filter(Boolean).slice(0, 6), [pinned]);

  if (hidden || items.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mb-6">
      <div className="rounded-2xl border border-gray-200 bg-white/80 shadow-sm p-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900 mb-2">Top Priorities</div>
          <ul className="list-disc pl-5 space-y-1">
            {items.map((line, i) => (
              <li key={i} className="text-sm text-gray-800 leading-6">{line}</li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {onOpenPriorities && (
            <button
              onClick={onOpenPriorities}
              className="px-3 py-1.5 text-xs rounded-md border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
            >
              Open
            </button>
          )}
          <button
            onClick={() => setHidden(true)}
            className="px-3 py-1.5 text-xs rounded-md border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
          >
            Hide
          </button>
        </div>
      </div>
    </div>
  );
}

