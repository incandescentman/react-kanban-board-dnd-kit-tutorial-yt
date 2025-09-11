import React, { useMemo } from "react";
import { Board, Id, Task } from "../types";
import { extractTags, getTagColor } from "../utils/tags";

interface Props {
  board: Board;
  onSelectTask: (id: Id) => void;
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

export default function TopPriorities({ board, onSelectTask }: Props) {
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

