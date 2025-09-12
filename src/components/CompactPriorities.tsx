import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Minus, Plus } from 'lucide-react';
import {
  IconPointFilled,
  IconTarget,
  IconRocket,
  IconSparkles,
  IconFlag,
  IconStar,
  IconTrendingUp,
  IconBolt,
  IconFlame,
  IconActivity,
  IconBriefcase,
  IconHeart,
  IconBook2,
  IconScale
} from '@tabler/icons-react';
import { Board } from "../types";
import { extractTags } from "../utils/tags";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function cleanLine(s: string) {
  const base = s
    .trim()
    .replace(/^\s*(?:[\u25A9\u2022\u2023\u25E6\u2043\u2219\-\u2013\u2014\*]+|\d+[.)])\s+/, '')
    .replace(/^[-•\s]+/, '');
  return base.length ? base[0].toUpperCase() + base.slice(1) : base;
}

// Sortable Priority Item Component
function SortablePriorityItem({ 
  line, 
  index, 
  isLast, 
  getIconForPriority 
}: { 
  line: string; 
  index: number; 
  isLast: boolean; 
  getIconForPriority: (line: string, i: number) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: line });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex gap-3 cursor-move hover:bg-white/30 rounded-lg px-2 -mx-2 transition-colors"
      title={line}
      {...attributes}
      {...listeners}
    >
      {/* Icon with timeline */}
      <div className="relative flex flex-col items-center">
        <div className="w-7 h-7 flex items-center justify-center shrink-0 rounded-full bg-white border border-blue-900 p-1 z-10">
          {getIconForPriority(line, index)}
        </div>
        {!isLast && (
          <div className="w-px h-full bg-gray-300 absolute top-7" />
        )}
      </div>
      {/* Text content */}
      <div className="flex-1 pb-4">
        <span className="text-base text-blue-900 leading-6">{line}</span>
      </div>
    </div>
  );
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(item => item === active.id);
      const newIndex = items.findIndex(item => item === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update pinned priorities in localStorage
        setPinned(newItems);
        try {
          localStorage.setItem('kanban-pinned-priorities', JSON.stringify(newItems));
        } catch (error) {
          console.error('Failed to save reordered priorities:', error);
        }
      }
    }
  };

  const getIconForPriority = (line: string, i: number) => {
    const l = line.toLowerCase();
    if (/\bsrs\b|spaced review|review system/.test(l)) return <IconBook2 size={16} className="text-blue-900" aria-hidden="true" />;
    if (/food|urge/.test(l)) return <IconFlame size={16} className="text-blue-900" aria-hidden="true" />;
    if (/185|pound|weight/.test(l)) return <IconScale size={16} className="text-blue-900" aria-hidden="true" />;
    if (/substack|launch|publish|invite/.test(l)) return <IconRocket size={16} className="text-blue-900" aria-hidden="true" />;
    if (/job|work|hiring|career/.test(l)) return <IconBriefcase size={16} className="text-blue-900" aria-hidden="true" />;
    if (/date|dating|relationship|partner|love/.test(l)) return <IconHeart size={16} className="text-blue-900" aria-hidden="true" />;
    // fallback by index to keep variety
    const fallback = [
      <IconTarget key="t" size={16} className="text-blue-900" aria-hidden="true" />,
      <IconSparkles key="s" size={16} className="text-blue-900" aria-hidden="true" />,
      <IconStar key="st" size={16} className="text-blue-900" aria-hidden="true" />,
      <IconBolt key="b" size={16} className="text-blue-900" aria-hidden="true" />,
      <IconActivity key="a" size={16} className="text-blue-900" aria-hidden="true" />,
    ];
    return fallback[i % fallback.length] || <IconPointFilled size={16} className="text-blue-900" aria-hidden="true" />;
  };

  if (hidden && items.length > 0) {
    return (
      <div className="w-72">
        <div className="relative w-72 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl p-3 shadow-sm">
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
    <div className="w-72">
      <div className="relative w-72 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-4 shadow-md">
        <div className="flex-1 pr-8">
          <div className="mb-5 pb-3 border-b border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 text-center">Top Priorities</h3>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-0">
                {items.map((line, i) => {
                  const isLast = i === items.length - 1;
                  return (
                    <SortablePriorityItem
                      key={line}
                      line={line}
                      index={i}
                      isLast={isLast}
                      getIconForPriority={getIconForPriority}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
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
