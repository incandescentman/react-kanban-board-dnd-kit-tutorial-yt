import React, { useEffect, useMemo, useState } from "react";
import { Star, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { Board, Id, Task } from "../types";
import { extractTags, getTagColor } from "../utils/tags";

interface Props {
  board: Board;
  onSelectTask: (id: Id) => void;
  onImportPinnedToBoard?: (boardTitle: string) => void;
  preferredBoardTitle?: string;
}

const TOP_TAGS = new Set(["#top", "#priority", "#prio", "#p1"]);

type TaskItem = {
  id: Id;
  content: string;
  completed?: boolean;
  status?: string;
  columnTitle: string;
  groupTitle?: string;
};

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
      .replace(/^[-•\s]+/, '');

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

  const items = useMemo<TaskItem[]>(() => {
    const out: TaskItem[] = [];
    for (const col of board.columns || []) {
      // direct tasks
      for (const t of col.tasks || []) {
        const tags = new Set(extractTags(t.content));
        const hasTop = [...tags].some((tg) => TOP_TAGS.has(tg));
        if (hasTop) {
          out.push({
            id: t.id,
            content: t.content,
            completed: t.completed,
            status: t.status,
            columnTitle: col.title,
          });
        }
      }
      // group tasks
      for (const g of col.groups || []) {
        for (const t of g.tasks || []) {
          const tags = new Set(extractTags(t.content));
          const hasTop = [...tags].some((tg) => TOP_TAGS.has(tg));
          if (hasTop) {
            out.push({
              id: t.id,
              content: t.content,
              completed: t.completed,
              status: t.status,
              columnTitle: col.title,
              groupTitle: g.title,
            });
          }
        }
      }
    }
    // prioritize by column order (earlier columns first), then incomplete first
    const columnIndex = new Map<string, number>();
    board.columns?.forEach((c, i) => columnIndex.set(c.title, i));
    out.sort((a, b) => {
      const ai = columnIndex.get(a.columnTitle) ?? 0;
      const bi = columnIndex.get(b.columnTitle) ?? 0;
      if (ai !== bi) return ai - bi;
      if (!!a.completed !== !!b.completed) return a.completed ? 1 : -1;
      return 0;
    });
    return out;
  }, [board]);

  return (
    <div className="w-full max-w-6xl mx-auto py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center shadow-sm">
            <Star className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Top Priorities</h2>
            <p className="text-sm text-gray-500 mt-0.5">Pinned first, then cards tagged with <span className="font-medium">#top</span> or <span className="font-medium">#priority</span></p>
          </div>
        </div>
        <div className="text-sm text-gray-500">{items.length} item{items.length === 1 ? "" : "s"}</div>
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
              <Star className="h-4 w-4 text-amber-500" />
              Add as #top cards{preferredBoardTitle ? ` in \"${preferredBoardTitle}\"` : ''}
            </button>
          )}
          {editing ? (
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 shadow-sm" onClick={saveEdit}>Save</button>
              <button className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 shadow-sm" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          ) : (
            <button className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 shadow-sm" onClick={startEdit}>Edit</button>
          )}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm p-5 max-w-xl mx-auto">
          {editing ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="One priority per line"
              className="w-full min-h-[180px] text-base border border-gray-300 rounded-md p-4 shadow-inner focus:outline-none focus:ring-2 focus:ring-gray-300 leading-7"
            />
          ) : pinned.length === 0 ? (
            <div className="text-sm text-gray-500">
              No pinned priorities yet. Click Edit to paste your list (one per line).
            </div>
          ) : (
            <ul className="list-disc pl-6 space-y-3">
              {pinned.map((p, i) => (
                <li key={i} className="text-lg text-gray-900 leading-7">{cleanLine(p)}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500 bg-white/50">
          No #top or #priority cards yet. Tag a card to feature it here.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => onSelectTask(it.id)}
              className={`group w-full text-left p-4 rounded-2xl border border-gray-200 bg-white/80 hover:bg-white shadow-sm hover:shadow-md transition-all ${
                it.completed ? "opacity-75" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {it.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className={`text-[15px] leading-6 ${it.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                      {it.content}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 font-medium">{it.columnTitle}</span>
                      {it.groupTitle && <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">{it.groupTitle}</span>}
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
