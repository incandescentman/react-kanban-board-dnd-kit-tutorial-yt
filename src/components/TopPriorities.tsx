import React, { useEffect, useMemo, useState } from "react";
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

  const startEdit = () => {
    setDraft(pinned.join("\n"));
    setEditing(true);
  };
  const saveEdit = () => {
    const next = draft
      .split(/\r?\n/)
      .map(s => s.trim())
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
    <div className="w-full max-w-5xl mx-auto py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Current Top Priorities</h2>
        <div className="text-sm text-gray-500">{items.length} item{items.length === 1 ? "" : "s"}</div>
      </div>

      {/* Pinned priorities (manual) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-800">Pinned</h3>
          <div className="flex items-center gap-2">
          {onImportPinnedToBoard && !editing && pinned.length > 0 && (
            <button
              className="px-2 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50"
              onClick={() => onImportPinnedToBoard(preferredBoardTitle || board.title)}
              title={`Create #top cards in \"${preferredBoardTitle || board.title}\"`}
            >
              Add as #top cards{preferredBoardTitle ? ` in \"${preferredBoardTitle}\"` : ''}
            </button>
          )}
          {editing ? (
            <div className="flex gap-2">
              <button className="px-2 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50" onClick={saveEdit}>Save</button>
              <button className="px-2 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          ) : (
            <button className="px-2 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50" onClick={startEdit}>Edit</button>
          )}
          </div>
        </div>
        {editing ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="One priority per line"
            className="w-full min-h-[120px] text-sm border border-gray-300 rounded p-2"
          />
        ) : pinned.length === 0 ? (
          <div className="text-sm text-gray-500">
            No pinned priorities yet. Click Edit to paste your list (one per line).
          </div>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {pinned.map((p, i) => (
              <li key={i} className="text-sm text-gray-800">{p}</li>
            ))}
          </ul>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-gray-500">Add #top or #priority to any card to show it here.</div>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => onSelectTask(it.id)}
              className={`w-full text-left p-3 rounded-md border bg-white hover:bg-gray-50 transition-colors ${
                it.completed ? "opacity-70" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className={`text-sm ${it.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                    {it.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    <span className="font-medium">{it.columnTitle}</span>
                    {it.groupTitle && <span className="ml-2">• {it.groupTitle}</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
