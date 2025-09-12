import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
  getIconForPriority,
  onEdit,
  onDelete,
  editingIndex,
  editingText,
  setEditingText,
  handleSave,
  setEditingIndex
}: { 
  line: string; 
  index: number; 
  isLast: boolean; 
  getIconForPriority: (line: string, i: number) => React.ReactNode;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  editingIndex: number | null;
  editingText: string;
  setEditingText: (text: string) => void;
  handleSave: () => void;
  setEditingIndex: (index: number | null) => void;
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
      className="relative flex gap-3 group"
      title={line}
    >
      {/* Icon with timeline - draggable */}
      <div className="relative flex flex-col items-center">
        <div 
          className="w-7 h-7 flex items-center justify-center shrink-0 rounded-full bg-white border border-blue-900 p-1 z-10 cursor-move"
          {...attributes}
          {...listeners}
        >
          {getIconForPriority(line, index)}
        </div>
        {!isLast && (
          <div className="w-px h-full bg-gray-300 absolute top-7" />
        )}
      </div>
      {/* Text content */}
      <div className="flex-1 pb-4">
        {editingIndex === index ? (
          <input
            type="text"
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            className="w-full text-base text-blue-900 bg-white/70 border border-blue-300 rounded px-2 py-1 outline-none focus:border-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              } else if (e.key === 'Escape') {
                setEditingIndex(null);
                setEditingText("");
              }
            }}
            onBlur={handleSave}
            autoFocus
          />
        ) : (
          <div className="flex items-center justify-between">
            <span 
              className="text-base text-blue-900 leading-6 cursor-pointer flex-1"
              onDoubleClick={() => onEdit(index)}
            >
              {line}
            </span>
            <button
              onClick={() => onDelete(index)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 text-sm ml-2"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  board?: Board;
  onOpenPriorities?: () => void;
}

// Undo action type
interface UndoAction {
  type: 'DELETE_PRIORITY';
  data: { priority: string; index: number };
  timestamp: number;
}

export default function CompactPriorities({ board, onOpenPriorities }: Props) {
  const [pinned, setPinned] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);

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
      
      // If no saved priorities, use defaults
      if (list.length === 0) {
        const defaultPriorities = [
          "Begin an SRS system for actions and intentions",
          "Finish food urges implementation intentions and triggers -> answers",
          "185 pounds and fitness routine",
          "Launch, invite people, and publish Socratic Substack",
          "Job search and career development",
          "Dating and relationships"
        ];
        setPinned(defaultPriorities);
      } else {
        setPinned(list);
      }
    } catch {
      // On error, use defaults
      const defaultPriorities = [
        "Begin an SRS system for actions and intentions",
        "Finish food urges implementation intentions and triggers -> answers",
        "185 pounds and fitness routine",
        "Launch, invite people, and publish Socratic Substack",
        "Job search and career development",
        "Dating and relationships"
      ];
      setPinned(defaultPriorities);
    }
  }, []);

  // Save pinned to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('kanban-pinned-priorities', JSON.stringify(pinned));
    } catch (error) {
      console.error('Failed to save priorities:', error);
    }
  }, [pinned]);

  // Handle keyboard shortcuts for undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack]);

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
        setPinned(newItems);
      }
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingText(items[index]);
  };

  const handleSave = () => {
    if (editingIndex !== null) {
      const newPinned = [...items];
      
      if (editingText.trim() === "") {
        // Remove if empty
        newPinned.splice(editingIndex, 1);
      } else {
        newPinned[editingIndex] = editingText.trim();
      }
      
      setPinned(newPinned);
      setEditingIndex(null);
      setEditingText("");
    }
  };

  const handleDelete = (index: number) => {
    const deletedPriority = items[index];
    const newPinned = items.filter((_, i) => i !== index);
    setPinned(newPinned);
    
    // Add to undo stack
    setUndoStack([...undoStack, {
      type: 'DELETE_PRIORITY',
      data: { priority: deletedPriority, index },
      timestamp: Date.now()
    }]);
  };

  const handleAdd = () => {
    const newPriority = "New priority";
    setPinned([...items, newPriority]);
    setEditingIndex(items.length);
    setEditingText(newPriority);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const lastAction = undoStack[undoStack.length - 1];
    
    if (lastAction.type === 'DELETE_PRIORITY') {
      const newPinned = [...items];
      newPinned.splice(lastAction.data.index, 0, lastAction.data.priority);
      setPinned(newPinned);
      setUndoStack(undoStack.slice(0, -1));
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
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      editingIndex={editingIndex}
                      editingText={editingText}
                      setEditingText={setEditingText}
                      handleSave={handleSave}
                      setEditingIndex={setEditingIndex}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
          
          {/* Add Area (shows label on hover, larger hit area) */}
          <div
            onClick={handleAdd}
            aria-label="Add priority"
            title="Add priority"
            className="w-full h-16 cursor-pointer group flex items-center justify-center hover:bg-white/30 rounded-lg transition-colors mt-2"
          >
            <span className="text-blue-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              + Add priority
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
